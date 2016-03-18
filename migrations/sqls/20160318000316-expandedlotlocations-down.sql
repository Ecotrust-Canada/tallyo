DROP VIEW expandedlotlocations;

CREATE OR REPLACE VIEW expandedlotlocations AS 
 SELECT lot.lot_number,
    lot.internal_lot_code,
    harvester.ft_fa_code,
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
