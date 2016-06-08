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
           FROM inventory_all where inventory_all.station_code = box_detail.station_code));

ALTER TABLE public.inventory_detail
  OWNER TO tuna_processor;
