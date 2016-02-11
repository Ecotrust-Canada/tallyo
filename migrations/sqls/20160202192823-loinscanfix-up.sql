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
