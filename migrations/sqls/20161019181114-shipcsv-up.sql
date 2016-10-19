CREATE OR REPLACE VIEW public.box_ship_csv AS 
 SELECT box.box_number,
    box.uuid_from_label,
    "substring"(box.uuid_from_label::text, '......$'::text) AS uuid_end,
    box.case_number,
    scan.station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.pieces,
    box.shipping_unit_number,
    box.species,
    scan.timestamp,
    box.best_before_date,
    box.pdc,
    box.batchcode,
    box.pdc_text,
    box.tf_code,
    box.country_origin,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    product.handling AS product_handling,
    product.state AS product_state,
    product.best_before AS product_best_before,
    product.weight AS product_weight,
    product.entry_unit AS product_entry_unit,
    product.traceable AS product_traceable,
    lot.internal_lot_code as po_number,
    lot_in.lot_number as lot_in,
    lot_in.internal_lot_code as ref_number
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN scan ON box.box_number::text = scan.box_number::text
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text
     left join lot lot_in on lot.lot_in = lot_in.lot_number;


ALTER TABLE public.box_ship_csv
  OWNER TO tuna_processor;
