drop trigger scan_weight on scan;
drop trigger harvester_name on harvester;

drop view tf_processor_entry_simple;
drop view tf_harvester_entry;
drop view nextcode;
drop view totals_by_lot;
drop view lot_summary;
drop view loin_scan;
drop view loin_lot;
drop view expandedlotlocations;
drop view harvester_lot;

drop table thisfish;


alter table harvester drop column tf_user;
alter table harvester drop column fishery;
alter table harvester drop column traceable;
alter table lot drop column traceable;

alter table lot drop column receive_station;
alter table lot drop column process_station;

alter table scan drop column weight;
ALTER TABLE harvester RENAME COLUMN fleet TO fleet_vessel;

alter table harvester drop column vessel;
alter table harvester drop column fisher;

alter table product drop column trade_unit;
alter table product drop column weight;
alter table product drop column entry_unit;


CREATE OR REPLACE VIEW harvester_lot AS 
 SELECT lot.lot_number,
    lot.start_date,
    lot.end_date,
    lot.harvester_code,
    lot.internal_lot_code,
    harvester.species_common,
    harvester.species_latin,
    harvester.state,
    harvester.handling,
    harvester.supplier,
    harvester.fleet_vessel,
    harvester.fishing_area,
    harvester.fishing_method,
    harvester.landing_location,
    harvester.country_origin,
    harvester.country_production,
    harvester.fair_trade,
    harvester.supplier_group,
    lot.shipping_unit_number,
    lot.processor_code,
    lot."timestamp",
    shipping_unit.received_from,
    shipping_unit.vessel_name
   FROM lot
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text;

ALTER TABLE harvester_lot
  OWNER TO tuna_processor;
  
  
CREATE OR REPLACE VIEW loin_lot AS 
 SELECT loin.loin_number,
    loin.lot_number,
    harvester_lot.internal_lot_code,
    harvester_lot.supplier_group,
    harvester_lot.supplier,
    harvester_lot.fleet_vessel,
    loin.station_code,
    loin."timestamp",
    loin.weight_1,
    loin.grade,
    loin.box_number
   FROM loin,
    harvester_lot
  WHERE loin.lot_number::text = harvester_lot.lot_number::text;

ALTER TABLE loin_lot
  OWNER TO tuna_processor;
  
CREATE OR REPLACE VIEW loin_scan AS 
 SELECT loin_lot.loin_number,
    max(scan."timestamp") AS "timestamp",
    scan.box_number,
    loin_lot.lot_number,
    scan.station_code,
    loin_lot.grade,
    loin_lot.weight_1,
    loin_lot.internal_lot_code
   FROM scan,
    loin_lot
  WHERE scan.loin_number::text = loin_lot.loin_number::text
  GROUP BY loin_lot.loin_number, scan.box_number, loin_lot.lot_number, loin_lot.grade, loin_lot.weight_1, scan.station_code, loin_lot.internal_lot_code;

ALTER TABLE loin_scan
  OWNER TO tuna_processor;
  
CREATE OR REPLACE VIEW expandedlotlocations AS 
 SELECT harvester_lot.lot_number,
    harvester_lot.internal_lot_code,
    harvester_lot.supplier_group,
    harvester_lot.supplier,
    harvester_lot.fleet_vessel,
    harvester_lot.end_date,
    harvester_lot.start_date,
    lotlocations.lot_number AS collectionid,
    lotlocations.station_code,
    lotlocations.in_progress,
    lotlocations.in_progress_date,
    harvester_lot."timestamp"
   FROM harvester_lot,
    lotlocations
  WHERE harvester_lot.lot_number::text = lotlocations.lot_number::text;

ALTER TABLE expandedlotlocations
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
    sum(scan.weight_1) AS weight1,
    sum(scan.weight_2) AS weight2,
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
    sum(box_scan.weight) AS weight1,
    NULL::real AS weight2,
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
    sum(loin_scan.weight_1) AS weight1,
    NULL::real AS weight2,
    loin_scan.grade,
    NULL::character varying AS state,
    count(loin_scan.loin_number) AS pieces,
    NULL::bigint AS boxes,
    NULL::character varying AS trade_unit,
    NULL::character varying AS product_code,
    NULL::character varying AS species,
    NULL::character varying AS size
   FROM loin_scan
  WHERE loin_scan.lot_number IS NOT NULL AND loin_scan.lot_number::text <> ''::text AND loin_scan.box_number IS NULL
  GROUP BY loin_scan.lot_number, loin_scan.station_code, loin_scan.grade;

ALTER TABLE totals_by_lot
  OWNER TO tuna_processor;
