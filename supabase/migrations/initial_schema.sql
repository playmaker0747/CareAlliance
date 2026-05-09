-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create symptom_sessions table
CREATE TABLE IF NOT EXISTS symptom_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    age_group TEXT NOT NULL,
    primary_symptom TEXT NOT NULL,
    duration TEXT NOT NULL,
    severity TEXT NOT NULL,
    red_flags JSONB DEFAULT '[]'::jsonb NOT NULL,
    recommendation TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disclaimer_text TEXT NOT NULL DEFAULT 'This tool provides guidance only and does not replace a licensed medical professional.',
    emergency_message TEXT NOT NULL DEFAULT 'Call emergency services or go to the nearest hospital immediately.'
);

-- Insert a default row for app_settings if it doesn't exist
INSERT INTO app_settings (disclaimer_text, emergency_message)
SELECT 'This tool provides guidance only and does not replace a licensed medical professional.', 'Call emergency services or go to the nearest hospital immediately.'
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

-- Enable Row Level Security (RLS) for security best practices
ALTER TABLE symptom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts to symptom_sessions (anyone can create a session)
CREATE POLICY "Allow public insert to symptom_sessions" 
ON symptom_sessions FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow anonymous reads from app_settings
CREATE POLICY "Allow public read of app_settings" 
ON app_settings FOR SELECT 
TO public 
USING (true);
