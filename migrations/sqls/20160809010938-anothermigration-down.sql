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
          WHERE t2.box_number::text = t1.box_number::text AND t2."timestamp" > t1."timestamp"))
  ORDER BY t1.station_code;

ALTER TABLE public.inventory_all
  OWNER TO tuna_processor;
