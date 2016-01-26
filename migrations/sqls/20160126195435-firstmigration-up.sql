SET statement_timeout = 0; SET lock_timeout = 0; SET client_encoding = 'UTF8'; SET 
standard_conforming_strings = on; SET check_function_bodies = false; SET 
client_min_messages = warning; CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA 
pg_catalog; COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language'; SET 
search_path = public, pg_catalog; SET default_tablespace = ''; SET default_with_oids = 
false; CREATE TABLE box (
    serial_id integer NOT NULL,
    case_number character varying,
    weight double precision,
    size character varying,
    grade character varying,
    lot_number character varying,
    "timestamp" timestamp with time zone,
    best_before_date date,
    pieces integer,
    station_code character varying,
    box_number character varying,
    harvester_code character varying,
    shipping_unit_number character varying,
    received_from character varying,
    internal_lot_code character varying,
    trade_unit character varying,
    product_code character varying,
    lot character varying,
    species character varying ); ALTER TABLE public.box OWNER TO tuna_processor; CREATE 
SEQUENCE box_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1; ALTER TABLE public.box_id_seq OWNER TO tuna_processor; ALTER SEQUENCE 
box_id_seq OWNED BY box.serial_id; CREATE TABLE scan (
    serial_id integer NOT NULL,
    lot_number character varying,
    weight_1 real,
    weight_2 real,
    grade character varying,
    "timestamp" timestamp with time zone,
    state character varying,
    station_code character varying,
    loin_number character varying,
    box_number character varying,
    shipping_unit_number character varying,
    internal_lot_code character varying,
    pieces integer DEFAULT 1,
    species character varying,
    size character varying ); ALTER TABLE public.scan OWNER TO tuna_processor; CREATE 
VIEW box_scan AS
 SELECT box.box_number,
    box.case_number,
    box.weight,
    box.size,
    box.grade,
    box.lot_number,
    max(scan."timestamp") AS "timestamp",
    box.best_before_date,
    box.pieces,
    box.shipping_unit_number,
    scan.station_code,
    box.harvester_code,
    box.lot,
    box.trade_unit,
    box.product_code,
    box.species
   FROM box,
    scan
  WHERE ((box.box_number)::text = (scan.box_number)::text)
  GROUP BY box.box_number, box.species, box.product_code, box.trade_unit, 
box.case_number, box.weight, box.size, box.grade, box.lot, box.best_before_date, 
box.pieces, box.shipping_unit_number, scan.station_code, box.harvester_code, 
box.lot_number; ALTER TABLE public.box_scan OWNER TO tuna_processor; CREATE VIEW 
box_inventory AS
 SELECT t1.station_code,
    t1.grade,
    t1.weight,
    t1.size,
    t1.trade_unit,
    t1.product_code,
    count(t1.station_code) AS boxes,
    t1.species
   FROM box_scan t1
  WHERE (NOT (EXISTS ( SELECT t2.box_number,
            t2.case_number,
            t2.weight,
            t2.size,
            t2.grade,
            t2.lot_number,
            t2."timestamp",
            t2.best_before_date,
            t2.pieces,
            t2.shipping_unit_number,
            t2.station_code,
            t2.harvester_code,
            t2.lot,
            t2.trade_unit,
            t2.product_code
           FROM box_scan t2
          WHERE (((t2.box_number)::text = (t1.box_number)::text) AND (t2."timestamp" > 
t1."timestamp")))))
  GROUP BY t1.grade, t1.weight, t1.size, t1.species, t1.trade_unit, t1.product_code, 
t1.station_code; ALTER TABLE public.box_inventory OWNER TO tuna_processor; CREATE TABLE 
harvester (
    serial_id integer NOT NULL,
    species_common character varying,
    species_latin character varying,
    state character varying,
    handling character varying,
    supplier character varying,
    fleet_vessel character varying,
    fishing_area character varying,
    fishing_method character varying,
    landing_location character varying,
    country_origin character varying,
    country_production character varying,
    fair_trade boolean,
    ft_fa_code character varying,
    supplier_group character varying,
    processor_code character varying,
    harvester_code character varying,
    active boolean ); ALTER TABLE public.harvester OWNER TO tuna_processor; CREATE TABLE 
lot (
    lot_number character varying,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    internal_lot_code character varying,
    "timestamp" timestamp with time zone,
    serial_id integer NOT NULL,
    station_code character varying,
    harvester_code character varying,
    shipping_unit_number character varying,
    processor_code character varying ); ALTER TABLE public.lot OWNER TO tuna_processor; 
CREATE TABLE shipping_unit (
    serial_id integer NOT NULL,
    po_number character varying,
    customer character varying,
    bill_of_lading character varying,
    vessel_name character varying,
    container_number character varying,
    "timestamp" timestamp with time zone,
    received_from character varying,
    station_code character varying,
    shipping_unit_number character varying,
    seal_number character varying ); ALTER TABLE public.shipping_unit OWNER TO 
tuna_processor; CREATE VIEW harvester_lot AS
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
    shipping_unit."timestamp",
    shipping_unit.received_from,
    shipping_unit.vessel_name
   FROM ((lot
     LEFT JOIN harvester ON (((lot.harvester_code)::text = 
(harvester.harvester_code)::text)))
     LEFT JOIN shipping_unit ON (((lot.shipping_unit_number)::text = 
(shipping_unit.shipping_unit_number)::text))); ALTER TABLE public.harvester_lot OWNER TO 
tuna_processor; CREATE TABLE lotlocations (
    collectionid character varying,
    station_code character varying,
    in_progress boolean,
    in_progress_date timestamp with time zone ); ALTER TABLE public.lotlocations OWNER TO 
tuna_processor; CREATE VIEW expandedlotlocations AS
 SELECT harvester_lot.lot_number,
    harvester_lot.internal_lot_code,
    harvester_lot.supplier_group,
    harvester_lot.supplier,
    harvester_lot.fleet_vessel,
    harvester_lot.end_date,
    harvester_lot.start_date,
    lotlocations.collectionid,
    lotlocations.station_code,
    lotlocations.in_progress,
    lotlocations.in_progress_date
   FROM harvester_lot,
    lotlocations
  WHERE ((harvester_lot.lot_number)::text = (lotlocations.collectionid)::text); ALTER 
TABLE public.expandedlotlocations OWNER TO tuna_processor; CREATE TABLE formoptions (
    table_name character varying,
    field_name character varying,
    value character varying ); ALTER TABLE public.formoptions OWNER TO tuna_processor; 
CREATE TABLE loin (
    serial_id integer NOT NULL,
    "timestamp" timestamp with time zone,
    lot_number character varying,
    station_code character varying,
    weight_1 real,
    grade character varying,
    loin_number character varying,
    box_number character varying,
    internal_lot_code character varying ); ALTER TABLE public.loin OWNER TO 
tuna_processor; CREATE SEQUENCE loin_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1; ALTER TABLE public.loin_id_seq OWNER TO tuna_processor; ALTER SEQUENCE 
loin_id_seq OWNED BY loin.serial_id; CREATE VIEW loin_lot AS
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
  WHERE ((loin.lot_number)::text = (harvester_lot.lot_number)::text); ALTER TABLE 
public.loin_lot OWNER TO tuna_processor; CREATE VIEW loin_scan AS
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
  WHERE ((scan.loin_number)::text = (loin_lot.loin_number)::text)
  GROUP BY loin_lot.loin_number, scan.box_number, loin_lot.lot_number, loin_lot.grade, 
loin_lot.weight_1, scan.station_code, loin_lot.internal_lot_code; ALTER TABLE 
public.loin_scan OWNER TO tuna_processor; CREATE VIEW lot_aggregated AS
 SELECT foo.lot_number,
    array_to_string(array_agg(foo.station_code), ','::text) AS stations
   FROM ( SELECT scan.lot_number,
            scan.station_code,
            max(scan."timestamp") AS "timestamp"
           FROM scan
          WHERE (scan.lot_number IS NOT NULL)
          GROUP BY scan.station_code, scan.lot_number
        UNION
         SELECT loin.lot_number,
            scan.station_code,
            max(scan."timestamp") AS "timestamp"
           FROM scan,
            loin
          WHERE ((scan.loin_number)::text = (loin.loin_number)::text)
          GROUP BY scan.station_code, loin.lot_number
        UNION
         SELECT box.lot_number,
            scan.station_code,
            max(scan."timestamp") AS "timestamp"
           FROM scan,
            box
          WHERE ((scan.box_number)::text = (box.box_number)::text)
          GROUP BY scan.station_code, box.lot_number
        UNION
         SELECT lotlocations.collectionid,
            lotlocations.station_code,
            lotlocations.in_progress_date
           FROM lotlocations
  ORDER BY 1, 3) foo
  GROUP BY foo.lot_number; ALTER TABLE public.lot_aggregated OWNER TO tuna_processor; 
CREATE SEQUENCE lot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1; ALTER TABLE public.lot_id_seq OWNER TO tuna_processor; ALTER SEQUENCE 
lot_id_seq OWNED BY lot.serial_id; CREATE VIEW lot_summary AS
 SELECT scan.lot_number,
    scan.station_code,
    sum(scan.pieces) AS pieces,
    sum(scan.weight_1) AS weight_1,
    sum(scan.weight_2) AS weight_2,
    NULL::bigint AS boxes
   FROM scan
  WHERE (((scan.lot_number IS NOT NULL) AND ((scan.lot_number)::text <> ''::text)) AND 
(scan.weight_1 IS NOT NULL))
  GROUP BY scan.lot_number, scan.station_code UNION
 SELECT box_scan.lot_number,
    box_scan.station_code,
    sum(box_scan.pieces) AS pieces,
    sum(box_scan.weight) AS weight_1,
    NULL::real AS weight_2,
    count(box_scan.box_number) AS boxes
   FROM box_scan
  WHERE ((box_scan.lot_number IS NOT NULL) AND ((box_scan.lot_number)::text <> ''::text))
  GROUP BY box_scan.lot_number, box_scan.station_code UNION
 SELECT loin_scan.lot_number,
    loin_scan.station_code,
    count(loin_scan.weight_1) AS pieces,
    sum(loin_scan.weight_1) AS weight_1,
    NULL::real AS weight_2,
    NULL::bigint AS boxes
   FROM loin_scan
  WHERE (((loin_scan.lot_number IS NOT NULL) AND ((loin_scan.lot_number)::text <> 
''::text)) AND (loin_scan.box_number IS NULL))
  GROUP BY loin_scan.lot_number, loin_scan.station_code; ALTER TABLE public.lot_summary 
OWNER TO tuna_processor; CREATE TABLE processor (
    serial_id integer NOT NULL,
    name character varying,
    processor_code character varying ); ALTER TABLE public.processor OWNER TO 
tuna_processor; CREATE TABLE product (
    serial_id integer NOT NULL,
    product_type character varying,
    handling character varying,
    state character varying,
    sap_item_code character varying,
    product_code character varying,
    best_before interval ); ALTER TABLE public.product OWNER TO tuna_processor; CREATE 
SEQUENCE product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1; ALTER TABLE public.product_id_seq OWNER TO tuna_processor; ALTER SEQUENCE 
product_id_seq OWNED BY product.serial_id; CREATE SEQUENCE scan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1; ALTER TABLE public.scan_id_seq OWNER TO tuna_processor; ALTER SEQUENCE 
scan_id_seq OWNED BY scan.serial_id; CREATE VIEW select_lot AS
 SELECT lot_aggregated.lot_number,
    lot_aggregated.stations,
    harvester_lot.internal_lot_code,
    harvester_lot.supplier_group,
    harvester_lot.supplier,
    harvester_lot.fleet_vessel,
    harvester_lot.start_date,
    harvester_lot.end_date,
    harvester_lot.processor_code,
    harvester_lot.shipping_unit_number,
    harvester_lot.received_from,
    harvester_lot.vessel_name,
    harvester_lot.country_origin
   FROM (lot_aggregated
     LEFT JOIN harvester_lot ON (((lot_aggregated.lot_number)::text = 
(harvester_lot.lot_number)::text)))
  WHERE (lot_aggregated.lot_number IS NOT NULL); ALTER TABLE public.select_lot OWNER TO 
tuna_processor; CREATE VIEW shipment_summary AS
 SELECT shipping_unit.shipping_unit_number,
    box_scan.grade,
    box_scan.size,
    sum(box_scan.weight) AS weight,
    count(box_scan.weight) AS boxes,
    box_scan.species
   FROM shipping_unit,
    box_scan
  WHERE ((box_scan.shipping_unit_number)::text = 
(shipping_unit.shipping_unit_number)::text)
  GROUP BY shipping_unit.shipping_unit_number, box_scan.grade, box_scan.size, 
box_scan.species
  ORDER BY shipping_unit.shipping_unit_number; ALTER TABLE public.shipment_summary OWNER 
TO tuna_processor; CREATE VIEW shipment_summary_more AS
 SELECT shipping_unit.shipping_unit_number,
    box_scan.harvester_code,
    box_scan.grade,
    box_scan.size,
    box_scan.trade_unit,
    box_scan.product_code,
    sum(box_scan.weight) AS weight,
    count(box_scan.box_number) AS boxes,
    box_scan.species
   FROM shipping_unit,
    box_scan
  WHERE ((box_scan.shipping_unit_number)::text = 
(shipping_unit.shipping_unit_number)::text)
  GROUP BY shipping_unit.shipping_unit_number, box_scan.grade, box_scan.species, 
box_scan.size, box_scan.trade_unit, box_scan.product_code, box_scan.harvester_code
  ORDER BY shipping_unit.shipping_unit_number; ALTER TABLE public.shipment_summary_more 
OWNER TO tuna_processor; CREATE SEQUENCE shipping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1; ALTER TABLE public.shipping_id_seq OWNER TO tuna_processor; ALTER SEQUENCE 
shipping_id_seq OWNED BY shipping_unit.serial_id; CREATE SEQUENCE source_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1; ALTER TABLE public.source_id_seq OWNER TO tuna_processor; ALTER SEQUENCE 
source_id_seq OWNED BY processor.serial_id; CREATE SEQUENCE supplier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1; ALTER TABLE public.supplier_id_seq OWNER TO tuna_processor; ALTER SEQUENCE 
supplier_id_seq OWNED BY harvester.serial_id; CREATE VIEW totals_by_lot AS
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
  WHERE ((((scan.lot_number IS NOT NULL) AND ((scan.lot_number)::text <> ''::text)) AND 
(scan.loin_number IS NULL)) AND (scan.box_number IS NULL))
  GROUP BY scan.lot_number, scan.station_code, scan.species, scan.grade, scan.state, 
scan.size UNION
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
  WHERE ((box_scan.lot_number IS NOT NULL) AND ((box_scan.lot_number)::text <> ''::text))
  GROUP BY box_scan.lot_number, box_scan.species, box_scan.trade_unit, 
box_scan.product_code, box_scan.station_code, box_scan.grade, box_scan.size UNION
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
  WHERE (((loin_scan.lot_number IS NOT NULL) AND ((loin_scan.lot_number)::text <> 
''::text)) AND (loin_scan.box_number IS NULL))
  GROUP BY loin_scan.lot_number, loin_scan.station_code, loin_scan.grade; ALTER TABLE 
public.totals_by_lot OWNER TO tuna_processor; ALTER TABLE ONLY box ALTER COLUMN serial_id 
SET DEFAULT nextval('box_id_seq'::regclass); ALTER TABLE ONLY harvester ALTER COLUMN 
serial_id SET DEFAULT nextval('supplier_id_seq'::regclass); ALTER TABLE ONLY loin ALTER 
COLUMN serial_id SET DEFAULT nextval('loin_id_seq'::regclass); ALTER TABLE ONLY lot ALTER 
COLUMN serial_id SET DEFAULT nextval('lot_id_seq'::regclass); ALTER TABLE ONLY processor 
ALTER COLUMN serial_id SET DEFAULT nextval('source_id_seq'::regclass); ALTER TABLE ONLY 
product ALTER COLUMN serial_id SET DEFAULT nextval('product_id_seq'::regclass); ALTER 
TABLE ONLY scan ALTER COLUMN serial_id SET DEFAULT nextval('scan_id_seq'::regclass); 
ALTER TABLE ONLY shipping_unit ALTER COLUMN serial_id SET DEFAULT 
nextval('shipping_id_seq'::regclass); ALTER TABLE ONLY box
    ADD CONSTRAINT box_pk PRIMARY KEY (serial_id); ALTER TABLE ONLY harvester
    ADD CONSTRAINT harvester_pk PRIMARY KEY (serial_id); ALTER TABLE ONLY loin
    ADD CONSTRAINT loin_pk PRIMARY KEY (serial_id); ALTER TABLE ONLY lot
    ADD CONSTRAINT lot_pk PRIMARY KEY (serial_id); ALTER TABLE ONLY processor
    ADD CONSTRAINT processor_pk PRIMARY KEY (serial_id); ALTER TABLE ONLY product
    ADD CONSTRAINT prod_pk PRIMARY KEY (serial_id); ALTER TABLE ONLY scan
    ADD CONSTRAINT scan_pk PRIMARY KEY (serial_id); ALTER TABLE ONLY shipping_unit
    ADD CONSTRAINT shipping_unit_pk PRIMARY KEY (serial_id); REVOKE ALL ON SCHEMA public 
FROM PUBLIC; REVOKE ALL ON SCHEMA public FROM postgres; GRANT ALL ON SCHEMA public TO 
postgres; GRANT ALL ON SCHEMA public TO PUBLIC;
