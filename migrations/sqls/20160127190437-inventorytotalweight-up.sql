/* Replace with your SQL commands */
CREATE OR REPLACE VIEW box_inventory AS 
SELECT t1.station_code,
    t1.grade,
    t1.weight,
    t1.size,
    t1.trade_unit,
    t1.product_code,
    count(t1.station_code) AS boxes,
    t1.species,
    sum(t1.weight) as weight_total
   FROM box_scan t1
  WHERE NOT (EXISTS ( SELECT t2.box_number
           FROM box_scan t2
          WHERE t2.box_number::text = t1.box_number::text AND t2."timestamp" > t1."timestamp"))
  GROUP BY t1.grade, t1.weight, t1.size, t1.species, t1.trade_unit, t1.product_code, t1.station_code;

ALTER TABLE box_inventory
  OWNER TO tuna_processor;
