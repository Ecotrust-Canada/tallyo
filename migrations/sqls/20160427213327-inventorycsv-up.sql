create view inventory_detail as
    select * from box_detail where box_number in 
(select box_number from inventory_all);


alter view inventory_detail owner to tuna_processor;
