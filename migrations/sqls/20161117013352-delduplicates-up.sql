delete from scan where box_number in(
(select box_number from box b1 
where exists (select * from box b2 where b2.box_number != b1.box_number and 
b1.uuid_from_label = b2.uuid_from_label and b2.shipping_unit_number is null
and b1.shipping_unit_number is null and b1.timestamp < b2.timestamp))
union
(select box_number from box b1 
where exists (select * from box b2 where b2.box_number != b1.box_number and 
b1.uuid_from_label = b2.uuid_from_label and b2.shipping_unit_number is not null))
);

delete from box where box_number in(
(select box_number from box b1 
where exists (select * from box b2 where b2.box_number != b1.box_number and 
b1.uuid_from_label = b2.uuid_from_label and b2.shipping_unit_number is null
and b1.shipping_unit_number is null and b1.timestamp < b2.timestamp))
union
(select box_number from box b1 
where exists (select * from box b2 where b2.box_number != b1.box_number and 
b1.uuid_from_label = b2.uuid_from_label and b2.shipping_unit_number is not null))
);

ALTER TABLE box ADD CONSTRAINT box_uuid UNIQUE (uuid_from_label);


delete from scan s1
where exists (select * from scan s2 where s2.box_number is not null and s2.shipping_unit_number is not null 
and s2.box_number = s1.box_number and s2.station_code = s1.station_code and 
s1.shipping_unit_number = s2.shipping_unit_number and s1.timestamp < s2.timestamp);

ALTER TABLE scan ADD CONSTRAINT box_shipment UNIQUE (box_number, shipping_unit_number, station_code);


delete from scan s1
where exists (select * from scan s2 where s2.box_number is not null and s2.loin_number is not null 
and s2.box_number = s1.box_number and s2.station_code = s1.station_code and 
s1.loin_number = s2.loin_number and s1.timestamp < s2.timestamp);

ALTER TABLE scan ADD CONSTRAINT loin_box UNIQUE (loin_number, box_number, station_code);

delete from scan s1
where exists (select * from scan s2 where s2.box_number is not null and s2.lot_number is not null 
and s2.box_number = s1.box_number and s2.station_code = s1.station_code and s2.pieces = s1.pieces and 
s1.lot_number = s2.lot_number and s1.timestamp < s2.timestamp);

CREATE UNIQUE INDEX box_lot ON scan (lot_number, box_number, station_code)
where pieces=1;
