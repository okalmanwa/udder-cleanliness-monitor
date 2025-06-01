-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert 5 test farms
INSERT INTO farms (id, name, code) VALUES
  (uuid_generate_v4(), 'Green Valley Farm', 'GVF001'),
  (uuid_generate_v4(), 'Sunny Meadows', 'SMF002'),
  (uuid_generate_v4(), 'Happy Cows Ranch', 'HCR003'),
  (uuid_generate_v4(), 'Golden Dairy Fields', 'GDF004'),
  (uuid_generate_v4(), 'Blue Ridge Dairy', 'BRD005');

-- Generate cows and udders for each farm
DO $$
DECLARE
  farm_rec RECORD;
  cow_count INT;
  cow_num INT;
  pos TEXT;
  positions TEXT[] := ARRAY['LF', 'RF', 'LR', 'RR'];
BEGIN
  FOR farm_rec IN SELECT * FROM farms LOOP
    -- Randomize cow count between 20 and 30
    cow_count := 20 + floor(random() * 11);
    FOR cow_num IN 1..cow_count LOOP
      FOREACH pos IN ARRAY positions LOOP
        INSERT INTO udders (id, farm_id, identifier, position, cow_number)
        VALUES (
          uuid_generate_v4(),
          farm_rec.id,
          farm_rec.code || '-C' || cow_num || '-' || pos,
          pos,
          cow_num
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Generate random examinations for each udder
DO $$
DECLARE
  udder_rec RECORD;
  exam_count INT;
  exam_num INT;
  exam_date TIMESTAMP;
BEGIN
  FOR udder_rec IN SELECT * FROM udders LOOP
    -- Randomize number of exams per udder (3 to 8)
    exam_count := 3 + floor(random() * 6);
    FOR exam_num IN 1..exam_count LOOP
      -- Random exam date in the last 2 years
      exam_date := NOW() - (interval '730 days' * random());
      INSERT INTO examinations (udder_id, score, exam_timestamp, position)
      VALUES (
        udder_rec.id,
        1 + floor(random() * 4), -- score 1-4
        exam_date,
        udder_rec.position
      );
    END LOOP;
  END LOOP;
END $$; 