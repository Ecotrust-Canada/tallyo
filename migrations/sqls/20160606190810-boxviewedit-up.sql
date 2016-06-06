DROP VIEW public.totals_by_lot;

DROP VIEW public.today_total_ship;

DROP VIEW public.today_total_lot;

DROP VIEW public.production_lot;

DROP VIEW public.harvester_lot;

DROP VIEW public.lot_yield;

DROP VIEW public.lot_summary;

DROP VIEW public.inventory_detail;

DROP VIEW public.inventory_all;

DROP VIEW public.box_with_info;

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
    product.handling as product_handling,
    product.state as product_state,
    product.best_before as product_best_before,
    product.weight as product_weight,
    product.entry_unit as product_entry_unit,
    product.traceable as product_traceable
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

CREATE OR REPLACE VIEW public.inventory_all AS 
 SELECT t1.box_number,
    t1.case_number,
    t1.station_code,
    t1.lot_number,
    t1.weight,
    t1.size,
    t1.grade,
    t1.pieces,
    t1.shipping_unit_number,
    t1.shipping_unit_in,
    t1.species,
    t1.harvester_code,
    t1."timestamp",
    t1.internal_lot_code,
    t1.harvest_date,
    t1.best_before_date,
    t1.received_from,
    t1.ft_fa_code,
    t1.fleet,
    t1.fishing_area,
    t1.supplier_group,
    t1.product_code,
    t1.product_type,
    t1.trade_unit,
    t1.sap_item_code,
    t1.tf_code,
    t1.product_handling,
    t1.product_state,
    t1.product_best_before,
    t1.product_weight,
    t1.product_entry_unit,
    t1.product_traceable
   FROM box_with_info t1
  WHERE NOT (EXISTS ( SELECT t2.box_number
           FROM scan t2
          WHERE t2.box_number::text = t1.box_number::text AND t2."timestamp" > t1."timestamp"))
  ORDER BY t1.station_code;

ALTER TABLE public.inventory_all
  OWNER TO tuna_processor;

CREATE OR REPLACE VIEW public.inventory_detail AS 
 SELECT box_detail.station_code,
    box_detail.lot_number,
    box_detail.shipping_unit_number,
    box_detail.box_number,
    box_detail.case_number,
    box_detail."timestamp",
    box_detail.box_weight,
    box_detail.box_grade,
    box_detail.box_internal_lot_code,
    box_detail.fleet,
    box_detail.pieces,
    box_detail.size,
    box_detail.supplier_group,
    box_detail.wpp,
    box_detail.best_before_date,
    box_detail.loins,
    box_detail.loin_number,
    box_detail.loin_weight,
    box_detail.loin_grade,
    box_detail.supplier,
    box_detail.loin_internal_lot_code,
    box_detail.ft_fa_code,
    box_detail.landing_location,
    box_detail.receive_date
   FROM box_detail
  WHERE (box_detail.box_number::text IN ( SELECT inventory_all.box_number
           FROM inventory_all));

ALTER TABLE public.inventory_detail
  OWNER TO tuna_processor;

CREATE OR REPLACE VIEW public.lot_summary AS 
 SELECT scan.lot_number,
    scan.station_code,
    sum(scan.pieces) AS pieces,
    sum(scan.weight_1) AS weight_1,
    NULL::bigint AS boxes
   FROM scan
  WHERE scan.lot_number IS NOT NULL AND scan.lot_number::text <> ''::text AND scan.weight_1 IS NOT NULL
  GROUP BY scan.lot_number, scan.station_code
UNION
 SELECT box_with_info.lot_number,
    box_with_info.station_code,
    sum(box_with_info.pieces) AS pieces,
    sum(box_with_info.weight) AS weight_1,
    count(box_with_info.box_number) AS boxes
   FROM box_with_info
  WHERE box_with_info.lot_number IS NOT NULL AND box_with_info.lot_number::text <> ''::text
  GROUP BY box_with_info.lot_number, box_with_info.station_code
UNION
 SELECT loin_with_info.lot_number,
    loin_with_info.station_code,
    count(loin_with_info.loin_number) AS pieces,
    sum(loin_with_info.weight_1) AS weight_1,
    NULL::bigint AS boxes
   FROM loin_with_info
  WHERE loin_with_info.lot_number IS NOT NULL AND loin_with_info.lot_number::text <> ''::text AND NOT (loin_with_info.station_code::text IN ( SELECT scan.station_code
           FROM scan
          WHERE scan.box_number IS NOT NULL))
  GROUP BY loin_with_info.lot_number, loin_with_info.station_code;

ALTER TABLE public.lot_summary
  OWNER TO tuna_processor;



CREATE OR REPLACE VIEW public.lot_yield AS 
 SELECT process.process_weight,
    process.process_pieces,
    receive.receive_weight,
    receive.receive_pieces,
    process.process_weight / process.process_pieces::double precision AS weight_pro,
    receive.receive_weight / receive.receive_pieces::double precision AS weight_rec,
    process.process_weight / process.process_pieces::double precision / (receive.receive_weight / receive.receive_pieces::double precision) AS yield_by_pieces,
    process.process_weight / receive.receive_weight AS total_yield,
    process.lot_number
   FROM ( SELECT sum(lot_summary.weight_1) AS process_weight,
            sum(lot_summary.pieces) AS process_pieces,
            lot.lot_number
           FROM lot_summary,
            lot
          WHERE lot_summary.lot_number::text = lot.lot_number::text AND lot_summary.station_code::text = lot.process_station::text
          GROUP BY lot.lot_number) process,
    ( SELECT sum(lot_summary.weight_1) AS receive_weight,
            sum(lot_summary.pieces) AS receive_pieces,
            lot.lot_number
           FROM lot_summary,
            lot
          WHERE lot_summary.lot_number::text = lot.lot_number::text AND lot_summary.station_code::text = lot.receive_station::text
          GROUP BY lot.lot_number) receive
  WHERE process.lot_number::text = receive.lot_number::text;

ALTER TABLE public.lot_yield
  OWNER TO tuna_processor;



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



CREATE OR REPLACE VIEW public.production_lot AS 
 SELECT pro_lot.lot_number AS production_lot,
    pro_lot.internal_lot_code AS production_po_number,
    pro_lot."timestamp" AS pro_date,
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
     LEFT JOIN lot ON pro_lot.lot_in::text = lot.lot_number::text
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
  WHERE pro_lot.lot_in IS NOT NULL;

ALTER TABLE public.production_lot
  OWNER TO tuna_processor;



CREATE OR REPLACE VIEW public.today_total_lot AS 
 SELECT box_with_info.lot_number,
    box_with_info.internal_lot_code,
    count(box_with_info.box_number) AS boxes,
    box_with_info.station_code
   FROM box_with_info
  WHERE box_with_info."timestamp"::date = now()::date
  GROUP BY box_with_info.station_code, box_with_info.lot_number, box_with_info.internal_lot_code
  ORDER BY box_with_info.station_code;

ALTER TABLE public.today_total_lot
  OWNER TO tuna_processor;

CREATE OR REPLACE VIEW public.today_total_ship AS 
 SELECT box_with_info.shipping_unit_in,
    box_with_info.received_from,
    box_with_info.harvester_code,
    box_with_info.fleet,
    count(box_with_info.box_number) AS boxes,
    box_with_info.station_code
   FROM box_with_info
  WHERE box_with_info."timestamp"::date = now()::date
  GROUP BY box_with_info.shipping_unit_in, box_with_info.harvester_code, box_with_info.station_code, box_with_info.received_from, box_with_info.fleet
  ORDER BY box_with_info.station_code;

ALTER TABLE public.today_total_ship
  OWNER TO tuna_processor;

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
    NULL::character varying AS state,
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
    NULL::character varying AS state,
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
