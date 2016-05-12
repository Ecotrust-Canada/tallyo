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
    harvester.fishing_method,
    harvester.fisher,
    lot.shipping_unit_number,
    lot.processor_code,
    shipping_unit.received_from,
    shipping_unit.vessel_name,
    shipping_unit.po_number,
    shipping_unit.country_origin,
    shipping_unit.bill_of_lading,
    shipping_unit.container_number,
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




  create view production_lot as 

 SELECT 
 pro_lot.lot_number as production_lot,
 pro_lot.internal_lot_code as production_po_number,
 pro_lot.timestamp as pro_date,
 lot.lot_number,
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
    harvester.fishing_method,
    harvester.fisher,
    lot.shipping_unit_number,
    lot.processor_code,
    shipping_unit.received_from,
    shipping_unit.vessel_name,
    shipping_unit.po_number,
    shipping_unit.country_origin,
    shipping_unit.bill_of_lading,
    shipping_unit.container_number,
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
   FROM lot pro_lot
     left join lot on pro_lot.lot_in = lot.lot_number
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
          GROUP BY thisfish_1.lot_number, thisfish_1.label) thisfish ON lot.lot_number::text = thisfish.lot_number::text
  where pro_lot.lot_in is not null;


  alter view production_lot owner to tuna_processor;


  DROP VIEW public.scan_detail;

CREATE OR REPLACE VIEW public.scan_detail AS 
 SELECT scan.station_code,
    scan.lot_number,
    NULL::unknown AS spacer,
    scan.weight_1,
    scan.grade,
    scan."timestamp",
    scan.state,
    lot.internal_lot_code,
    harvester.fleet,
    harvester.landing_location,
    harvester.supplier,
    harvester.supplier_group,
    harvester.ft_fa_code,
    lot.start_date AS receive_date,
    harvester.fishing_area AS wpp,
    scan.species
   FROM scan,
    harvester,
    lot
  WHERE scan.lot_number::text = lot.lot_number::text AND lot.harvester_code::text = harvester.harvester_code::text;

ALTER TABLE public.scan_detail
  OWNER TO tuna_processor;


  -- View: public.totals_by_lot

DROP VIEW public.totals_by_lot;

CREATE OR REPLACE VIEW public.totals_by_lot AS 
 SELECT scan.lot_number,
    scan.station_code,
    sum(scan.weight_1) AS weight_1,
    scan.grade,
    scan.species,
    scan.state,
    NULL::character varying AS size,
    sum(scan.pieces) AS pieces,
    NULL::bigint AS boxes
   FROM scan
  WHERE scan.lot_number IS NOT NULL AND scan.lot_number::text <> ''::text AND scan.loin_number IS NULL AND scan.box_number IS NULL
  GROUP BY scan.lot_number, scan.station_code, scan.grade, scan.species, scan.state
UNION
 SELECT box_with_info.lot_number,
    box_with_info.station_code,
    sum(box_with_info.weight) AS weight_1,
        CASE
            WHEN box_with_info.grade IS NOT NULL THEN box_with_info.grade
            ELSE box_with_info.product_type
        END AS grade,
    NULL::character varying AS species,
    null as state,
    box_with_info.size,
    sum(box_with_info.pieces) AS pieces,
    count(box_with_info.box_number) AS boxes
   FROM box_with_info
  WHERE box_with_info.lot_number IS NOT NULL AND box_with_info.lot_number::text <> ''::text
  GROUP BY box_with_info.lot_number, box_with_info.station_code, box_with_info.grade, box_with_info.product_type, box_with_info.size
UNION
 SELECT loin_with_info.lot_number,
    loin_with_info.station_code,
    sum(loin_with_info.weight_1) AS weight_1,
    loin_with_info.grade,
    NULL::character varying AS species,
    null as state,
    NULL::character varying AS size,
    count(loin_with_info.loin_number) AS pieces,
    NULL::bigint AS boxes
   FROM loin_with_info
  WHERE loin_with_info.lot_number IS NOT NULL AND loin_with_info.lot_number::text <> ''::text AND NOT (loin_with_info.station_code::text IN ( SELECT scan.station_code
           FROM scan
          WHERE scan.box_number IS NOT NULL))
  GROUP BY loin_with_info.lot_number, loin_with_info.station_code, loin_with_info.grade
  ORDER BY 4;

ALTER TABLE public.totals_by_lot
  OWNER TO tuna_processor;
