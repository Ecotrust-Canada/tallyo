DROP VIEW public.inventory_detail;


DROP VIEW public.box_detail;

CREATE OR REPLACE VIEW public.box_detail AS 
 SELECT scan.station_code,
    box.lot_number,
    box.shipping_unit_number,
    box.box_number,
    box.case_number,
    box."timestamp",
    box.weight AS box_weight,
    box.grade as box_grade,
    box.internal_lot_code AS box_internal_lot_code,
    h1.fleet,
    box.pieces,
    box.size,
    h1.supplier_group,
    h1.fishing_area AS wpp,
    box.best_before_date,
    '     ' AS loins,
    loin.loin_number,
    loin.weight_1 AS loin_weight,
    loin.grade as loin_grade,
    harvester.supplier,
    lot.internal_lot_code AS loin_internal_lot_code,
    harvester.ft_fa_code,
    harvester.landing_location,
    lot.start_date AS receive_date
   FROM box,
    loin,
    lot,
    harvester,
    lot l1,
    harvester h1,
    ( SELECT scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan
  WHERE box.box_number::text = loin.box_number::text AND loin.lot_number::text = lot.lot_number::text AND lot.harvester_code::text = harvester.harvester_code::text AND box.lot_number::text = l1.lot_number::text AND l1.harvester_code::text = h1.harvester_code::text AND box.box_number::text = scan.box_number::text
  ORDER BY box.box_number;

ALTER TABLE public.box_detail
  OWNER TO tuna_processor;

CREATE OR REPLACE VIEW public.inventory_detail AS 
 SELECT box_detail.station_code,
    box_detail.lot_number,
    box_detail.shipping_unit_number,
    box_detail.box_number,
    box_detail.case_number,
    box_detail."timestamp",
    box_detail.box_weight,
    box_detail.box_grade,
    box_detail.box_internal_lot_code,
    box_detail.fleet,
    box_detail.pieces,
    box_detail.size,
    box_detail.supplier_group,
    box_detail.wpp,
    box_detail.best_before_date,
    box_detail.loins,
    box_detail.loin_number,
    box_detail.loin_weight,
    box_detail.loin_grade,
    box_detail.supplier,
    box_detail.loin_internal_lot_code,
    box_detail.ft_fa_code,
    box_detail.landing_location,
    box_detail.receive_date
   FROM box_detail
  WHERE (box_detail.box_number::text IN ( SELECT inventory_all.box_number
           FROM inventory_all));

ALTER TABLE public.inventory_detail
  OWNER TO tuna_processor;
