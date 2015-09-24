'use strict';

/*period defaults to day*/
var dateManipulation = function(date, period){
    if (period !== 'day' && period !== 'week'){
        period = 'day';
    }
    var dates;
    if (period === 'week'){
        dates = {
        'postgres_date': moment(date).format(),
        'start_date': moment(date).startOf('isoWeek'),
        'end_date': moment(date).endOf('isoWeek')
        };
    }
    else if (period === 'day'){
        dates = {
        'postgres_date': moment(date).format(),
        'start_date': moment(date).startOf('day'),
        'end_date': moment(date).endOf('day')
        };
    }
    return dates;
};

/* for now creates unique id by using stage id and current date and time*/
var createLotNum = function(stage_id, date){
    var datestring = moment(date.valueOf()).format('-DDMMYYYY-HHmmss');
    return String(stage_id) + datestring;
};

/*creates a querystring from a json object*/
var LotQuery = function(params){
    var queryString = '?';
    //todo: first without &, rest with
    queryString = queryString + ['supplier_id','previous_lot_number','product_id','lot_number'].map(function(param){
      if (typeof params[param] !== 'undefined'){
        return param + '=eq.' + params[param];
      }
      else{
        return '';
      }      
    }).join('');

    if (typeof params.date !== 'undefined'){
      var date = moment(params.date).format();
      queryString = queryString.concat('&start_date=lt.' + date + '&end_date=gt.' + date);
    }
    return queryString;
  };


var DateRangeCurrent = function(date, start_date, end_date){
    if (date > start_date && date < end_date){
        return true;
    }
    return false;
};


var NoMissingValues = function(jsonobj){
    for (var key in jsonobj) {
      if (jsonobj.hasOwnProperty(key)) {
        if (jsonobj[key] === '' || jsonobj[key] === undefined){
            return false;
        }
      }
    }
    return true;
};

var idNotInArray = function(array, id){
    for (var i=0;i<array.length;i++){
        if (String(array[i].id) === String(id)){
            return false;
        }
    }
    return true;
};

var removeFromArray = function(array, id){
    for (var i=0;i<array.length;i++){
        if (String(array[i].id) === String(id)){
            array.splice(i,1);
        }
    }           
    return array;
};


var valueNotInArray = function(array, value){
    for (var i=0;i<array.length;i++){
        if (String(array[i]) === String(value)){
            return false;
        }
    }
    return true;
};


var CreateEntryPeriod = function(today, period, $scope){
    var dates = dateManipulation(today, period);
    $scope.lot_entry.start_date = dates.start_date;
    $scope.lot_entry.end_date = dates.end_date;
  };






