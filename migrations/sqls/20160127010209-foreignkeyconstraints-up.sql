/* Replace with your SQL commands */
ALTER TABLE lot ADD CONSTRAINT ulot UNIQUE (lot_number);
ALTER TABLE box ADD CONSTRAINT ubox UNIQUE (box_number);
ALTER TABLE harvester ADD CONSTRAINT uharvester UNIQUE (harvester_code);
ALTER TABLE shipping_unit ADD CONSTRAINT uship UNIQUE (shipping_unit_number);
ALTER TABLE product ADD CONSTRAINT uproduct UNIQUE (product_code);
ALTER TABLE loin ADD CONSTRAINT uloin UNIQUE (loin_number);


ALTER TABLE box ADD CONSTRAINT boxlot FOREIGN KEY (lot_number) REFERENCES lot (lot_number);
ALTER TABLE box ADD CONSTRAINT boxharvester FOREIGN KEY (harvester_code) REFERENCES harvester (harvester_code);
ALTER TABLE box ADD CONSTRAINT boxship FOREIGN KEY (shipping_unit_number) REFERENCES shipping_unit (shipping_unit_number);
ALTER TABLE box ADD CONSTRAINT boxproduct FOREIGN KEY (product_code) REFERENCES product (product_code);

ALTER TABLE loin ADD CONSTRAINT loinlot FOREIGN KEY (lot_number) REFERENCES lot (lot_number);
ALTER TABLE loin ADD CONSTRAINT loinbox FOREIGN KEY (box_number) REFERENCES box (box_number);

ALTER TABLE lot ADD CONSTRAINT lotharvester FOREIGN KEY (harvester_code) REFERENCES harvester (harvester_code);
ALTER TABLE lot ADD CONSTRAINT lotship FOREIGN KEY (shipping_unit_number) REFERENCES shipping_unit (shipping_unit_number);

ALTER TABLE scan ADD CONSTRAINT scanlot FOREIGN KEY (lot_number) REFERENCES lot (lot_number);
ALTER TABLE scan ADD CONSTRAINT scanship FOREIGN KEY (shipping_unit_number) REFERENCES shipping_unit (shipping_unit_number);
ALTER TABLE scan ADD CONSTRAINT scanbox FOREIGN KEY (box_number) REFERENCES box (box_number);
ALTER TABLE scan ADD CONSTRAINT scanloin FOREIGN KEY (loin_number) REFERENCES loin (loin_number);
