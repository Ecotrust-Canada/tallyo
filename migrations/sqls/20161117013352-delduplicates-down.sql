ALTER TABLE box drop CONSTRAINT box_uuid;


ALTER TABLE scan drop CONSTRAINT box_shipment;


ALTER TABLE scan drop CONSTRAINT loin_box;

drop index box_lot;
