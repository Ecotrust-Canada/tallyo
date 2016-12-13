DROP VIEW public.box_har;

CREATE OR REPLACE VIEW public.box_har AS 
 SELECT box.box_number,
    box."timestamp",
    box.station_code,
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
    harvester.fishing_area
   FROM box
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text;

ALTER TABLE public.box_har
  OWNER TO tuna_processor;


  DROP VIEW public.box_intrec;

CREATE OR REPLACE VIEW public.box_intrec AS 
 SELECT box.box_number,
    box.modified AS "timestamp",
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
  WHERE scan.pieces > 0;

ALTER TABLE public.box_intrec
  OWNER TO tuna_processor;