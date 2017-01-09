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


CREATE OR REPLACE VIEW public.box_intrec_total AS 
 SELECT count(box.box_number) as boxes,
    box.lot_number,
    sum(box.weight) as weight_1,
    scan.station_code
   FROM box
     LEFT JOIN scan ON scan.box_number::text = box.box_number::text
  WHERE scan.pieces > 0
  group by box.lot_number, scan.station_code;

ALTER TABLE public.box_intrec_total
  OWNER TO tuna_processor;
