-- View: public.shipment_summary

DROP VIEW public.shipment_summary;

CREATE OR REPLACE VIEW public.shipment_summary AS 
 SELECT box.shipping_unit_number,
        CASE
            WHEN box.grade IS NOT NULL THEN box.grade
            ELSE product.product_type
        END AS grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY box.shipping_unit_number, box.grade, box.size, product.product_type
UNION
 SELECT box.shipping_unit_in AS shipping_unit_number,
        CASE
            WHEN box.grade IS NOT NULL THEN box.grade
            ELSE product.product_type
        END AS grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY box.shipping_unit_in, box.grade, box.size, product.product_type
  ORDER BY 1, 2;

ALTER TABLE public.shipment_summary
  OWNER TO tuna_processor;
