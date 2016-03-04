alter table loin add column state varchar;



CREATE OR REPLACE VIEW loin_inventory AS 
 SELECT t1.station_code,
    loin.grade,
    loin.state,
    count(loin.loin_number) AS pieces,
    sum(loin.weight_1) AS weight_total
   FROM loin,
    scan t1
  WHERE loin.loin_number::text = t1.loin_number::text AND NOT (EXISTS ( SELECT t2.loin_number
           FROM scan t2
          WHERE t2.loin_number::text = t1.loin_number::text AND t2."timestamp" > t1."timestamp"))
          and loin.box_number is null
  GROUP BY loin.grade, t1.station_code, loin.state;

ALTER TABLE loin_inventory
  OWNER TO tuna_processor;
  
  
drop view box_inventory;

create view box_inventory as 
 SELECT t1.station_code,
    box.grade,
    box.weight,
    box.size,
    box.trade_unit,
    box.product_code,
    count(box.box_number) AS boxes,
    box.species,
    sum(box.weight) AS weight_total
   FROM box, scan t1
  WHERE box.box_number = t1.box_number 
  and NOT (EXISTS ( SELECT t2.box_number
           FROM scan t2
          WHERE t2.box_number::text = t1.box_number::text AND t2."timestamp" > t1."timestamp"))
  GROUP BY box.grade, box.weight, box.size, box.species, box.trade_unit, box.product_code, 
  t1.station_code;

  alter view box_inventory owner to tuna_processor;
