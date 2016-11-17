

alter table box add column modified timestamp;
alter table box alter column modified set data type timestamp with time zone;

CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_box_modtime BEFORE UPDATE ON box FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();

DROP VIEW public.box_ship_csv;

CREATE OR REPLACE VIEW public.box_ship_csv AS 
 SELECT box.box_number,
    box.uuid_from_label,
    "substring"(box.uuid_from_label::text, 0, 9) AS uuid_end,
    box.case_number,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.pieces,
    box.shipping_unit_number,
    box.species,
    box.modified as timestamp,
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
    lot.internal_lot_code AS po_number,
    lot_in.lot_number AS lot_in,
    lot_in.internal_lot_code AS ref_number
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text
     LEFT JOIN lot lot_in ON lot.lot_in::text = lot_in.lot_number::text;

ALTER TABLE public.box_ship_csv
  OWNER TO tuna_processor;
