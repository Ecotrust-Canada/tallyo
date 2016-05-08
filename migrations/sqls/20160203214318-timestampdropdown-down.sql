DROP VIEW expandedlotlocations;
 CREATE OR REPLACE VIEW 
expandedlotlocations AS
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
    lotlocations.in_progress_date
   FROM harvester_lot,
    lotlocations
  WHERE harvester_lot.lot_number::text = lotlocations.lot_number::text; 
ALTER TABLE expandedlotlocations
  OWNER TO tuna_processor;
