-- Create udders table
CREATE TABLE udders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id),
    identifier VARCHAR(10) NOT NULL,
    position VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(farm_id, identifier)
);

-- Insert test udders for each farm
INSERT INTO udders (farm_id, identifier, position)
SELECT 
    f.id,
    f.code || '-U' || num,
    CASE 
        WHEN num % 4 = 0 THEN 'LF'
        WHEN num % 4 = 1 THEN 'RF'
        WHEN num % 4 = 2 THEN 'LR'
        ELSE 'RR'
    END
FROM farms f
CROSS JOIN generate_series(1, 4) num; 