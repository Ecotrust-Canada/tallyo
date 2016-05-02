CREATE OR REPLACE VIEW loin_with_info AS 
 SELECT scan.station_code,
    loin.lot_number,
    loin.loin_number,
    loin.box_number,
    loin.state,
    loin.state AS type,
    loin.weight_1,
    loin.weight_1 AS weight,
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
   FROM loin
     LEFT JOIN lot ON lot.lot_number::text = loin.lot_number::text
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN ( SELECT scan_1.loin_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.loin_number, scan_1.station_code) scan ON scan.loin_number::text = loin.loin_number::text;

ALTER TABLE loin_with_info
  OWNER TO tuna_processor;
