DROP VIEW tf_processor_many_product;

CREATE OR REPLACE VIEW tf_processor_many_product AS 
 SELECT lot.internal_lot_code,
    thisfish.tf_code,
    thisfish.product_code,
    product.state,
    product.handling,
    product.trade_unit,
    shipping_unit.received_from,
    sum(box.weight) AS amount,
    min(shipping_unit."timestamp")::timestamp without time zone::date AS receipt_date,
    lot."timestamp"::timestamp without time zone::date AS process_start,
    max(box."timestamp")::timestamp without time zone::date AS process_end
   FROM lot,
    thisfish,
    product,
    shipping_unit,
    box
  WHERE lot.lot_number::text = thisfish.lot_number::text AND thisfish.product_code::text = product.product_code::text AND lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text AND box.lot_number::text = thisfish.lot_number::text AND box.product_code::text = thisfish.product_code::text
  GROUP BY lot.internal_lot_code, thisfish.tf_code, thisfish.product_code, product.state, product.handling, product.trade_unit, shipping_unit.received_from, lot."timestamp";

ALTER TABLE tf_processor_many_product
  OWNER TO tuna_processor;

  

DROP VIEW incoming_codes;

CREATE OR REPLACE VIEW incoming_codes AS 
 SELECT lot.lot_number,
    lot.internal_lot_code,
    min(box.tf_code::text) AS tf_code,
    box.harvester_code,
    min(box.harvest_date)::timestamp without time zone::date AS start_date,
    max(box.harvest_date)::timestamp without time zone::date AS end_date
   FROM lot,
    box,
    harvester
  WHERE box.lot_number::text = lot.lot_number::text AND box.tf_code IS NOT NULL
  GROUP BY lot.lot_number, lot.internal_lot_code, box.harvester_code;

ALTER TABLE incoming_codes
  OWNER TO tuna_processor;






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
            WHEN thisfish.tf_code IS NOT NULL AND thisfish.har_response_status <> 201 OR thisfish.pro_response_status <> 201 THEN 'error'::text
            WHEN thisfish.tf_code IS NULL THEN 'no_trace'::text
            ELSE NULL::text
        END AS tf_submit
   FROM lot
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN ( SELECT thisfish_1.tf_code,
            thisfish_1.lot_number,
            thisfish_1.har_response_status,
            thisfish_1.pro_response_status,
            thisfish_1.product_code
           FROM thisfish thisfish_1
          WHERE thisfish_1.lot_number IS NOT NULL AND thisfish_1.label IS NULL
        UNION
         SELECT thisfish_1.label AS tf_code,
            thisfish_1.lot_number,
            NULL::integer AS har_response_status,
            NULL::integer AS pro_response_status,
            NULL::character varying AS product_code
           FROM thisfish thisfish_1
          WHERE thisfish_1.label IS NOT NULL AND thisfish_1.lot_number IS NOT NULL
          GROUP BY thisfish_1.lot_number, thisfish_1.label) thisfish ON lot.lot_number::text = thisfish.lot_number::text;

ALTER TABLE harvester_lot
  OWNER TO tuna_processor;

alter table box drop column yield;




drop view lot_yield;
