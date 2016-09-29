create view scan_by_day as 
select station_code, grade, size, species, 
state, sum(weight_1) as total_weight, sum(pieces) as total_pieces, 
date_trunc('day', timestamp) as day, count(*)
    from scan
    group by
        date_trunc('day', timestamp),
        grade,
        size,
        species,
        state,
        station_code
    order by station_code;

ALTER TABLE scan_by_day
  OWNER TO tuna_processor;


create view box_by_day as
select station_code, grade, size, species, 
batchcode, country_origin, pdc, case when tf_code='UNDEFINED' then null else tf_code end as tf_code,
product_type, product_weight, product_entry_unit,
sap_item_code, product_best_before, product_state,
sum(weight) as total_weight, sum(pieces) as total_pieces, 
date_trunc('day', timestamp) as day, count(*)
    from box_with_info
    group by
        date_trunc('day', timestamp),
        grade,
        size,
        species,
        station_code,
        batchcode, country_origin, pdc, (case when tf_code='UNDEFINED' then null else tf_code end) ,
product_type, product_weight, product_entry_unit,
sap_item_code, product_best_before, product_state
    order by station_code;

ALTER TABLE box_by_day
  OWNER TO tuna_processor;


create view scan_by_day_and_lot as
select lot_number, internal_lot_code,  station_code, grade, species, 
state, sum(weight_1) as total_weight, sum(pieces) as total_pieces, 
date_trunc('day', timestamp) as day, count(*)
    from scan_detail
    group by
        date_trunc('day', timestamp),
        grade,
        species,
        state,
        station_code,
        lot_number,
        internal_lot_code
    order by station_code;

ALTER TABLE scan_by_day_and_lot
  OWNER TO tuna_processor;


create view box_by_day_and_lot as 
select internal_lot_code, lot_number, station_code, grade, size, species, 
batchcode, country_origin, pdc, case when tf_code='UNDEFINED' then null else tf_code end as tf_code,
product_type, product_weight, product_entry_unit,
sap_item_code, product_best_before, product_state,
sum(weight) as total_weight, sum(pieces) as total_pieces, 
date_trunc('day', timestamp) as day, count(*)
    from box_with_info
    group by
        date_trunc('day', timestamp),
        grade,
        size,
        species,
        station_code,
        batchcode, country_origin, pdc, (case when tf_code='UNDEFINED' then null else tf_code end) ,
product_type, product_weight, product_entry_unit,
sap_item_code, product_best_before, product_state, lot_number, internal_lot_code
    order by station_code;

ALTER TABLE box_by_day_and_lot
  OWNER TO tuna_processor;


CREATE VIEW lots_by_day_and_station AS
 SELECT
    date_trunc('day', scan.timestamp) as day, 
    scan.lot_number,
    scan.station_code,
    lot.start_date,
    lot.end_date,
    lot."timestamp",
    lot.harvester_code,
    lot.internal_lot_code,
    harvester.species_common,
    harvester.fair_trade,
    harvester.supplier_group,
    harvester.landing_location,
    harvester.supplier,
    harvester.fleet,
    harvester.fishing_area,
    harvester.fishing_method,
    harvester.fisher,
    lot.shipping_unit_number,
    lot.processor_code,
    shipping_unit.received_from,
    shipping_unit.vessel_name,
    shipping_unit.po_number,
    shipping_unit.country_origin,
    shipping_unit.bill_of_lading,
    shipping_unit.container_number,
    lot.receive_date,
    harvester.fishery,
    harvester.tf_user,
    harvester.ft_fa_code,
    supplier.sap_code,
    supplier.name AS supplier_name,
    supplier.msc_code,
    supplier.supplier_code,
    l2.lot_number AS lot_in,
    l2.internal_lot_code AS ref_number
   FROM scan
     LEFT Join lot on scan.lot_number = lot.lot_number
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN supplier ON lot.supplier_code::text = supplier.supplier_code::text
     LEFT JOIN lot l2 ON lot.lot_in::text = l2.lot_number::text
   group by 
  date_trunc('day', scan.timestamp), 
    scan.lot_number,
    scan.station_code,
    lot.start_date,
    lot.end_date,
    lot."timestamp",
    lot.harvester_code,
    lot.internal_lot_code,
    harvester.species_common,
    harvester.fair_trade,
    harvester.supplier_group,
    harvester.landing_location,
    harvester.supplier,
    harvester.fleet,
    harvester.fishing_area,
    harvester.fishing_method,
    harvester.fisher,
    lot.shipping_unit_number,
    lot.processor_code,
    shipping_unit.received_from,
    shipping_unit.vessel_name,
    shipping_unit.po_number,
    shipping_unit.country_origin,
    shipping_unit.bill_of_lading,
    shipping_unit.container_number,
    lot.receive_date,
    harvester.fishery,
    harvester.tf_user,
    harvester.ft_fa_code,
    supplier.sap_code,
    supplier.name,
    supplier.msc_code,
    supplier.supplier_code,
    l2.lot_number,
    l2.internal_lot_code;

ALTER TABLE lots_by_day_and_station
  OWNER TO tuna_processor;

