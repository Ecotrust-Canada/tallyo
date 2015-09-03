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
    var lot_num = (String(receive_lot).substring(0,1)).concat(String(prod_id)).concat(datestring);
    return lot_num;
}



