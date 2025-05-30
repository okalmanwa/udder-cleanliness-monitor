-- Create examinations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'examinations') THEN
        CREATE TABLE examinations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            udder_id UUID REFERENCES udders(id),
            score INTEGER CHECK (score BETWEEN 1 AND 4),
            position VARCHAR(20) NOT NULL,
            exam_timestamp TIMESTAMPTZ DEFAULT NOW(),
            images TEXT[]
        );
    END IF;
END $$;

-- Add position column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'examinations' 
        AND column_name = 'position'
    ) THEN
        ALTER TABLE examinations ADD COLUMN position VARCHAR(20) NOT NULL DEFAULT 'LF';
    END IF;
END $$;

-- Insert test examinations only if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM examinations LIMIT 1) THEN
        INSERT INTO examinations (udder_id, score, position, images)
        SELECT 
            u.id,
            FLOOR(RANDOM() * 4 + 1)::INTEGER,
            CASE FLOOR(RANDOM() * 4)::INTEGER
                WHEN 0 THEN 'LF'
                WHEN 1 THEN 'RF'
                WHEN 2 THEN 'LR'
                ELSE 'RR'
            END,
            ARRAY['https://example.com/test-image-1.jpg', 'https://example.com/test-image-2.jpg']
        FROM udders u
        CROSS JOIN generate_series(1, 2) num;
    END IF;
END $$; 