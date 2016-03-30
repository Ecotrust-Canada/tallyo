DROP VIEW box_product;

CREATE OR REPLACE VIEW box_product AS 
 SELECT box.box_number,
    box.case_number,
    scan.station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.shipping_unit_number,
    box.species,
    box.timestamp,
    box.best_before_date,
    harvester.ft_fa_code,
    harvester.fleet,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code,
    box.internal_lot_code
   FROM box
     LEFT JOIN product ON box.product_code::text = product.product_code::text
     left join lot on box.lot_number = lot.lot_number
     left join harvester on lot.harvester_code = harvester.harvester_code
     left join 
     (select box_number, station_code from scan
     group by box_number, station_code) as scan
     on box.box_number = scan.box_number;


ALTER TABLE box_product
  OWNER TO tuna_processor;



drop view loin_detail;
create view loin_detail as 

select 
scan.station_code,
loin.lot_number,
null as spacer,
loin.loin_number,
loin.state as type,
loin.weight_1,
loin.grade,
loin.timestamp,
lot.internal_lot_code,
harvester.fleet,
harvester.landing_location, 
harvester.supplier,
harvester.supplier_group,
harvester.ft_fa_code,
lot.start_date as receive_date,
harvester.fishing_area as wpp
from loin, harvester, lot, 
(select loin_number, station_code from scan
group by loin_number, station_code) as scan
where loin.lot_number = lot.lot_number 
and lot.harvester_code = harvester.harvester_code
and scan.loin_number = loin.loin_number;

alter view loin_detail owner to tuna_processor;

drop view box_sum;
create view box_sum as 
select 
scan.station_code,
box.lot_number,
box.shipping_unit_number,
null as spacer,
box.box_number,
box.case_number,
box.timestamp,
box.weight as box_weight,
box.internal_lot_code as box_internal_lot_code,
h1.fleet,
box.pieces,
box.size,
h1.supplier_group,
h1.fishing_area as wpp,
box.best_before_date
from box, lot l1, harvester h1,
(select box_number, station_code from scan
group by box_number, station_code) as scan
where box.lot_number = l1.lot_number 
and l1.harvester_code = h1.harvester_code
and box.box_number = scan.box_number 
order by box_number;

alter view box_sum owner to tuna_processor;


drop view box_detail;
create view box_detail as 

select 
scan.station_code,
box.lot_number,
box.shipping_unit_number,
box.box_number,
box.case_number,
box.timestamp,
box.weight as box_weight,
box.internal_lot_code as box_internal_lot_code,
h1.fleet,
box.pieces,
box.size,
h1.supplier_group,
h1.fishing_area as wpp,
box.best_before_date,
'     ' as loins,
loin.loin_number, 
loin.weight_1 as loin_weight, 
harvester.supplier, 
lot.internal_lot_code as loin_internal_lot_code, 
harvester.ft_fa_code, 
harvester.landing_location, 
lot.start_date as receive_date
from box, loin, lot, harvester, lot l1, harvester h1, 
(select box_number, station_code from scan
group by box_number, station_code) as scan
where box.box_number = loin.box_number
and loin.lot_number = lot.lot_number 
and lot.harvester_code = harvester.harvester_code 
and box.lot_number = l1.lot_number 
and l1.harvester_code = h1.harvester_code 
and box.box_number = scan.box_number 
order by box_number;

alter view box_detail owner to tuna_processor;


drop view scan_detail;
create view scan_detail as 
select 
scan.station_code,
scan.lot_number,
null as spacer,
scan.weight_1,
scan.grade,
scan.timestamp,
scan.state,
lot.internal_lot_code,
harvester.fleet,
harvester.landing_location, 
harvester.supplier,
harvester.supplier_group,
harvester.ft_fa_code,
lot.start_date as receive_date,
harvester.fishing_area as wpp
from scan, harvester, lot
where scan.lot_number = lot.lot_number 
and lot.harvester_code = harvester.harvester_code;

alter view scan_detail owner to tuna_processor;
