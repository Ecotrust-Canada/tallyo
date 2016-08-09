-- View: public.inventory_all
DROP VIEW public.inventory_detail;
DROP VIEW public.inventory_all;

CREATE OR REPLACE VIEW public.inventory_all AS 
 SELECT t1.box_number,
    t1.case_number,
    t1.station_code,
    t1.lot_number,
    t1.weight,
    t1.size,
    t1.grade,
    t1.pieces,
    t1.shipping_unit_number,
    t1.shipping_unit_in,
    t1.species,
    t1.harvester_code,
    t1."timestamp",
    t1.internal_lot_code,
    t1.harvest_date,
    t1.best_before_date,
    t1.received_from,
    t1.ft_fa_code,
    t1.fleet,
    t1.fishing_area,
    t1.supplier_group,
    t1.product_code,
    t1.product_type,
    t1.trade_unit,
    t1.sap_item_code,
    t1.tf_code,
    t1.product_handling,
    t1.product_state,
    t1.product_best_before,
    t1.product_weight,
    t1.product_entry_unit,
    t1.product_traceable
   FROM box_with_info t1
  WHERE NOT (EXISTS ( SELECT t2.box_number
           FROM scan t2
          WHERE t2.box_number::text = t1.box_number::text AND t2."timestamp" > t1."timestamp" AND t2.station_code::text <> t1.station_code::text))
  ORDER BY t1.station_code;

ALTER TABLE public.inventory_all
  OWNER TO tuna_processor;


  -- View: public.inventory_detail

-- 

CREATE OR REPLACE VIEW public.inventory_detail AS 
 SELECT box_detail.station_code,
    box_detail.lot_number,
    box_detail.shipping_unit_number,
    box_detail.box_number,
    box_detail.case_number,
    box_detail.fair_trade,
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

