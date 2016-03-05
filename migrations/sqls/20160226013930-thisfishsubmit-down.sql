drop view box_product;

alter table product drop column traceable;


DROP VIEW harvester_lot;

CREATE OR REPLACE VIEW harvester_lot AS 
 SELECT lot.lot_number,
    lot.start_date,
    lot.end_date,
    lot."timestamp",
    lot.harvester_code,
    lot.internal_lot_code,
    harvester.species_common,
    harvester.state,
    harvester.handling,
    harvester.supplier,
    harvester.landing_location,
    harvester.fair_trade,
    harvester.supplier_group,
    harvester.fleet,
    harvester.fisher,
    lot.shipping_unit_number,
    lot.processor_code,
    shipping_unit.received_from,
    shipping_unit.vessel_name,
    thisfish.tf_code,
    harvester.fishery,
    harvester.tf_user
   FROM lot
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN thisfish ON lot.lot_number::text = thisfish.lot_number::text;

ALTER TABLE harvester_lot
  OWNER TO tuna_processor;



alter table thisfish drop column har_response_status;
alter table thisfish drop column har_response_data;
alter table thisfish drop column pro_response_status;
alter table thisfish drop column pro_response_data;


DROP VIEW totals_by_lot;

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



alter table box add column internal_lot_code varchar;
