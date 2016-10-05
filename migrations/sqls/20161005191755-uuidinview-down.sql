drop view box_by_day;
drop view box_by_day_and_lot;
DROP VIEW public.lot_summary;
DROP VIEW public.totals_by_lot;
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
    box.lot_in,
    box.pdc,
    box.batchcode,
    box.pdc_text,
    box.country_origin,
    shipping_unit.received_from,
        CASE
            WHEN harvester.ft_fa_code IS NOT NULL AND harvester.ft_fa_code::text <> ''::text AND harvester.ft_fa_code::text <> 'NON FT'::text THEN harvester.ft_fa_code
            ELSE 'NFT'::character varying
        END AS ft_fa_code,
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
     LEFT JOIN ( SELECT scan_1.serial_id,
            scan_1.lot_number,
            scan_1.weight_1,
            scan_1.weight_2,
            scan_1.grade,
            scan_1."timestamp",
            scan_1.state,
            scan_1.station_code,
            scan_1.loin_number,
            scan_1.box_number,
            scan_1.shipping_unit_number,
            scan_1.internal_lot_code,
            scan_1.pieces,
            scan_1.species,
            scan_1.size,
            scan_1.weight
           FROM scan scan_1
          WHERE scan_1.loin_number IS NULL AND scan_1.pieces > 0) scan ON box.box_number::text = scan.box_number::text
     LEFT JOIN shipping_unit ON box.shipping_unit_in::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text
UNION
 SELECT box.box_number,
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
    box.pdc,
    box.batchcode,
    box.pdc_text,
    box.country_origin,
    shipping_unit.received_from,
        CASE
            WHEN harvester.ft_fa_code IS NOT NULL AND harvester.ft_fa_code::text <> ''::text AND harvester.ft_fa_code::text <> 'NON FT'::text THEN harvester.ft_fa_code
            ELSE 'NFT'::character varying
        END AS ft_fa_code,
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
  WHERE NOT (box.box_number::text IN ( SELECT scan.box_number
           FROM scan
          WHERE scan.station_code::text = box.station_code::text AND scan.loin_number IS NULL));

ALTER TABLE public.box_with_info
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
    box_with_info.grade,
    NULL::character varying AS species,
    NULL::character varying AS state,
    box_with_info.size,
    sum(box_with_info.pieces) AS pieces,
    count(box_with_info.box_number) AS boxes
   FROM box_with_info
  WHERE box_with_info.lot_number IS NOT NULL AND box_with_info.lot_number::text <> ''::text
  GROUP BY box_with_info.lot_number, box_with_info.station_code, box_with_info.grade, box_with_info.size
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


DROP VIEW public.box_totals;

CREATE OR REPLACE VIEW public.box_totals AS 
 SELECT count(box.box_number) AS boxes,
        CASE
            WHEN scan.station_code IS NOT NULL THEN scan.station_code
            ELSE box.station_code
        END AS station_code,
    box.lot_number,
    sum(box.weight) AS weight_1,
    box.size,
    box.grade,
    box.species,
    sum(box.pieces) AS pieces
   FROM box
     LEFT JOIN scan ON box.box_number::text = scan.box_number::text
  WHERE scan.pieces > 0
  GROUP BY scan.station_code, box.station_code, box.lot_number, box.size, box.grade, box.species;

ALTER TABLE public.box_totals
  OWNER TO tuna_processor;


  create view box_by_day as
select station_code, grade, size, species, 
batchcode, country_origin, pdc, case when tf_code='UNDEFINED' then null else tf_code end as tf_code,
product_type, product_weight, product_entry_unit,
sap_item_code, product_best_before, product_state,
sum(weight) as total_weight, sum(pieces) as total_pieces, 
date_trunc('day', timestamp) as day, count(*)
    from box_with_info
    group by
        date_trunc('day', timestamp),
        grade,
        size,
        species,
        station_code,
        batchcode, country_origin, pdc, (case when tf_code='UNDEFINED' then null else tf_code end) ,
product_type, product_weight, product_entry_unit,
sap_item_code, product_best_before, product_state
    order by station_code;

ALTER TABLE box_by_day
  OWNER TO tuna_processor;



create view box_by_day_and_lot as 
select internal_lot_code, lot_number, station_code, grade, size, species, 
batchcode, country_origin, pdc, case when tf_code='UNDEFINED' then null else tf_code end as tf_code,
product_type, product_weight, product_entry_unit,
sap_item_code, product_best_before, product_state,
sum(weight) as total_weight, sum(pieces) as total_pieces, 
date_trunc('day', timestamp) as day, count(*)
    from box_with_info
    group by
        date_trunc('day', timestamp),
        grade,
        size,
        species,
        station_code,
        batchcode, country_origin, pdc, (case when tf_code='UNDEFINED' then null else tf_code end) ,
product_type, product_weight, product_entry_unit,
sap_item_code, product_best_before, product_state, lot_number, internal_lot_code
    order by station_code;

ALTER TABLE box_by_day_and_lot
  OWNER TO tuna_processor;
