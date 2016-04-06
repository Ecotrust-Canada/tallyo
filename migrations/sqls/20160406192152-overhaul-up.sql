update box set received_from = null;
update box set receive_code = null;
update box set trade_unit = null;
update box set lot = null;


DROP VIEW box_product;
Drop view lot_summary;
drop view totals_by_lot;
drop view box_scan;
drop view box_sum;
drop view loin_detail;
drop view loin_scan;
drop view loin_lot;
drop view reprint_table;
drop view loin_inventory;
drop table receive_lot;
drop table processor;

alter table box drop column received_from;
alter table box drop column receive_code;
alter table box drop column trade_unit;
alter table box drop column lot;

alter table box add column shipping_unit_in character varying;

ALTER TABLE box ADD CONSTRAINT boxshipin FOREIGN KEY (shipping_unit_in) REFERENCES shipping_unit (shipping_unit_number);


update box set shipping_unit_in = shipping_unit.shipping_unit_number, shipping_unit_number = null
from shipping_unit
where box.shipping_unit_number = shipping_unit.shipping_unit_number 
and shipping_unit.received_from is not null;

update box set shipping_unit_in = scan.shipping_unit_number
from scan, shipping_unit
where box.box_number = scan.box_number
and scan.shipping_unit_number = shipping_unit.shipping_unit_number 
and shipping_unit.received_from is not null;

create view box_with_info as 
 SELECT box.box_number,
    box.case_number,
    case 
    when scan.station_code is not null then scan.station_code
    else box.station_code
    end as station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.pieces,
    box.shipping_unit_number,
    box.shipping_unit_in,
    box.species,
    box.harvester_code,
    case 
    when scan.timestamp is not null then scan.timestamp
    else box.timestamp
    end as timestamp,
    case 
    when box.internal_lot_code is not null then box.internal_lot_code
    else lot.internal_lot_code
    end as internal_lot_code,
    case 
    when box.harvest_date is not null then box.harvest_date
    else lot.start_date
    end as harvest_date,
    box.best_before_date,
    shipping_unit.received_from,
    harvester.ft_fa_code,
    harvester.fleet,
    harvester.fishing_area,
    harvester.supplier_group,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     LEFT JOIN harvester ON box.harvester_code::text = harvester.harvester_code::text
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code,
            max(scan_1."timestamp") AS "timestamp"
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON box.box_number::text = scan.box_number::text
     left join shipping_unit on box.shipping_unit_in = shipping_unit.shipping_unit_number
     left join lot on box.lot_number = lot.lot_number;

 alter view box_with_info owner to tuna_processor;
 
 
 create view ship_with_info as 
select 
  shipping_unit.po_number,
  shipping_unit.customer,
  shipping_unit.bill_of_lading,
  shipping_unit.vessel_name,
  shipping_unit.container_number,
  shipping_unit.timestamp,
  shipping_unit.received_from,
  shipping_unit.station_code,
  shipping_unit.shipping_unit_number,
  shipping_unit.seal_number,
  count(box.box_number) as boxes,
  sum(box.weight) as total_weight
  from shipping_unit, box
  where shipping_unit.shipping_unit_number = box.shipping_unit_number
  or shipping_unit.shipping_unit_number = box.shipping_unit_in
  group by shipping_unit.po_number,
  shipping_unit.customer,
  shipping_unit.bill_of_lading,
  shipping_unit.vessel_name,
  shipping_unit.container_number,
  shipping_unit.timestamp,
  shipping_unit.received_from,
  shipping_unit.station_code,
  shipping_unit.shipping_unit_number,
  shipping_unit.seal_number;

 alter view ship_with_info owner to tuna_processor;
 
 
 create view loin_with_info as 
SELECT scan.station_code,
    loin.lot_number,
    loin.loin_number,
    loin.box_number,
    loin.state,
    loin.state AS type,
    loin.weight_1,
    loin.weight_1 as weight,
    loin.grade,
    loin."timestamp",
    lot.internal_lot_code,
    harvester.fleet,
    harvester.landing_location,
    harvester.supplier,
    harvester.supplier_group,
    harvester.ft_fa_code,
    lot.start_date AS receive_date,
    harvester.fishing_area AS wpp
   FROM loin
   left join lot on lot.lot_number = loin.lot_number
   left join harvester on lot.harvester_code = harvester.harvester_code
   left join 
    ( SELECT scan_1.loin_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.loin_number, scan_1.station_code) scan on scan.loin_number = loin.loin_number;

   alter view loin_with_info owner to tuna_processor;
   
CREATE OR REPLACE VIEW lot_summary AS 
SELECT scan.lot_number,
    scan.station_code,
    sum(scan.pieces) AS pieces,
    sum(scan.weight_1) AS weight_1,
    NULL::bigint AS boxes
   FROM scan
  WHERE scan.lot_number IS NOT NULL AND scan.lot_number::text <> ''::text AND scan.weight_1 IS NOT NULL
  GROUP BY scan.lot_number, scan.station_code
UNION
 SELECT box_with_info.lot_number,
    box_with_info.station_code,
    null AS pieces,
    sum(box_with_info.weight) AS weight_1,
    count(box_with_info.box_number) AS boxes
   FROM box_with_info
  WHERE box_with_info.lot_number IS NOT NULL AND box_with_info.lot_number::text <> ''::text
  GROUP BY box_with_info.lot_number, box_with_info.station_code
UNION
 SELECT loin_with_info.lot_number,
    loin_with_info.station_code,
    count(loin_with_info.loin_number) AS pieces,
    sum(loin_with_info.weight_1) AS weight_1,
    NULL::bigint AS boxes
   FROM loin_with_info
  WHERE loin_with_info.lot_number IS NOT NULL AND loin_with_info.lot_number::text <> ''::text
  and loin_with_info.station_code not in (select station_code from scan where box_number is not null)
  GROUP BY loin_with_info.lot_number, loin_with_info.station_code;

  ALTER TABLE lot_summary
  OWNER TO tuna_processor; 



CREATE OR REPLACE VIEW totals_by_lot AS 
 SELECT scan.lot_number,
    scan.station_code,
    sum(scan.weight_1) AS weight_1,
    scan.grade,
    sum(scan.pieces) AS pieces,
    NULL::bigint AS boxes
   FROM scan
  WHERE scan.lot_number IS NOT NULL AND scan.lot_number::text <> ''::text AND scan.loin_number IS NULL AND scan.box_number IS NULL
  GROUP BY scan.lot_number, scan.station_code, scan.grade
UNION
 SELECT box_with_info.lot_number,
    box_with_info.station_code,
    sum(box_with_info.weight) AS weight_1,
    case
      when box_with_info.grade is not null then box_with_info.grade
      else box_with_info.product_type
    end as grade,
    null AS pieces,
    count(box_with_info.box_number) AS boxes
   FROM box_with_info
  WHERE box_with_info.lot_number IS NOT NULL AND box_with_info.lot_number::text <> ''::text
  GROUP BY box_with_info.lot_number, box_with_info.station_code, grade, box_with_info.product_type
UNION
 SELECT loin_with_info.lot_number,
    loin_with_info.station_code,
    sum(loin_with_info.weight_1) AS weight_1,
    loin_with_info.grade,
    count(loin_with_info.loin_number) AS pieces,
    NULL::bigint AS boxes
   FROM loin_with_info
  WHERE loin_with_info.lot_number IS NOT NULL AND loin_with_info.lot_number::text <> ''::text
  and loin_with_info.station_code not in (select station_code from scan where box_number is not null)
  GROUP BY loin_with_info.lot_number, loin_with_info.station_code, loin_with_info.grade
  order by grade;

ALTER TABLE totals_by_lot
  OWNER TO tuna_processor;
  
  
  
 DROP VIEW shipment_summary;

CREATE OR REPLACE VIEW shipment_summary AS 
SELECT
    box.shipping_unit_number,
    case
      when box.grade is not null then box.grade
      else product.product_type
    end as grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY box.shipping_unit_number, box.grade, box.size, scan.station_code, product.product_type

  union
  
  SELECT 
    box.shipping_unit_in as shipping_unit_number,
    case
      when box.grade is not null then box.grade
      else product.product_type
    end as grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY box.shipping_unit_in, box.grade, box.size, scan.station_code, product.product_type

  
  ORDER BY shipping_unit_number, grade;

  ALTER TABLE shipment_summary
  OWNER TO tuna_processor;
  
  
  
  

  DROP VIEW shipment_summary_more;

CREATE OR REPLACE VIEW shipment_summary_more AS 
SELECT
    box.shipping_unit_number,
    case
      when box.grade is not null then box.grade
      else product.product_type
    end as grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    box.harvester_code
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY box.shipping_unit_number, box.grade, box.size, scan.station_code, product.product_type, box.harvester_code

  union
  
  SELECT 
    box.shipping_unit_in as shipping_unit_number,
    case
      when box.grade is not null then box.grade
      else product.product_type
    end as grade,
    box.size,
    sum(box.weight) AS weight,
    count(box.box_number) AS boxes,
    scan.station_code,
    box.harvester_code
   FROM box
     LEFT JOIN ( SELECT scan_1.box_number,
            scan_1.station_code
           FROM scan scan_1
          GROUP BY scan_1.box_number, scan_1.station_code) scan ON scan.box_number::text = box.box_number::text
     LEFT JOIN product ON box.product_code::text = product.product_code::text
  GROUP BY box.shipping_unit_in, box.grade, box.size, scan.station_code, product.product_type, box.harvester_code

  
  ORDER BY shipping_unit_number, grade;

  ALTER TABLE shipment_summary_more
  OWNER TO tuna_processor;

  




