var dateManipulation = function(date){
    var dates = {
    'postgres_date': moment(date.valueOf()).format(),
    'start_date': moment(date.valueOf()).startOf('isoWeek'),
    'end_date': moment(date.valueOf()).endOf('isoWeek')
    };
    return dates;
}

var createLotNum = function(date, sup_id){
    var datestring = moment(date.valueOf()).format('DDMMYYYY');
    var lot_num = (String(sup_id)).concat(datestring);
    return lot_num;
}

var CreateProductionLotNumber = function(prod_id, receive_lot, date){
    var datestring = moment(date.valueOf()).format('DDMMYYYY');
    var lot_num = (String(receive_lot).substring(0,5)).concat(String(prod_id)).concat(datestring);
    return lot_num;
}







var InitReceivingLotEntry = function(plant_settings){
    var jsonobj = {
        'lot_number': '',
        'id_supplier': '',
        'in_prod': 'false',
        'start_date': '',
        'end_date': ''
    };
    return jsonobj;
}


var InitReceivingEntry = function(plant_settings){
    var jsonobj = {
        'weight': '',
        'timestamp': '',
        'lot_number_receiving_lots': '',
        'end_date': ''
    };
    if (plant_settings.grade === 'true'){
        jsonobj.grade = '';
    }
    return jsonobj;
}


var CreateReceivingLotQuery = function(plant_settings, re_lot_entry, date){
    var url = plant_settings.database_url;
    url = url.concat('/receiving_lots?');
    if (plant_settings.re_query_date_in_range === 'true'){
        url.concat('&start_date=lt.' + date + '&end_date=gt.' + date)
    }
}



