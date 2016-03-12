  
DROP VIEW box_product;

drop VIEW group_codes;

ALTER TABLE thisfish drop CONSTRAINT tfprod;

alter table thisfish drop column product_code;
alter table thisfish drop column label;
alter table thisfish drop column timestamp;

alter table box drop column receive_code;

drop TABLE receive_lot;
