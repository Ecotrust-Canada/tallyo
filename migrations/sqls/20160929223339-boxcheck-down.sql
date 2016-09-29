DROP VIEW public.inventory_detail;
DROP VIEW public.inventory_all;

CREATE OR REPLACE VIEW public.inventory_all AS 
 SELECT t1.station_code,
    box.grade,
    box.harvester_code,
    box.lot_number,
    box.box_number,
    box.size,
    box."timestamp",
        CASE
            WHEN harvester.ft_fa_code IS NOT NULL AND harvester.ft_fa_code::text <> ''::text AND harvester.ft_fa_code::text <> 'NON FT'::text THEN harvester.ft_fa_code
            ELSE 'NFT'::character varying
        END AS ft_fa_code,
    harvester.fleet,
    harvester.fishing_area,
    harvester.supplier_group,
    box.pieces,
    box.best_before_date,
    box.case_number,
    box.internal_lot_code,
    box.weight
   FROM box
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN scan t1 ON box.box_number::text = t1.box_number::text
  WHERE NOT (EXISTS ( SELECT t2.box_number
           FROM scan t2
          WHERE t2.box_number::text = t1.box_number::text AND t2."timestamp" > t1."timestamp"))
  ORDER BY box.size, box.grade;

ALTER TABLE public.inventory_all
  OWNER TO tuna_processor;

  CREATE OR REPLACE VIEW public.inventory_detail AS 
 SELECT b1.station_code,
    b1.lot_number,
    b1.box_number,
    b1.case_number,
        CASE
            WHEN b1.ft_fa_code IS NOT NULL AND b1.ft_fa_code::text <> ''::text AND b1.ft_fa_code::text <> 'NON FT'::text THEN b1.ft_fa_code
            ELSE 'NFT'::character varying
        END AS fair_trade,
    b1."timestamp",
    b1.weight AS box_weight,
    b1.grade AS box_grade,
    b1.internal_lot_code AS box_internal_lot_code,
    b1.fleet,
    b1.pieces,
    b1.size,
    b1.supplier_group,
    b1.fishing_area AS wpp,
    b1.best_before_date,
    '     ' AS loins,
    loin.loin_number,
    loin.weight_1 AS loin_weight,
    loin.grade AS loin_grade,
    harvester.supplier,
    lot.internal_lot_code AS loin_internal_lot_code,
    harvester.ft_fa_code,
    harvester.landing_location,
    lot.start_date AS receive_date
   FROM inventory_all b1
     LEFT JOIN loin ON b1.box_number::text = loin.box_number::text
     LEFT JOIN lot ON loin.lot_number::text = lot.lot_number::text
     LEFT JOIN harvester ON lot.harvester_code::text = harvester.harvester_code::text
  ORDER BY b1.box_number;

ALTER TABLE public.inventory_detail
  OWNER TO tuna_processor;
