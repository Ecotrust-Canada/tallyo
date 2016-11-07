DROP VIEW public.totals_by_lot;
  DROP VIEW public.lot_summary;
DROP VIEW public.loin_with_info;

CREATE OR REPLACE VIEW public.loin_with_info AS 
 SELECT scan.station_code,
    loin.lot_number,
    loin.loin_number,
    loin.box_number,
    loin.state,
    loin.state AS type,
    loin.weight_1,
    loin.weight_1 AS weight,
    loin.grade,
    loin.species,
        CASE
            WHEN scan."timestamp" IS NOT NULL THEN scan."timestamp"
            ELSE loin."timestamp"
        END AS "timestamp",
    lot.internal_lot_code,
    harvester.fleet,
    harvester.landing_location,
    harvester.supplier,
    harvester.supplier_group,
    harvester.ft_fa_code,
    lot.start_date AS receive_date,
    harvester.fishing_area AS wpp
   FROM loin
     LEFT JOIN lot ON lot.lot_number::text = loin.lot_number::text
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN scan ON scan.loin_number::text = loin.loin_number::text
  WHERE scan.pieces > 0;

ALTER TABLE public.loin_with_info
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
