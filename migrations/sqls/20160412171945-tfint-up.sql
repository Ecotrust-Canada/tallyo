CREATE OR REPLACE VIEW tf_processor_one_product AS 
 SELECT lot.lot_number AS lotnum,
    thisfish.tf_code AS start_trans,
    thisfish.tf_code AS end_trans,
    harvester.tf_user AS received_from_user,
    lot.end_date::timestamp without time zone::date AS receipt_date,
    lot.end_date::timestamp without time zone::date AS trans_date,
    max(box."timestamp")::timestamp without time zone::date AS trans_end_date,
    lot.internal_lot_code AS lot_number,
    thisfish.tf_code AS start_tag,
    thisfish.tf_code AS end_tag,
    sum(box.weight) AS amount
   FROM box,
    thisfish,
    lot,
    harvester
  WHERE lot.lot_number::text = box.lot_number::text AND lot.lot_number::text = thisfish.lot_number::text AND lot.harvester_code::text = harvester.harvester_code::text AND box.lot_number IS NOT NULL
  GROUP BY box.lot_number, thisfish.tf_code, harvester.tf_user, lot.end_date, lot.internal_lot_code, lot.lot_number;

ALTER TABLE tf_processor_one_product
  OWNER TO tuna_processor;


  alter table box add column tf_code character varying;



CREATE OR REPLACE VIEW box_with_info AS 
 SELECT box.box_number,
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
    box.harvester_code,
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
    shipping_unit.received_from,
    harvester.ft_fa_code,
    harvester.fleet,
    harvester.fishing_area,
    harvester.supplier_group,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    box.tf_code
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code,
            max(scan_1."timestamp") AS "timestamp"
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON box.box_number::text = scan.box_number::text
     LEFT JOIN shipping_unit ON box.shipping_unit_in::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text;

ALTER TABLE box_with_info
  OWNER TO tuna_processor;



create view incoming_codes as 

select 
lot.lot_number, 
lot.internal_lot_code,
min(box.tf_code) as tf_code,
box.harvester_code,
min(box.harvest_date)::timestamp without time zone::date as start_date,
max(box.harvest_date)::timestamp without time zone::date as end_date
from lot, box, harvester
where box.lot_number = lot.lot_number
and box.tf_code is not null
group by lot.lot_number, lot.internal_lot_code, box.harvester_code;

alter view incoming_codes owner to tuna_processor;



create view tf_processor_many_product as
select
lot.internal_lot_code,
thisfish.tf_code,
thisfish.product_code,
product.state,
product.handling,
product.trade_unit,
shipping_unit.received_from,
sum(box.weight) as amount,
min(shipping_unit.timestamp)::timestamp without time zone::date as receipt_date,
lot.timestamp::timestamp without time zone::date as process_start,
max(box.timestamp)::timestamp without time zone::date as process_end
from lot, thisfish, product, shipping_unit, box
where lot.lot_number = thisfish.lot_number
and thisfish.product_code = product.product_code
and lot.shipping_unit_number = shipping_unit.shipping_unit_number
and box.lot_number = thisfish.lot_number
and box.product_code = thisfish.product_code
group by
lot.internal_lot_code,
thisfish.tf_code,
thisfish.product_code,
product.state,
product.handling,
product.trade_unit,
shipping_unit.received_from,
lot.timestamp;


alter view tf_processor_many_product owner to tuna_processor;



DROP VIEW harvester_lot;

create view harvester_lot as
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
            WHEN thisfish.tf_code IS NOT NULL AND thisfish.har_response_status <> 201 OR thisfish.pro_response_status <> 201 THEN 'error'::text
            WHEN thisfish.tf_code IS NULL THEN 'no_trace'::text
            ELSE NULL::text
        END AS tf_submit
   FROM lot
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN ( 

select tf_code, lot_number, har_response_status, pro_response_status, product_code
from thisfish where lot_number is not null and label is null
union
select label as tf_code, lot_number, null as har_response_status, null as pro_response_status, null as product_code
from thisfish where label is not null and lot_number is not null
group by lot_number, label) as thisfish ON lot.lot_number::text = thisfish.lot_number::text;



     

ALTER TABLE harvester_lot
  OWNER TO tuna_processor;
