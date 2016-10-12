create or replace view box_fleet as
select box.box_number, box.shipping_unit_in, box.case_number,
box.size, box.grade, box.weight, harvester.fleet, scan.timestamp, 
scan.station_code, box.lot_number, box.shipping_unit_number
from box
left join harvester on box.harvester_code = harvester.harvester_code
left join scan
on scan.box_number = box.box_number;

alter view box_fleet owner to tuna_processor;
