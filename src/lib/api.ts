const PROFILE_URL = 'https://functions.poehali.dev/cdcc17f6-2f25-4299-986b-c8847926781f';
const STATUSES_URL = 'https://functions.poehali.dev/3c94adcd-63c2-44ab-b19c-6b9a53e66680';

export const USER_ID = 'default_user';

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string;
  private_profile: boolean;
  hide_online: boolean;
  who_can_message: boolean;
  hide_status_views: boolean;
}

export async function fetchProfile(userId = USER_ID): Promise<Profile | null> {
  const res = await fetch(`${PROFILE_URL}/?user_id=${userId}`);
  const data = await res.json();
  return data.found ? data.profile : null;
}

export async function saveProfile(profile: Partial<Profile> & { user_id: string }): Promise<{ ok: boolean }> {
  const res = await fetch(`${PROFILE_URL}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return res.json();
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const b64 = await fileToBase64(file);
  const res = await fetch(`${PROFILE_URL}/avatar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, data: b64, mime: file.type }),
  });
  const data = await res.json();
  return data.avatar_url;
}

// ─── Statuses ─────────────────────────────────────────────────────────────────

export interface StatusItem {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  expires_at: string;
  created_at: string;
}

export interface StatusViewer {
  viewer_user_id: string;
  viewer_name: string;
  viewer_avatar: string;
  viewed_at: string;
}

export async function fetchStatuses(userId = USER_ID): Promise<StatusItem[]> {
  const res = await fetch(`${STATUSES_URL}/?user_id=${userId}`);
  const data = await res.json();
  return data.statuses ?? [];
}

export async function uploadStatusMedia(userId: string, file: File): Promise<{ media_url: string; media_type: 'image' | 'video' }> {
  const b64 = await fileToBase64(file);
  const res = await fetch(`${STATUSES_URL}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, data: b64, mime: file.type }),
  });
  return res.json();
}

export async function createStatus(userId: string, mediaUrl: string, mediaType: 'image' | 'video'): Promise<{ ok: boolean; status_id: string }> {
  const res = await fetch(`${STATUSES_URL}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, media_url: mediaUrl, media_type: mediaType }),
  });
  return res.json();
}

export async function fetchStatusViews(statusId: string): Promise<StatusViewer[]> {
  const res = await fetch(`${STATUSES_URL}/views?status_id=${statusId}`);
  const data = await res.json();
  return data.views ?? [];
}

export async function addStatusView(statusId: string, viewer: { user_id: string; name: string; avatar: string }): Promise<void> {
  await fetch(`${STATUSES_URL}/views`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status_id: statusId, viewer_user_id: viewer.user_id, viewer_name: viewer.name, viewer_avatar: viewer.avatar }),
  });
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
