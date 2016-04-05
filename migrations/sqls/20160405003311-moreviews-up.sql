DROP VIEW box_product;

CREATE OR REPLACE VIEW box_product AS 
 SELECT box.box_number,
    box.case_number,
    scan.station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.shipping_unit_number,
    box.species,
    box.harvester_code,
    scan."timestamp",
    box.best_before_date,
    box.received_from,
    harvester.ft_fa_code,
    harvester.fleet,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    box.internal_lot_code
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code,
            max(timestamp) as timestamp
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON box.box_number::text = scan.box_number::text;

ALTER TABLE box_product
  OWNER TO tuna_processor;


  DROP VIEW box_inventory;

CREATE OR REPLACE VIEW box_inventory AS 
 SELECT t1.station_code,
    box.grade,
    box.size,
    product.product_type,
    count(box.box_number) AS boxes,
    sum(box.weight) AS weight_total
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN scan t1 ON box.box_number::text = t1.box_number::text
  WHERE NOT (EXISTS ( SELECT t2.box_number
           FROM scan t2
          WHERE t2.box_number::text = t1.box_number::text AND t2."timestamp" > t1."timestamp"))
  GROUP BY box.grade, box.size, product.product_type, t1.station_code
  order by box.size, box.grade;

ALTER TABLE box_inventory
  OWNER TO tuna_processor;
