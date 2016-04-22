create view today_total_ship as 
select 
shipping_unit_in,
received_from, 
harvester_code,
fleet,
count(box_number) as boxes, 
station_code
from box_with_info 
where timestamp::date = now()::date
group by shipping_unit_in, harvester_code, 
station_code, received_from, fleet
order by station_code;

alter view today_total_ship owner to tuna_processor;



create view today_total_lot as 
select 
lot_number,
internal_lot_code, 
count(box_number) as boxes, 
station_code
from box_with_info 
where timestamp::date = now()::date
group by 
station_code, lot_number, internal_lot_code
order by station_code;


alter view today_total_lot owner to tuna_processor;


create view inventory_all as

SELECT *
   FROM box_with_info t1
  WHERE NOT (EXISTS ( SELECT t2.box_number
           FROM scan t2
          WHERE t2.box_number::text = t1.box_number::text AND t2."timestamp" > t1."timestamp"))
  order by station_code;


alter view inventory_all owner to tuna_processor;
