-- View: public.harvester_lot

CREATE OR REPLACE VIEW public.box_with_info AS 
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

ALTER TABLE public.box_with_info
  OWNER TO tuna_processor;


  

alter table box drop constraint supbox;

  alter table box drop column supplier_code;

DROP VIEW public.harvester_lot;

CREATE OR REPLACE VIEW public.harvester_lot AS 
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
    lot_yield.yield_by_pieces,
    lot_yield.total_yield,
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
     LEFT JOIN lot_yield ON lot.lot_number::text = lot_yield.lot_number::text
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

ALTER TABLE public.harvester_lot
  OWNER TO tuna_processor;

  alter table lot drop constraint suplot;

  alter table lot drop column supplier_code;

  drop table supplier;
