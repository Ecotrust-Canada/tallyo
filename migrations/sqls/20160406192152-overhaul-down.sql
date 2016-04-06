DROP VIEW shipment_summary_more;

CREATE OR REPLACE VIEW shipment_summary_more AS 
 SELECT scan.shipping_unit_number,
    box.grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    product.product_type,
    box.harvester_code
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code,
            scan_1.shipping_unit_number
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code, scan_1.shipping_unit_number) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY scan.shipping_unit_number, box.grade, box.size, scan.station_code, product.product_type, box.harvester_code
  ORDER BY scan.shipping_unit_number;

ALTER TABLE shipment_summary_more
  OWNER TO tuna_processor;


DROP VIEW shipment_summary;

CREATE OR REPLACE VIEW shipment_summary AS 
 SELECT scan.shipping_unit_number,
    box.grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    product.product_type
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code,
            scan_1.shipping_unit_number
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code, scan_1.shipping_unit_number) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY scan.shipping_unit_number, box.grade, box.size, scan.station_code, product.product_type
  ORDER BY scan.shipping_unit_number;

ALTER TABLE shipment_summary
  OWNER TO tuna_processor;



drop view totals_by_lot;
drop view lot_summary;
drop view ship_with_info;
drop view box_with_info;
drop view loin_with_info;

update box set shipping_unit_number = shipping_unit_in where shipping_unit_number is null;

alter table box drop column shipping_unit_in;


alter table box add column received_from character varying;
alter table box add column receive_code character varying;
alter table box add column trade_unit character varying;
alter table box add column lot character varying;


CREATE OR REPLACE VIEW box_scan AS 
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
  WHERE box.box_number::text = scan.box_number::text
  GROUP BY box.box_number, box.species, box.product_code, box.trade_unit, box.case_number, box.weight, box.size, box.grade, box.lot, box.best_before_date, box.pieces, box.shipping_unit_number, scan.station_code, box.harvester_code, box.lot_number;

ALTER TABLE box_scan
  OWNER TO tuna_processor;

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
  WHERE scan.loin_number::text = loin.loin_number::text AND loin.lot_number::text = lot.lot_number::text AND harvester.harvester_code::text = lot.harvester_code::text
  GROUP BY loin.loin_number, harvester.ft_fa_code, lot.internal_lot_code, scan.box_number, loin.state, loin.lot_number, loin.grade, loin.weight_1, scan.station_code;

ALTER TABLE loin_scan
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


  CREATE TABLE processor
(
  serial_id serial,
  name character varying,
  processor_code character varying,
  CONSTRAINT processor_pk PRIMARY KEY (serial_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE processor
  OWNER TO tuna_processor;


  CREATE TABLE receive_lot
(
  serial_id serial,
  receive_code character varying,
  lot_number character varying,
  "timestamp" timestamp with time zone DEFAULT now(),
  station_code character varying,
  harvester_code character varying,
  received_from character varying,
  tf_code character varying,
  product_code character varying,
  harvest_date timestamp with time zone,
  CONSTRAINT rlot_pk PRIMARY KEY (serial_id),
  CONSTRAINT urlot UNIQUE (receive_code)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE receive_lot
  OWNER TO tuna_processor;



  CREATE OR REPLACE VIEW loin_inventory AS 
 SELECT t1.station_code,
    loin.grade,
    loin.state,
    count(loin.loin_number) AS pieces,
    sum(loin.weight_1) AS weight_total
   FROM loin,
    scan t1
  WHERE loin.loin_number::text = t1.loin_number::text AND NOT (EXISTS ( SELECT t2.loin_number
           FROM scan t2
          WHERE t2.loin_number::text = t1.loin_number::text AND t2."timestamp" > t1."timestamp")) AND loin.box_number IS NULL
  GROUP BY loin.grade, t1.station_code, loin.state;

ALTER TABLE loin_inventory
  OWNER TO tuna_processor;


  CREATE OR REPLACE VIEW reprint_table AS 
 SELECT loin.loin_number,
    max(scan."timestamp") AS "timestamp",
    scan.box_number,
    lot.lot_number,
    scan.station_code,
    loin.grade,
    loin.weight_1,
    lot.internal_lot_code,
    harvester.ft_fa_code
   FROM scan,
    loin,
    lot,
    harvester
  WHERE scan.loin_number::text = loin.loin_number::text AND lot.lot_number::text = loin.lot_number::text AND harvester.harvester_code::text = lot.harvester_code::text
  GROUP BY loin.loin_number, scan.box_number, lot.lot_number, loin.grade, loin.weight_1, scan.station_code, lot.internal_lot_code, harvester.ft_fa_code;

ALTER TABLE reprint_table
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


  CREATE OR REPLACE VIEW loin_detail AS 
 SELECT scan.station_code,
    loin.lot_number,
    NULL::unknown AS spacer,
    loin.loin_number,
    loin.state AS type,
    loin.weight_1,
    loin.grade,
    loin."timestamp",
    lot.internal_lot_code,
    harvester.fleet,
    harvester.landing_location,
    harvester.supplier,
    harvester.supplier_group,
    harvester.ft_fa_code,
    lot.start_date AS receive_date,
    harvester.fishing_area AS wpp
   FROM loin,
    harvester,
    lot,
    ( SELECT scan_1.loin_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.loin_number, scan_1.station_code) scan
  WHERE loin.lot_number::text = lot.lot_number::text AND lot.harvester_code::text = harvester.harvester_code::text AND scan.loin_number::text = loin.loin_number::text;

ALTER TABLE loin_detail
  OWNER TO tuna_processor;

  CREATE OR REPLACE VIEW box_sum AS 
 SELECT scan.station_code,
    box.lot_number,
    box.shipping_unit_number,
    box.box_number,
    box.case_number,
    box."timestamp",
    box.weight AS box_weight,
    box.internal_lot_code AS box_internal_lot_code,
    h1.fleet,
    box.pieces,
    box.size,
    h1.supplier_group,
    h1.fishing_area AS wpp,
    box.best_before_date
   FROM box,
    harvester h1,
    ( SELECT scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan
  WHERE box.harvester_code::text = h1.harvester_code::text AND box.box_number::text = scan.box_number::text
  ORDER BY box.box_number;

ALTER TABLE box_sum
  OWNER TO tuna_processor;


  CREATE OR REPLACE VIEW box_product AS 
 SELECT box.box_number,
    box.case_number,
    scan.station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.shipping_unit_number,
    box.species,
    box.harvester_code,
    scan."timestamp",
    box.best_before_date,
    box.received_from,
    harvester.ft_fa_code,
    harvester.fleet,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    box.internal_lot_code
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code,
            max(scan_1."timestamp") AS "timestamp"
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON box.box_number::text = scan.box_number::text;

ALTER TABLE box_product
  OWNER TO tuna_processor;




