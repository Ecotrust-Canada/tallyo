CREATE OR REPLACE VIEW public.box_har AS 
 SELECT box.box_number,
    box.timestamp,
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
