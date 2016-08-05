update scan set pieces=1;

update scan set pieces=0
from 
(select station_code, loin_number, count(*), max(timestamp)
from scan
where loin_number is not null
group by station_code, loin_number
HAVING count(*) > 1) scan1 
where scan1.loin_number = scan.loin_number and scan1.station_code = scan.station_code and scan1.max != scan.timestamp;


update scan set pieces=0
from 
(select station_code, box_number, count(*), max(timestamp)
from scan
where box_number is not null and loin_number is null
group by station_code, box_number
HAVING count(*) > 1) scan1 
where scan1.box_number = scan.box_number and scan1.station_code = scan.station_code and scan1.max != scan.timestamp;


CREATE OR REPLACE VIEW public.box_with_info AS 
 (SELECT box.box_number,
    box.case_number,
        CASE
            WHEN scan.station_code IS NOT NULL THEN scan.station_code
            ELSE box.station_code
        END AS station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.pieces,
    box.shipping_unit_number,
    box.shipping_unit_in,
    box.species,
        CASE
            WHEN box.supplier_code IS NOT NULL THEN box.supplier_code
            ELSE box.harvester_code
        END AS harvester_code,
        CASE
            WHEN scan."timestamp" IS NOT NULL THEN scan."timestamp"
            ELSE box."timestamp"
        END AS "timestamp",
        CASE
            WHEN box.internal_lot_code IS NOT NULL THEN box.internal_lot_code
            ELSE lot.internal_lot_code
        END AS internal_lot_code,
        CASE
            WHEN box.harvest_date IS NOT NULL THEN box.harvest_date
            ELSE lot.start_date
        END AS harvest_date,
    box.best_before_date,
    box.lot_in,
    shipping_unit.received_from,
    harvester.ft_fa_code,
    harvester.fleet,
    harvester.fishing_area,
    harvester.supplier_group,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    box.tf_code,
    product.handling AS product_handling,
    product.state AS product_state,
    product.best_before AS product_best_before,
    product.weight AS product_weight,
    product.entry_unit AS product_entry_unit,
    product.traceable AS product_traceable
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN (select * from scan where loin_number is null and pieces > 0) as scan ON box.box_number::text = scan.box_number::text
     LEFT JOIN shipping_unit ON box.shipping_unit_in::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text)

  union

  (SELECT box.box_number,
    box.case_number,
    box.station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.pieces,
    box.shipping_unit_number,
    box.shipping_unit_in,
    box.species,
        CASE
            WHEN box.supplier_code IS NOT NULL THEN box.supplier_code
            ELSE box.harvester_code
        END AS harvester_code,
    box."timestamp",
        CASE
            WHEN box.internal_lot_code IS NOT NULL THEN box.internal_lot_code
            ELSE lot.internal_lot_code
        END AS internal_lot_code,
        CASE
            WHEN box.harvest_date IS NOT NULL THEN box.harvest_date
            ELSE lot.start_date
        END AS harvest_date,
    box.best_before_date,
    box.lot_in,
    shipping_unit.received_from,
    harvester.ft_fa_code,
    harvester.fleet,
    harvester.fishing_area,
    harvester.supplier_group,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    box.tf_code,
    product.handling AS product_handling,
    product.state AS product_state,
    product.best_before AS product_best_before,
    product.weight AS product_weight,
    product.entry_unit AS product_entry_unit,
    product.traceable AS product_traceable
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON box.shipping_unit_in::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text
  where box.box_number not in (select box_number from scan where station_code = box.station_code and loin_number is null))
  ;

ALTER TABLE public.box_with_info
  OWNER TO tuna_processor;
