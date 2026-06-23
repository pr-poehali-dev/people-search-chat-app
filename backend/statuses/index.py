"""
API статусов: создание, получение, загрузка медиа, просмотры.
GET  /?user_id=xxx            — получить активные статусы пользователя
POST /                        — создать статус (media_url уже загружен)
POST /media                   — загрузить фото/видео, получить URL
GET  /views?status_id=xxx     — список тех, кто смотрел статус
POST /views                   — отметить просмотр статуса
"""

import json
import os
import base64
import uuid
import psycopg2
import boto3
from datetime import datetime, timezone

SCHEMA = 't_p96693984_people_search_chat_a'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    params = event.get('queryStringParameters') or {}

    if path.endswith('/media') and method == 'POST':
        return upload_media(event)
    if path.endswith('/views'):
        if method == 'GET':
            return get_views(event)
        if method == 'POST':
            return add_view(event)
    if method == 'GET':
        return get_statuses(event)
    if method == 'POST':
        return create_status(event)

    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}


def get_statuses(event: dict) -> dict:
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id', 'default_user')

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f'''SELECT id, user_id, media_url, media_type, expires_at, created_at
            FROM {SCHEMA}.statuses
            WHERE user_id = %s AND expires_at > now()
            ORDER BY created_at DESC''',
        (user_id,)
    )
    rows = cur.fetchall()
    conn.close()

    statuses = [
        {
            'id': r[0], 'user_id': r[1], 'media_url': r[2],
            'media_type': r[3], 'expires_at': r[4].isoformat(), 'created_at': r[5].isoformat()
        }
        for r in rows
    ]
    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'statuses': statuses})
    }


def create_status(event: dict) -> dict:
    body = json.loads(event.get('body') or '{}')
    user_id = body.get('user_id', 'default_user')
    media_url = body.get('media_url', '')
    media_type = body.get('media_type', 'image')

    if media_type not in ('image', 'video'):
        media_type = 'image'

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f'''INSERT INTO {SCHEMA}.statuses (user_id, media_url, media_type)
            VALUES (%s, %s, %s) RETURNING id''',
        (user_id, media_url, media_type)
    )
    status_id = cur.fetchone()[0]
    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'status_id': status_id})
    }


def upload_media(event: dict) -> dict:
    body = json.loads(event.get('body') or '{}')
    user_id = body.get('user_id', 'default_user')
    data_b64 = body.get('data', '')
    mime = body.get('mime', 'image/jpeg')

    media_data = base64.b64decode(data_b64)
    is_video = mime.startswith('video')
    ext = mime.split('/')[-1].replace('jpeg', 'jpg').replace('quicktime', 'mov')
    key = f'statuses/{user_id}_{uuid.uuid4().hex[:10]}.{ext}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=media_data, ContentType=mime)
    media_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'ok': True,
            'media_url': media_url,
            'media_type': 'video' if is_video else 'image'
        })
    }


def get_views(event: dict) -> dict:
    params = event.get('queryStringParameters') or {}
    status_id = params.get('status_id', '')

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f'''SELECT viewer_user_id, viewer_name, viewer_avatar, viewed_at
            FROM {SCHEMA}.status_views
            WHERE status_id = %s
            ORDER BY viewed_at DESC''',
        (status_id,)
    )
    rows = cur.fetchall()
    conn.close()

    views = [
        {
            'viewer_user_id': r[0], 'viewer_name': r[1],
            'viewer_avatar': r[2], 'viewed_at': r[3].isoformat()
        }
        for r in rows
    ]
    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'views': views, 'count': len(views)})
    }


def add_view(event: dict) -> dict:
    body = json.loads(event.get('body') or '{}')
    status_id = body.get('status_id', '')
    viewer_user_id = body.get('viewer_user_id', '')
    viewer_name = body.get('viewer_name', '')
    viewer_avatar = body.get('viewer_avatar', '')

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f'''INSERT INTO {SCHEMA}.status_views (status_id, viewer_user_id, viewer_name, viewer_avatar)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (status_id, viewer_user_id) DO UPDATE SET viewed_at = now()''',
        (status_id, viewer_user_id, viewer_name, viewer_avatar)
    )
    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True})
    }
