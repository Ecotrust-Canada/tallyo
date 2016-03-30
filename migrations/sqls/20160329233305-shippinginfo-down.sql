DROP VIEW shipment_summary;

CREATE OR REPLACE VIEW shipment_summary AS 
 SELECT shipping_unit.shipping_unit_number,
    box_scan.grade,
    box_scan.size,
    sum(box_scan.weight) AS weight,
    count(box_scan.weight) AS boxes,
    box_scan.species
   FROM shipping_unit,
    box_scan
  WHERE box_scan.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
  GROUP BY shipping_unit.shipping_unit_number, box_scan.grade, box_scan.size, box_scan.species
  ORDER BY shipping_unit.shipping_unit_number;

ALTER TABLE shipment_summary
  OWNER TO tuna_processor;



DROP VIEW shipment_summary_more;

CREATE OR REPLACE VIEW shipment_summary_more AS 
 SELECT shipping_unit.shipping_unit_number,
    box_scan.harvester_code,
    box_scan.grade,
    box_scan.size,
    box_scan.trade_unit,
    box_scan.product_code,
    sum(box_scan.weight) AS weight,
    count(box_scan.box_number) AS boxes,
    box_scan.species
   FROM shipping_unit,
    box_scan
  WHERE box_scan.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
  GROUP BY shipping_unit.shipping_unit_number, box_scan.grade, box_scan.species, box_scan.size, box_scan.trade_unit, box_scan.product_code, box_scan.harvester_code
  ORDER BY shipping_unit.shipping_unit_number;

ALTER TABLE shipment_summary_more
  OWNER TO tuna_processor;
