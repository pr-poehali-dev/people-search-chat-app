"""
API профиля пользователя: получение, сохранение настроек, загрузка аватара.
GET  /?user_id=xxx        — получить профиль
POST /                    — сохранить настройки профиля
POST /avatar              — загрузить аватар (base64)
"""

import json
import os
import base64
import uuid
import psycopg2
import boto3

SCHEMA = 't_p96693984_people_search_chat_a'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')

    if path.endswith('/avatar') and method == 'POST':
        return upload_avatar(event)
    if method == 'GET':
        return get_profile(event)
    if method == 'POST':
        return save_profile(event)

    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}


def get_profile(event: dict) -> dict:
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id', 'default_user')

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f'SELECT id, user_id, name, username, bio, avatar_url, private_profile, hide_online, who_can_message, hide_status_views FROM {SCHEMA}.profiles WHERE user_id = %s',
        (user_id,)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'found': False, 'profile': None})
        }

    profile = {
        'id': row[0], 'user_id': row[1], 'name': row[2], 'username': row[3],
        'bio': row[4], 'avatar_url': row[5], 'private_profile': row[6],
        'hide_online': row[7], 'who_can_message': row[8], 'hide_status_views': row[9],
    }
    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'found': True, 'profile': profile})
    }


def save_profile(event: dict) -> dict:
    body = json.loads(event.get('body') or '{}')
    user_id = body.get('user_id', 'default_user')
    name = body.get('name', '')
    username = body.get('username', user_id)
    bio = body.get('bio', '')
    private_profile = bool(body.get('private_profile', False))
    hide_online = bool(body.get('hide_online', False))
    who_can_message = bool(body.get('who_can_message', True))
    hide_status_views = bool(body.get('hide_status_views', False))

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f'''INSERT INTO {SCHEMA}.profiles
            (user_id, name, username, bio, private_profile, hide_online, who_can_message, hide_status_views, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, now())
            ON CONFLICT (user_id) DO UPDATE SET
              name = EXCLUDED.name,
              username = EXCLUDED.username,
              bio = EXCLUDED.bio,
              private_profile = EXCLUDED.private_profile,
              hide_online = EXCLUDED.hide_online,
              who_can_message = EXCLUDED.who_can_message,
              hide_status_views = EXCLUDED.hide_status_views,
              updated_at = now()
            RETURNING id''',
        (user_id, name, username, bio, private_profile, hide_online, who_can_message, hide_status_views)
    )
    profile_id = cur.fetchone()[0]
    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'id': profile_id})
    }


def upload_avatar(event: dict) -> dict:
    body = json.loads(event.get('body') or '{}')
    user_id = body.get('user_id', 'default_user')
    data_b64 = body.get('data', '')
    mime = body.get('mime', 'image/jpeg')

    image_data = base64.b64decode(data_b64)
    ext = mime.split('/')[-1].replace('jpeg', 'jpg')
    key = f'avatars/{user_id}_{uuid.uuid4().hex[:8]}.{ext}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=image_data, ContentType=mime)
    avatar_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f'''INSERT INTO {SCHEMA}.profiles (user_id, name, username, avatar_url, updated_at)
            VALUES (%s, %s, %s, %s, now())
            ON CONFLICT (user_id) DO UPDATE SET avatar_url = EXCLUDED.avatar_url, updated_at = now()''',
        (user_id, user_id, user_id, avatar_url)
    )
    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'avatar_url': avatar_url})
    }
