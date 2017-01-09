CREATE OR REPLACE VIEW public.boxes_uuid_total AS 
 SELECT 
    box.station_code,
    box.lot_number,
    box.grade,
    count(box.box_number) as boxes
   FROM box
   group by station_code, lot_number, grade;

ALTER TABLE public.boxes_uuid_total
  OWNER TO tuna_processor;
