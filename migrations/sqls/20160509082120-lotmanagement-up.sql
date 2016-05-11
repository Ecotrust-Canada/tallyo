 alter table box add column lot_in character varying;

  alter table box add constraint lotinbox foreign key (lot_in) references lot (lot_number);