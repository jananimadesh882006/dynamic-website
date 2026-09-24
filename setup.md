-- Create the songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since this is a simple demo)
-- Allow public read access
CREATE POLICY "Allow public read access" ON songs
  FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON songs
  FOR INSERT WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Allow public update access" ON songs
  FOR UPDATE USING (true);

-- Allow public delete access
CREATE POLICY "Allow public delete access" ON songs
  FOR DELETE USING (true);
