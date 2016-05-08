ALTER TABLE box ADD CONSTRAINT boxwp CHECK (weight >= 0);
ALTER TABLE box ADD CONSTRAINT boxpp CHECK (pieces >= 0);
ALTER TABLE loin ADD CONSTRAINT loinwp CHECK (weight_1 >= 0);
ALTER TABLE scan ADD CONSTRAINT scanw1p CHECK (weight_1 >= 0);
ALTER TABLE scan ADD CONSTRAINT scanw2p CHECK (weight_2 >= 0);
ALTER TABLE scan ADD CONSTRAINT scanpp CHECK (pieces >= 0);
