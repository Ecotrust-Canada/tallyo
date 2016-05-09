/* Replace with your SQL commands */


drop view if exists totals_by_lot cascade;
drop view if exists shipment_summary_more cascade;
drop view if exists shipment_summary cascade;
drop view if exists select_lot cascade;
drop view if exists lot_summary cascade;
drop view if exists lot_aggregated cascade;
drop view if exists loin_scan cascade;
drop view if exists loin_lot cascade;
drop view if exists harvester_lot cascade;
drop view if exists expandedlotlocations cascade;
drop view if exists box_scan cascade;
drop view if exists box_inventory cascade;

drop table if exists box cascade;
drop table if exists formoptions cascade;
drop table if exists harvester cascade;
drop table if exists loin cascade;
drop table if exists lot cascade;
drop table if exists lotlocations cascade;
drop table if exists processor cascade;
drop table if exists product cascade;
drop table if exists scan cascade;
drop table if exists shipping_unit cascade;
