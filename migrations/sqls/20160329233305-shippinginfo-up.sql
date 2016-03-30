drop view shipment_summary;
create view shipment_summary as 
SELECT shipping_unit.shipping_unit_number,
    box.grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code
   FROM shipping_unit,
    box,
    (select box_number, station_code from scan
     group by box_number, station_code) as scan
  WHERE box.shipping_unit_number::text = shipping_unit.shipping_unit_number::text
  and scan.box_number = box.box_number
  GROUP BY shipping_unit.shipping_unit_number, box.grade, box.size, scan.station_code
  ORDER BY shipping_unit.shipping_unit_number;

  alter view shipment_summary owner to tuna_processor;



drop view shipment_summary_more;
create view shipment_summary_more as

  SELECT shipping_unit.shipping_unit_number,
    box.grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    box.harvester_code
   FROM shipping_unit,
    box,
    ( SELECT scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan
  WHERE box.shipping_unit_number::text = shipping_unit.shipping_unit_number::text AND scan.box_number::text = box.box_number::text
  GROUP BY shipping_unit.shipping_unit_number, box.grade, box.size, scan.station_code, box.harvester_code
  ORDER BY shipping_unit.shipping_unit_number;
  
  alter view shipment_summary_more owner to tuna_processor;
