create table increment_case (serial_id serial, to_increment integer);
alter table increment_case owner to tuna_processor;


insert into increment_case values(1,1);
