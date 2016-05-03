create view box_search as 
select box.box_number, 
box.case_number, 
lot.internal_lot_code,
lot.harvester_code,
harvester.fleet,
harvester.supplier_group,
harvester.supplier,
box.timestamp,
case
  when box.shipping_unit_number is not null then 'shipped'
  else 'inventory'
 end as status
from box
inner join loin on loin.box_number = box.box_number
left join lot on loin.lot_number = lot.lot_number
left join harvester on lot.harvester_code = harvester.harvester_code
group by box.box_number, lot.internal_lot_code, box.case_number, 
box.shipping_unit_number, lot.harvester_code, harvester.fleet,
harvester.supplier_group, box.timestamp,
harvester.supplier;


alter view box_search owner to tuna_processor;
