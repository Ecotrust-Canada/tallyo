drop view box_sum;
drop view box_detail;
create view box_detail as 

select 
box.station_code,
box.lot_number,
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
from box, loin, lot, harvester, lot l1, harvester h1
where box.box_number = loin.box_number
and loin.lot_number = lot.lot_number 
and lot.harvester_code = harvester.harvester_code 
and box.lot_number = l1.lot_number 
and l1.harvester_code = h1.harvester_code 
order by box_number;

alter view box_detail owner to tuna_processor;

drop view scan_detail;
create view scan_detail as 
select 
scan.station_code,
scan.lot_number,
scan.weight_1,
scan.grade,
scan.timestamp,
scan.state,
lot.internal_lot_code,
harvester.fleet,
harvester.supplier,
harvester.supplier_group,
harvester.ft_fa_code,
lot.start_date as receive_date,
harvester.fishing_area as wpp
from scan, harvester, lot
where scan.lot_number = lot.lot_number 
and lot.harvester_code = harvester.harvester_code;

alter view scan_detail owner to tuna_processor;

drop view loin_detail;
create view loin_detail as 

select 
loin.station_code,
loin.lot_number,
loin.loin_number,
loin.state as type,
loin.weight_1,
loin.grade,
loin.timestamp,
lot.internal_lot_code,
harvester.fleet,
harvester.supplier,
harvester.supplier_group,
harvester.ft_fa_code,
lot.start_date as receive_date,
harvester.fishing_area as wpp
from loin, harvester, lot
where loin.lot_number = lot.lot_number 
and lot.harvester_code = harvester.harvester_code;

alter view loin_detail owner to tuna_processor;

