DROP VIEW public.scan_detail;

CREATE OR REPLACE VIEW public.scan_detail AS 
 SELECT scan.station_code,
    scan.lot_number,
    NULL::unknown AS spacer,
    scan.weight_1,
    scan.grade,
    scan."timestamp",
    scan.state,
    lot.internal_lot_code,
    harvester.fleet,
    harvester.landing_location,
    harvester.supplier,
    harvester.supplier_group,
    harvester.ft_fa_code,
    lot.start_date AS receive_date,
    harvester.fishing_area AS wpp,
    scan.species
   FROM scan,
    harvester,
    lot
  WHERE scan.lot_number::text = lot.lot_number::text AND lot.harvester_code::text = harvester.harvester_code::text;

ALTER TABLE public.scan_detail
  OWNER TO tuna_processor;
