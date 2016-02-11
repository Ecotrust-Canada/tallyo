/* Replace with your SQL commands */
alter table box
  alter column timestamp set default now();
alter table loin
  alter column timestamp set default now();
alter table lot
  alter column timestamp set default now();
alter table scan
  alter column timestamp set default now();
alter table shipping_unit
  alter column timestamp set default now();
