 create view shipping_summary_lot as 
 SELECT box.shipping_unit_number,
        CASE
            WHEN box.grade IS NOT NULL THEN box.grade
            ELSE product.product_type
        END AS grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    box.internal_lot_code
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY box.shipping_unit_number, box.grade, box.size, scan.station_code, product.product_type, box.internal_lot_code
UNION
 SELECT box.shipping_unit_in AS shipping_unit_number,
        CASE
            WHEN box.grade IS NOT NULL THEN box.grade
            ELSE product.product_type
        END AS grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    box.internal_lot_code
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY box.shipping_unit_in, box.grade, box.size, scan.station_code, product.product_type, box.internal_lot_code
  ORDER BY 1, 2;


alter view shipping_summary_lot owner to tuna_processor;