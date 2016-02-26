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
