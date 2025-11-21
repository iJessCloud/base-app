-- Create watchlists table for storing user crypto watchlists
CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_id TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);

-- Insert demo data
INSERT INTO watchlists (user_id, coin_symbol, coin_id)
VALUES 
  ('demo-user', 'BTC', 'BTC-USD'),
  ('demo-user', 'ETH', 'ETH-USD'),
  ('demo-user', 'SOL', 'SOL-USD')
ON CONFLICT (user_id, coin_id) DO NOTHING;
