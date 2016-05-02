
update box set size = upper(size);
update box set grade = upper(grade);
update shipping_unit set received_from = upper(received_from);
update lot set internal_lot_code = upper(internal_lot_code);
update box set internal_lot_code = upper(internal_lot_code);
update harvester set ft_fa_code = upper(ft_fa_code);
update box set case_number = upper(case_number);


