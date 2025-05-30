-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create farms table
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);

-- Insert test farms
INSERT INTO farms (name, code) VALUES
    ('Green Valley Dairy', 'GVD001'),
    ('Sunny Meadows Farm', 'SMF002'),
    ('Blue Ridge Cattle', 'BRC003'); 