CREATE OR REPLACE VIEW public.shipment_list AS 
 SELECT box.box_number,
    box.case_number,
    scan.station_code,
    box.weight,
    box.size,
    box.grade,
    box.pieces,
    box.shipping_unit_number,
    box.shipping_unit_in,
    box.species,
    scan."timestamp",
    box.internal_lot_code
   FROM box
     LEFT JOIN ( SELECT 
            scan_1."timestamp",
            scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          WHERE scan_1.loin_number IS NULL AND scan_1.pieces > 0) scan ON box.box_number::text = scan.box_number::text;

    alter view shipment_list owner to tuna_processor;
