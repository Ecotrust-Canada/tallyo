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
    shipping_unit."timestamp",
    shipping_unit.received_from,
    shipping_unit.vessel_name
   FROM lot
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text;

ALTER TABLE harvester_lot
  OWNER TO tuna_processor;
  
  alter table lotlocations rename column lot_number to collectionid;
  
  
  CREATE OR REPLACE VIEW lot_aggregated AS 
 SELECT foo.lot_number,
    array_to_string(array_agg(foo.station_code), ','::text) AS stations
   FROM ( SELECT scan.lot_number,
            scan.station_code,
            max(scan."timestamp") AS "timestamp"
           FROM scan
          WHERE scan.lot_number IS NOT NULL
          GROUP BY scan.station_code, scan.lot_number
        UNION
         SELECT loin.lot_number,
            scan.station_code,
            max(scan."timestamp") AS "timestamp"
           FROM scan,
            loin
          WHERE scan.loin_number::text = loin.loin_number::text
          GROUP BY scan.station_code, loin.lot_number
        UNION
         SELECT box.lot_number,
            scan.station_code,
            max(scan."timestamp") AS "timestamp"
           FROM scan,
            box
          WHERE scan.box_number::text = box.box_number::text
          GROUP BY scan.station_code, box.lot_number
        UNION
         SELECT lotlocations.collectionid,
            lotlocations.station_code,
            lotlocations.in_progress_date
           FROM lotlocations
  ORDER BY 1, 3) foo
  GROUP BY foo.lot_number;

ALTER TABLE lot_aggregated
  OWNER TO tuna_processor;
  
  CREATE OR REPLACE VIEW select_lot AS 
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
   FROM lot_aggregated
     LEFT JOIN harvester_lot ON lot_aggregated.lot_number::text = harvester_lot.lot_number::text
  WHERE lot_aggregated.lot_number IS NOT NULL;

ALTER TABLE select_lot
  OWNER TO tuna_processor;
  
  DROP VIEW if exists recent_lot;
  
  drop view if exists lot_scan;
