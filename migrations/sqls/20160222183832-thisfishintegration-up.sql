drop view totals_by_lot;
drop view lot_summary;
drop view loin_scan;
drop view loin_lot;
drop view expandedlotlocations;
drop view harvester_lot;

alter table harvester add column fishery varchar;
alter table harvester add column tf_user varchar;
alter table harvester add column traceable boolean default false;
alter table lot add column traceable boolean default false;

alter table lot add column receive_station varchar;
alter table lot add column process_station varchar;

alter table scan add column weight float;
ALTER TABLE harvester RENAME COLUMN fleet_vessel TO fleet;

alter table harvester add column vessel varchar;
alter table harvester add column fisher varchar;

alter table product add column trade_unit varchar;
alter table product add column weight float;
alter table product add column entry_unit varchar;

CREATE TABLE thisfish
(
  serial_id integer NOT NULL DEFAULT nextval('box_id_seq'::regclass),
  tf_code character varying,
  lot_number character varying,
  CONSTRAINT tf_pk PRIMARY KEY (serial_id),
  CONSTRAINT tflot FOREIGN KEY (lot_number)
      REFERENCES lot (lot_number) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE thisfish
  OWNER TO tuna_processor;
  

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
  
  
CREATE OR REPLACE VIEW loin_lot AS 
 SELECT loin.loin_number,
    loin.lot_number,
    lot.internal_lot_code,
    loin.station_code,
    loin."timestamp",
    loin.weight_1,
    loin.grade
   FROM loin,
    lot
  WHERE loin.lot_number::text = lot.lot_number::text;

ALTER TABLE loin_lot
  OWNER TO tuna_processor;
  
  
CREATE OR REPLACE VIEW loin_scan AS 
 SELECT loin.loin_number,
    max(scan."timestamp") AS "timestamp",
    scan.box_number,
    loin.lot_number,
    scan.station_code,
    loin.grade,
    loin.weight_1
   FROM scan,
    loin
  WHERE scan.loin_number::text = loin.loin_number::text
  GROUP BY loin.loin_number, scan.box_number, loin.lot_number, loin.grade, loin.weight_1, scan.station_code;

ALTER TABLE loin_scan
  OWNER TO tuna_processor;

CREATE OR REPLACE VIEW expandedlotlocations AS 
 SELECT lot.lot_number,
    lot.internal_lot_code,
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
  
  
CREATE OR REPLACE VIEW nextcode AS 
 SELECT thisfish.tf_code
   FROM thisfish
  WHERE thisfish.lot_number IS NULL
  ORDER BY thisfish.serial_id
 LIMIT 1;

ALTER TABLE nextcode
  OWNER TO tuna_processor;
  
  
CREATE OR REPLACE VIEW tf_harvester_entry AS 
 SELECT l.lot_number,
    h.tf_user AS "user",
    h.fishery,
    h.species_common AS fish,
    h.state AS product_state,
    h.handling,
    h.fishing_area AS stat_area,
    l.start_date::timestamp without time zone::date AS receipt_date,
    l.end_date::timestamp without time zone::date AS ship_date,
    h.landing_location,
    tf.tf_code AS start_tag,
    tf.tf_code AS end_tag,
    sum(scan.weight) AS amount
   FROM harvester h,
    lot l,
    thisfish tf,
    scan
  WHERE h.harvester_code::text = l.harvester_code::text AND l.lot_number::text = tf.lot_number::text 
  AND scan.station_code::text = l.receive_station::text AND scan.lot_number = l.lot_number 
  AND h.traceable = true
  GROUP BY h.tf_user, h.fishery, h.species_common, h.state, h.handling, h.fishing_area, l.start_date, l.end_date, h.landing_location, tf.tf_code, l.lot_number;

ALTER TABLE tf_harvester_entry
  OWNER TO tuna_processor;
  
  
CREATE OR REPLACE VIEW tf_processor_entry_simple AS 
 SELECT lot.lot_number AS lotnum,
    thisfish.tf_code AS start_trans,
    thisfish.tf_code AS end_trans,
    harvester.tf_user AS received_from_user,
    lot.end_date::timestamp without time zone::date AS receipt_date,
    lot.end_date::timestamp without time zone::date AS trans_date,
    max(box."timestamp")::timestamp without time zone::date AS trans_end_date,
    lot.internal_lot_code AS lot_number,
    thisfish.tf_code AS start_tag,
    thisfish.tf_code AS end_tag,
    product.state AS product_state,
    product.handling,
    product.trade_unit,
    sum(box.weight) AS amount
   FROM box,
    product,
    thisfish,
    lot,
    harvester
  WHERE box.product_code::text = product.product_code::text AND lot.lot_number::text = box.lot_number::text AND lot.lot_number::text = thisfish.lot_number::text AND lot.harvester_code::text = harvester.harvester_code::text AND box.lot_number IS NOT NULL
  GROUP BY box.product_code, box.lot_number, thisfish.tf_code, harvester.tf_user, lot.end_date, lot.internal_lot_code, product.state, product.handling, product.trade_unit, lot.lot_number;

ALTER TABLE tf_processor_entry_simple
  OWNER TO tuna_processor;
  
  
  
 CREATE OR REPLACE FUNCTION harvester_name()
  RETURNS trigger AS
$BODY$
    BEGIN
        IF NEW.fleet IS NULL AND NEW.fisher IS NULL THEN
            NEW.tf_user := NULL;
        END IF;
        IF NEW.fleet IS NOT NULL AND NEW.fisher IS NULL THEN
            NEW.tf_user := NEW.fleet;
        END IF;
        IF NEW.fisher IS NOT NULL THEN
            NEW.tf_user := NEW.fisher;
        END IF;
        RETURN NEW;
    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION harvester_name()
  OWNER TO tuna_processor;

CREATE TRIGGER harvester_name BEFORE INSERT OR UPDATE ON harvester
  FOR EACH ROW EXECUTE PROCEDURE harvester_name();

update harvester set fleet = fleet;
  
  CREATE OR REPLACE FUNCTION scan_weight()
  RETURNS trigger AS
$BODY$
    BEGIN
        IF NEW.weight_1 IS NULL AND NEW.weight_2 IS NULL THEN
            NEW.weight := NULL;
        END IF;
        IF NEW.weight_1 IS NOT NULL AND NEW.weight_2 IS NULL THEN
            NEW.weight := NEW.weight_1;
        END IF;
        IF NEW.weight_2 IS NOT NULL THEN
            NEW.weight := NEW.weight_2;
        END IF;
        RETURN NEW;
    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION scan_weight()
  OWNER TO tuna_processor;

CREATE TRIGGER scan_weight BEFORE INSERT OR UPDATE ON scan
    FOR EACH ROW EXECUTE PROCEDURE scan_weight();

update scan set weight_2 = weight_2;
