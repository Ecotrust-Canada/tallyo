drop view production_lot;


drop view harvester_lot;
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
    shipping_unit.po_number,
    shipping_unit.country_origin,
    lot.receive_date,
    thisfish.tf_code,
    harvester.fishery,
    harvester.tf_user,
    harvester.ft_fa_code,
    supplier.sap_code,
    supplier.name AS supplier_name,
    supplier.msc_code,
    supplier.supplier_code,
    l2.lot_number AS lot_in,
    l2.internal_lot_code AS ref_number,
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
     LEFT JOIN supplier ON lot.supplier_code::text = supplier.supplier_code::text
     LEFT JOIN lot_yield ON lot.lot_number::text = lot_yield.lot_number::text
     LEFT JOIN lot l2 ON lot.lot_in::text = l2.lot_number::text
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