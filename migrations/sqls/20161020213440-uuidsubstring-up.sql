CREATE OR REPLACE VIEW public.box_ship_csv AS 
 SELECT box.box_number,
    box.uuid_from_label,
    substring(box.uuid_from_label::text from 0 for 9) AS uuid_end,
    box.case_number,
    scan.station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.pieces,
    box.shipping_unit_number,
    box.species,
    scan."timestamp",
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
     LEFT JOIN scan ON box.box_number::text = scan.box_number::text
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text
     LEFT JOIN lot lot_in ON lot.lot_in::text = lot_in.lot_number::text;

ALTER TABLE public.box_ship_csv
  OWNER TO tuna_processor;

CREATE OR REPLACE VIEW public.box_with_info AS 
 SELECT box.box_number,
    box.uuid_from_label,
    substring(box.uuid_from_label::text from 0 for 9) AS uuid_end,
    box.case_number,
        CASE
            WHEN scan.station_code IS NOT NULL THEN scan.station_code
            ELSE box.station_code
        END AS station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.pieces,
    box.shipping_unit_number,
    box.shipping_unit_in,
    box.species,
        CASE
            WHEN box.supplier_code IS NOT NULL THEN box.supplier_code
            ELSE box.harvester_code
        END AS harvester_code,
        CASE
            WHEN scan."timestamp" IS NOT NULL THEN scan."timestamp"
            ELSE box."timestamp"
        END AS "timestamp",
        CASE
            WHEN box.internal_lot_code IS NOT NULL THEN box.internal_lot_code
            ELSE lot.internal_lot_code
        END AS internal_lot_code,
        CASE
            WHEN box.harvest_date IS NOT NULL THEN box.harvest_date
            ELSE lot.start_date
        END AS harvest_date,
    box.best_before_date,
    box.lot_in,
    box.pdc,
    box.batchcode,
    box.pdc_text,
    box.country_origin,
    shipping_unit.received_from,
        CASE
            WHEN harvester.ft_fa_code IS NOT NULL AND harvester.ft_fa_code::text <> ''::text AND harvester.ft_fa_code::text <> 'NON FT'::text THEN harvester.ft_fa_code
            ELSE 'NFT'::character varying
        END AS ft_fa_code,
    harvester.fleet,
    harvester.fishing_area,
    harvester.supplier_group,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    box.tf_code,
    product.handling AS product_handling,
    product.state AS product_state,
    product.best_before AS product_best_before,
    product.weight AS product_weight,
    product.entry_unit AS product_entry_unit,
    product.traceable AS product_traceable
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN ( SELECT scan_1.serial_id,
            scan_1.lot_number,
            scan_1.weight_1,
            scan_1.weight_2,
            scan_1.grade,
            scan_1."timestamp",
            scan_1.state,
            scan_1.station_code,
            scan_1.loin_number,
            scan_1.box_number,
            scan_1.shipping_unit_number,
            scan_1.internal_lot_code,
            scan_1.pieces,
            scan_1.species,
            scan_1.size,
            scan_1.weight
           FROM scan scan_1
          WHERE scan_1.loin_number IS NULL AND scan_1.pieces > 0) scan ON box.box_number::text = scan.box_number::text
     LEFT JOIN shipping_unit ON box.shipping_unit_in::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text
UNION
 SELECT box.box_number,
    box.uuid_from_label,
    substring(box.uuid_from_label::text from 0 for 9) AS uuid_end,
    box.case_number,
    box.station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.pieces,
    box.shipping_unit_number,
    box.shipping_unit_in,
    box.species,
        CASE
            WHEN box.supplier_code IS NOT NULL THEN box.supplier_code
            ELSE box.harvester_code
        END AS harvester_code,
    box."timestamp",
        CASE
            WHEN box.internal_lot_code IS NOT NULL THEN box.internal_lot_code
            ELSE lot.internal_lot_code
        END AS internal_lot_code,
        CASE
            WHEN box.harvest_date IS NOT NULL THEN box.harvest_date
            ELSE lot.start_date
        END AS harvest_date,
    box.best_before_date,
    box.lot_in,
    box.pdc,
    box.batchcode,
    box.pdc_text,
    box.country_origin,
    shipping_unit.received_from,
        CASE
            WHEN harvester.ft_fa_code IS NOT NULL AND harvester.ft_fa_code::text <> ''::text AND harvester.ft_fa_code::text <> 'NON FT'::text THEN harvester.ft_fa_code
            ELSE 'NFT'::character varying
        END AS ft_fa_code,
    harvester.fleet,
    harvester.fishing_area,
    harvester.supplier_group,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    box.tf_code,
    product.handling AS product_handling,
    product.state AS product_state,
    product.best_before AS product_best_before,
    product.weight AS product_weight,
    product.entry_unit AS product_entry_unit,
    product.traceable AS product_traceable
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN shipping_unit ON box.shipping_unit_in::text = shipping_unit.shipping_unit_number::text
     LEFT JOIN lot ON box.lot_number::text = lot.lot_number::text
  WHERE NOT (box.box_number::text IN ( SELECT scan.box_number
           FROM scan
          WHERE scan.station_code::text = box.station_code::text AND scan.loin_number IS NULL));

ALTER TABLE public.box_with_info
  OWNER TO tuna_processor;
