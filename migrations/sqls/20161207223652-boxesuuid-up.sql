
CREATE or replace VIEW boxes_uuid AS 
 SELECT box.box_number,
    box.uuid_from_label,
    "substring"(box.uuid_from_label::text, 0, 9) AS uuid_end,
    box.station_code,
    box.timestamp,
    box.lot_number,
    box.weight,
    box.best_before_date,
    box.pdc,
    box.batchcode,
    box.country_origin,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    box.tf_code,
    product.handling AS product_handling,
    product.state AS product_state,
    product.best_before AS product_best_before,
    product.weight AS product_weight,
    product.entry_unit AS product_entry_unit
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text;

ALTER view boxes_uuid
  OWNER TO tuna_processor;
