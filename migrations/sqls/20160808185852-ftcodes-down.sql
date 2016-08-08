DROP VIEW inventory_detail;
drop view box_detail;
CREATE OR REPLACE VIEW public.box_detail AS 
 SELECT scan.station_code,
    box.lot_number,
    box.shipping_unit_number,
    box.box_number,
    box.case_number,
    box."timestamp",
    box.weight AS box_weight,
    box.grade AS box_grade,
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
    loin.grade AS loin_grade,
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




CREATE OR REPLACE VIEW public.box_with_info AS 
 SELECT box.box_number,
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
    shipping_unit.received_from,
    harvester.ft_fa_code,
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
    shipping_unit.received_from,
    harvester.ft_fa_code,
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


