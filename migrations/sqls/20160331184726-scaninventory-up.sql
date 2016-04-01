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
from box, harvester h1,
(select box_number, station_code from scan
group by box_number, station_code) as scan
where box.harvester_code = h1.harvester_code
and box.box_number = scan.box_number 
order by box_number;

alter view box_sum owner to tuna_processor;


DROP VIEW harvester_lot;

CREATE OR REPLACE VIEW harvester_lot AS 
 SELECT lot.lot_number,
    lot.start_date,
    lot.end_date,
    lot."timestamp",
    lot.harvester_code,
    lot.internal_lot_code,
    harvester.species_common,
    harvester.fair_trade,
    harvester.supplier_group,
    harvester.landing_location,
    harvester.supplier,
    harvester.fleet,
    harvester.fishing_area,
    harvester.fisher,
    lot.shipping_unit_number,
    lot.processor_code,
    shipping_unit.received_from,
    shipping_unit.vessel_name,
    thisfish.tf_code,
    harvester.fishery,
    harvester.tf_user,
    harvester.ft_fa_code,
        CASE
            WHEN thisfish.tf_code IS NOT NULL AND thisfish.har_response_status IS NULL AND thisfish.pro_response_status IS NULL THEN 'submit'::text
            WHEN thisfish.tf_code IS NOT NULL AND thisfish.har_response_status = 201 AND thisfish.pro_response_status = 201 THEN 'success'::text
            WHEN thisfish.tf_code IS NULL THEN 'no_trace'::text
            ELSE NULL::text
        END AS tf_submit
   FROM lot
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN thisfish ON lot.lot_number::text = thisfish.lot_number::text;

ALTER TABLE harvester_lot
  OWNER TO tuna_processor;



  alter table box add column harvest_date timestamp;

ALTER TABLE box
    ALTER COLUMN harvest_date TYPE timestamp with time zone;



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
    box."timestamp",
    box.best_before_date,
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
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON box.box_number::text = scan.box_number::text;

ALTER TABLE box_product
  OWNER TO tuna_processor;


DROP VIEW shipment_summary;

CREATE OR REPLACE VIEW shipment_summary AS 
 SELECT scan.shipping_unit_number,
    box.grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    product.product_type
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code,
            scan_1.shipping_unit_number
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code, scan_1.shipping_unit_number) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY scan.shipping_unit_number, box.grade, box.size, scan.station_code, product.product_type
  ORDER BY scan.shipping_unit_number;

ALTER TABLE shipment_summary
  OWNER TO tuna_processor;


  DROP VIEW shipment_summary_more;

CREATE OR REPLACE VIEW shipment_summary_more AS 
 SELECT scan.shipping_unit_number,
    box.grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    product.product_type,
    box.harvester_code
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code,
            scan_1.shipping_unit_number
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code, scan_1.shipping_unit_number) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY scan.shipping_unit_number, box.grade, box.size, scan.station_code, product.product_type, box.harvester_code
  ORDER BY scan.shipping_unit_number;

ALTER TABLE shipment_summary_more
  OWNER TO tuna_processor;



  DROP VIEW expandedlotlocations;

CREATE OR REPLACE VIEW expandedlotlocations AS 
 SELECT lot.lot_number,
    lot.internal_lot_code,
    harvester.ft_fa_code,
    harvester.supplier_group,
    harvester.supplier,
    harvester.fleet,
    harvester.fisher,
    harvester.fishery,
    harvester.landing_location,
    harvester.tf_user,
    lot.end_date,
    lot.start_date,
    lotlocations.lot_number AS collectionid,
    lotlocations.station_code,
    lotlocations.in_progress,
    lotlocations.in_progress_date,
    lot."timestamp",
    shipping_unit.received_from
   FROM lotlocations
   left join lot
   on lot.lot_number::text = lotlocations.lot_number::text
   left join harvester
   on lot.harvester_code::text = harvester.harvester_code::text
   left join shipping_unit
   on lot.shipping_unit_number = shipping_unit.shipping_unit_number;

ALTER TABLE expandedlotlocations
  OWNER TO tuna_processor;
