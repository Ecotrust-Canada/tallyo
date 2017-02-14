update box set lot_in = scan.lot_number 
from scan 
where box.box_number = scan.box_number 
and box.station_code = 'AM1-005' and scan.station_code = 'AM1-005';

DROP VIEW public.box_totals;

CREATE OR REPLACE VIEW public.box_totals AS 
 SELECT count(box.box_number) AS boxes,
        CASE
            WHEN scan.station_code IS NOT NULL THEN scan.station_code
            ELSE box.station_code
        END AS station_code,
    box.lot_in,
    sum(box.weight) AS weight_1,
    box.size,
    box.grade,
    box.species,
    sum(box.pieces) AS pieces
   FROM box
     LEFT JOIN scan ON box.box_number::text = scan.box_number::text
  WHERE scan.pieces > 0
  GROUP BY scan.station_code, box.station_code, box.lot_in, box.size, box.grade, box.species;

ALTER TABLE public.box_totals
  OWNER TO tuna_processor;
