CREATE TABLE IF NOT EXISTS t_p96693984_people_search_chat_a.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  private_profile BOOLEAN DEFAULT false,
  hide_online BOOLEAN DEFAULT false,
  who_can_message BOOLEAN DEFAULT true,
  hide_status_views BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS t_p96693984_people_search_chat_a.statuses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS t_p96693984_people_search_chat_a.status_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  status_id TEXT NOT NULL REFERENCES t_p96693984_people_search_chat_a.statuses(id),
  viewer_user_id TEXT NOT NULL,
  viewer_name TEXT NOT NULL DEFAULT '',
  viewer_avatar TEXT NOT NULL DEFAULT '',
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (status_id, viewer_user_id)
);

CREATE INDEX IF NOT EXISTS idx_statuses_user_id ON t_p96693984_people_search_chat_a.statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_status_views_status_id ON t_p96693984_people_search_chat_a.status_views(status_id);
