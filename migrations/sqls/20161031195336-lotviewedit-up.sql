DROP VIEW public.harvester_lot;

CREATE OR REPLACE VIEW public.harvester_lot AS 
 SELECT lot.lot_number,
    lot.start_date,
    lot.end_date,
    lot."timestamp",
    lot.harvester_code,
    lot.internal_lot_code,
    lot.station_code,
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
    l2.internal_lot_code AS ref_number,
    (SELECT COUNT(*) FROM box B WHERE B.lot_number = lot.lot_number) + 
    (SELECT COUNT(*) FROM scan S WHERE S.lot_number = lot.lot_number) + 
    (SELECT COUNT(*) FROM loin C WHERE C.lot_number = lot.lot_number) as num_items
   FROM lot
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON lot.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN supplier ON lot.supplier_code::text = supplier.supplier_code::text
     LEFT JOIN lot l2 ON lot.lot_in::text = l2.lot_number::text;

ALTER TABLE public.harvester_lot
  OWNER TO tuna_processor;
