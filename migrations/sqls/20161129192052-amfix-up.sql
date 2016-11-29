update box set box_number =  'B-AM2-' || upper(to_hex(serial_id)) where box_number is null and station_code = 'AM2-004';
