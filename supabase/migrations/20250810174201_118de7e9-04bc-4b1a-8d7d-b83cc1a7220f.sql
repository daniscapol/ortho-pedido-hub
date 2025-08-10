-- Drop the incorrect foreign key constraint
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_filial_id_fkey;

-- Add the correct foreign key constraint pointing to filiais table
ALTER TABLE patients ADD CONSTRAINT patients_filial_id_fkey 
FOREIGN KEY (filial_id) REFERENCES filiais(id);