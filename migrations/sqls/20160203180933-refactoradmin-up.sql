

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
    lot.timestamp,
    shipping_unit.received_from,
    shipping_unit.vessel_name
   FROM lot
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text;

ALTER TABLE harvester_lot
  OWNER TO tuna_processor;
  
  
alter table lotlocations rename column collectionid to lot_number;

DROP VIEW if exists select_lot;

DROP VIEW if exists lot_aggregated;


  
  
CREATE OR REPLACE VIEW lot_scan AS 
SELECT foo.lot_number,
    foo.station_code,
    foo."timestamp",
    foo.processor_code
   FROM ( SELECT scan.lot_number,
            scan.station_code,
            max(scan."timestamp") AS "timestamp",
            substring(scan.station_code from 1 for 3) as processor_code
           FROM scan
          WHERE scan.lot_number IS NOT NULL
          GROUP BY scan.station_code, scan.lot_number
        UNION
         SELECT loin.lot_number,
            scan.station_code,
            max(scan."timestamp") AS "timestamp",
            substring(scan.station_code from 1 for 3) as processor_code
           FROM scan,
            loin
          WHERE scan.loin_number::text = loin.loin_number::text
          and loin.lot_number is not null
          GROUP BY scan.station_code, loin.lot_number
        UNION
         SELECT box.lot_number,
            scan.station_code,
            max(scan."timestamp") AS "timestamp",
            substring(scan.station_code from 1 for 3) as processor_code
           FROM scan,
            box
          WHERE scan.box_number::text = box.box_number::text
          and box.lot_number is not null
          GROUP BY scan.station_code, box.lot_number
  ORDER BY 1, 3) foo
  GROUP BY foo.lot_number, foo.station_code, foo."timestamp", foo.processor_code;

  ALTER TABLE lot_scan
  OWNER TO tuna_processor;

  CREATE OR REPLACE VIEW recent_lot AS 
 SELECT t1.lot_number,
    t1."timestamp",
    t1.station_code,
    t1.processor_code
   FROM lot_scan t1
  WHERE NOT (EXISTS ( SELECT t2.lot_number
           FROM lot_scan t2
          WHERE t2."timestamp" > t1."timestamp"
          and t1.processor_code = t2.processor_code))
  GROUP BY t1.lot_number, t1."timestamp", t1.station_code, t1.processor_code
UNION
 SELECT t1.lot_number,
    t1."timestamp",
    NULL::character varying AS station_code,
    t1.processor_code
   FROM lot t1
  WHERE NOT (EXISTS ( SELECT t2.lot_number
           FROM lot t2
          WHERE t2."timestamp" > t1."timestamp"
          and t1.processor_code = t2.processor_code))
  GROUP BY t1.lot_number, t1."timestamp", t1.processor_code;

ALTER TABLE recent_lot
  OWNER TO tuna_processor;
  
