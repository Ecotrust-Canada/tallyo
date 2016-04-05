drop view shipment_summary;
create view shipment_summary as 
SELECT shipping_unit.shipping_unit_number,
    box.grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    product.product_type
   FROM
    box
    left join
    (select box_number, station_code from scan
     group by box_number, station_code) as scan 
  on scan.box_number = box.box_number
  left join shipping_unit
  on box.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
  left join product
  on box.product_code = product.product_code
  GROUP BY shipping_unit.shipping_unit_number, box.grade, box.size, scan.station_code, product.product_type
  ORDER BY shipping_unit.shipping_unit_number;

  alter view shipment_summary owner to tuna_processor;



drop view shipment_summary_more;
create view shipment_summary_more as

  SELECT shipping_unit.shipping_unit_number,
    box.grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    product.product_type,
    box.harvester_code
   FROM
    box
    left join
    (select box_number, station_code from scan
     group by box_number, station_code) as scan 
  on scan.box_number = box.box_number
  left join shipping_unit
  on box.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
  left join product
  on box.product_code = product.product_code
  GROUP BY shipping_unit.shipping_unit_number, box.grade, box.size, scan.station_code, product.product_type, box.harvester_code
  ORDER BY shipping_unit.shipping_unit_number;
  
  alter view shipment_summary_more owner to tuna_processor;

  DROP VIEW box_inventory;


CREATE OR REPLACE VIEW box_inventory AS 

SELECT t1.station_code,
    box.grade,
    box.size,
    product.product_type,
    count(box.box_number) AS boxes,
    sum(box.weight) AS weight_total
   FROM box
   left join product
  on box.product_code = product.product_code
  left join
    scan t1
  on box.box_number::text = t1.box_number::text where NOT (EXISTS ( SELECT t2.box_number
           FROM scan t2
          WHERE t2.box_number::text = t1.box_number::text AND t2."timestamp" > t1."timestamp"))
  GROUP BY box.grade, box.size, product.product_type, t1.station_code;

  ALTER TABLE box_inventory
  OWNER TO tuna_processor;

  drop view box_sum;
create view box_sum as 
select 
scan.station_code,
box.lot_number,
box.shipping_unit_number,
box.box_number,
box.case_number,
box.timestamp,
box.weight as box_weight,
box.internal_lot_code as box_internal_lot_code,
h1.fleet,
box.pieces,
box.size,
h1.supplier_group,
h1.fishing_area as wpp,
box.best_before_date
from box, lot l1, harvester h1,
(select box_number, station_code from scan
group by box_number, station_code) as scan
where box.lot_number = l1.lot_number 
and l1.harvester_code = h1.harvester_code
and box.box_number = scan.box_number 
order by box_number;

alter view box_sum owner to tuna_processor;
