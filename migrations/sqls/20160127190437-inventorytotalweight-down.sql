/* Replace with your SQL commands */
DROP VIEW box_inventory;
 CREATE OR REPLACE VIEW 
box_inventory AS
 SELECT t1.station_code,
    t1.grade,
    t1.weight,
    t1.size,
    t1.trade_unit,
    t1.product_code,
    count(t1.station_code) AS boxes,
    t1.species
   FROM box_scan t1
  WHERE NOT (EXISTS ( SELECT t2.box_number,
            t2.case_number,
            t2.weight,
            t2.size,
            t2.grade,
            t2.lot_number,
            t2."timestamp",
            t2.best_before_date,
            t2.pieces,
            t2.shipping_unit_number,
            t2.station_code,
            t2.harvester_code,
            t2.lot,
            t2.trade_unit,
            t2.product_code
           FROM box_scan t2
          WHERE t2.box_number::text = t1.box_number::text AND 
t2."timestamp" > t1."timestamp"))
  GROUP BY t1.grade, t1.weight, t1.size, t1.species, t1.trade_unit, 
t1.product_code, t1.station_code; ALTER TABLE box_inventory
  OWNER TO tuna_processor;
