drop view totals_by_lot;
drop view lot_summary;
drop view loin_scan;
CREATE OR REPLACE VIEW loin_scan AS 
 SELECT loin.loin_number,
    max(scan."timestamp") AS "timestamp",
    scan.box_number,
    loin.lot_number,
    loin.state,
    scan.station_code,
    loin.grade,
    loin.weight_1,
    lot.internal_lot_code,
    harvester.ft_fa_code
   FROM scan,
    loin,
    harvester,
    lot
  WHERE scan.loin_number::text = loin.loin_number::text
  and loin.lot_number = lot.lot_number
  and harvester.harvester_code = lot.harvester_code
  GROUP BY loin.loin_number, harvester.ft_fa_code, lot.internal_lot_code, scan.box_number, loin.state, loin.lot_number, loin.grade, loin.weight_1, scan.station_code;

ALTER TABLE loin_scan
  OWNER TO tuna_processor;


CREATE OR REPLACE VIEW lot_summary AS 
 SELECT scan.lot_number,
    scan.station_code,
    sum(scan.pieces) AS pieces,
    sum(scan.weight_1) AS weight_1,
    sum(scan.weight_2) AS weight_2,
    NULL::bigint AS boxes
   FROM scan
  WHERE scan.lot_number IS NOT NULL AND scan.lot_number::text <> ''::text AND scan.weight_1 IS NOT NULL
  GROUP BY scan.lot_number, scan.station_code
UNION
 SELECT box_scan.lot_number,
    box_scan.station_code,
    sum(box_scan.pieces) AS pieces,
    sum(box_scan.weight) AS weight_1,
    NULL::real AS weight_2,
    count(box_scan.box_number) AS boxes
   FROM box_scan
  WHERE box_scan.lot_number IS NOT NULL AND box_scan.lot_number::text <> ''::text
  GROUP BY box_scan.lot_number, box_scan.station_code
UNION
 SELECT loin_scan.lot_number,
    loin_scan.station_code,
    count(loin_scan.weight_1) AS pieces,
    sum(loin_scan.weight_1) AS weight_1,
    NULL::real AS weight_2,
    NULL::bigint AS boxes
   FROM loin_scan
  WHERE loin_scan.lot_number IS NOT NULL AND loin_scan.lot_number::text <> ''::text AND loin_scan.box_number IS NULL
  GROUP BY loin_scan.lot_number, loin_scan.station_code;

ALTER TABLE lot_summary
  OWNER TO tuna_processor;

 CREATE OR REPLACE VIEW totals_by_lot AS 
 SELECT scan.lot_number,
    scan.station_code,
    sum(scan.weight_1) AS weight_1,
    sum(scan.weight_2) AS weight_2,
    scan.grade,
    scan.state,
    sum(scan.pieces) AS pieces,
    NULL::bigint AS boxes,
    NULL::character varying AS trade_unit,
    NULL::character varying AS product_code,
    scan.species,
    scan.size
   FROM scan
  WHERE scan.lot_number IS NOT NULL AND scan.lot_number::text <> ''::text AND scan.loin_number IS NULL AND scan.box_number IS NULL
  GROUP BY scan.lot_number, scan.station_code, scan.species, scan.grade, scan.state, scan.size
UNION
 SELECT box_scan.lot_number,
    box_scan.station_code,
    sum(box_scan.weight) AS weight_1,
    NULL::real AS weight_2,
    box_scan.grade,
    NULL::character varying AS state,
    sum(box_scan.pieces) AS pieces,
    count(box_scan.box_number) AS boxes,
    box_scan.trade_unit,
    box_scan.product_code,
    box_scan.species,
    box_scan.size
   FROM box_scan
  WHERE box_scan.lot_number IS NOT NULL AND box_scan.lot_number::text <> ''::text
  GROUP BY box_scan.lot_number, box_scan.species, box_scan.trade_unit, box_scan.product_code, box_scan.station_code, box_scan.grade, box_scan.size
UNION
 SELECT loin_scan.lot_number,
    loin_scan.station_code,
    sum(loin_scan.weight_1) AS weight_1,
    NULL::real AS weight_2,
    loin_scan.grade,
    loin_scan.state,
    count(loin_scan.loin_number) AS pieces,
    NULL::bigint AS boxes,
    NULL::character varying AS trade_unit,
    NULL::character varying AS product_code,
    NULL::character varying AS species,
    NULL::character varying AS size
   FROM loin_scan
  WHERE loin_scan.lot_number IS NOT NULL AND loin_scan.lot_number::text <> ''::text AND loin_scan.box_number IS NULL
  GROUP BY loin_scan.lot_number, loin_scan.station_code, loin_scan.grade, loin_scan.state;

ALTER TABLE totals_by_lot
  OWNER TO tuna_processor;


drop view expandedlotlocations;
CREATE OR REPLACE VIEW expandedlotlocations AS 
 SELECT lot.lot_number,
    lot.internal_lot_code,
    harvester.ft_fa_code,
    harvester.supplier_group,
    harvester.supplier,
    harvester.fleet,
    harvester.fisher,
    harvester.fishery,
    harvester.tf_user,
    lot.end_date,
    lot.start_date,
    lotlocations.lot_number AS collectionid,
    lotlocations.station_code,
    lotlocations.in_progress,
    lotlocations.in_progress_date,
    lot."timestamp"
   FROM harvester,
    lot,
    lotlocations
  WHERE lot.lot_number::text = lotlocations.lot_number::text AND lot.harvester_code::text = harvester.harvester_code::text;

ALTER TABLE expandedlotlocations
  OWNER TO tuna_processor;

  alter table box add column internal_lot_code varchar;



