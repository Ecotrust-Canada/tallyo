DROP VIEW public.box_fleet;

CREATE OR REPLACE VIEW public.box_fleet AS 
 SELECT box.box_number,
    box.shipping_unit_in,
    box.case_number,
    box.size,
    box.grade,
    box.weight,
    box.best_before_date,
    harvester.fleet,
    scan."timestamp",
    scan.station_code,
    box.lot_number,
    box.shipping_unit_number
   FROM box
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN scan ON scan.box_number::text = box.box_number::text;

ALTER TABLE public.box_fleet
  OWNER TO tuna_processor;
