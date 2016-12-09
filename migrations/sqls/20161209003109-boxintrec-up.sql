CREATE OR REPLACE VIEW public.box_intrec AS 
 SELECT box.box_number,
    box.modified as timestamp,
    box.lot_number,
    box.internal_lot_code,
    box.lot_in,
    box.size,
    box.grade,
    box.weight,
    box.pieces,
    box.best_before_date,
    box.pdc_text,
    harvester.fleet,
    harvester.ft_fa_code,
    harvester.supplier_group,
    harvester.fishing_area,
    scan.station_code
   FROM box
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN scan ON scan.box_number::text = box.box_number::text
     where scan.pieces > 0;

ALTER TABLE public.box_intrec
  OWNER TO tuna_processor;