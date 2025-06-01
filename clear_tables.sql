-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear tables in reverse order of dependencies
DELETE FROM udder_images;
DELETE FROM udder_examinations;
DELETE FROM udders;
DELETE FROM cows;
DELETE FROM farms;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1; 