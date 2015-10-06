'use strict';

/*period defaults to day*/
/*creates a start date and end date from input date and period*/
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

/*checks whether a date is within a range*/
var DateRangeCurrent = function(date, start_date, end_date){
    if (date > start_date && date < end_date){
        return true;
    }
    return false;
};

/*checks that a json object has no "" values*/
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

/*checks that a json objects doesn't have all "" values*/
var NotEmpty = function(jsonobj){
    for (var key in jsonobj) {
      if (jsonobj.hasOwnProperty(key)) {
        if (jsonobj[key] !== '' || jsonobj[key] === undefined){
            return true;
        }
      }
    }
    return false;
};


/*checks if a json object with id parameter is in an array*/
var idNotInArray = function(array, id){
    for (var i=0;i<array.length;i++){
        if (String(array[i].id) === String(id)){
            return false;
        }
    }
    return true;
};

/*removes object with given id from array*/
var removeFromArray = function(array, id){
    for (var i=0;i<array.length;i++){
        if (String(array[i].id) === String(id)){
            array.splice(i,1);
        }
    }           
    return array;
};

/*checks if a value is in an array*/
var valueNotInArray = function(array, value){
    for (var i=0;i<array.length;i++){
        if (String(array[i]) === String(value)){
            return false;
        }
    }
    return true;
};

/*assigns results from date manipulation to scope*/
var CreateEntryPeriod = function(today, period, $scope){
    var dates = dateManipulation(today, period);
    $scope.lot_entry.start_date = dates.start_date;
    $scope.lot_entry.end_date = dates.end_date;
  };

/*sums weights of all objects in array*/
var CalculateBoxWeight = function(array){
    var totalweight = 0;
    for (var i=0;i<array.length;i++){
        totalweight += array[i].weight_1;
    }
    return totalweight;
};

/*box lot number is mode of all item lot numbers*/
var GetBoxLotNumber = function(arr) {
    var lotarray = fjs.pluck("lot_number", arr);
    var numMapping = {};
    var greatestFreq = 0;
    var mode;
    lotarray.forEach(function findMode(number) {
        numMapping[number] = (numMapping[number] || 0) + 1;

        if (greatestFreq < numMapping[number]) {
            greatestFreq = numMapping[number];
            mode = number;
        }
    });
    return mode;
};


/*initialize display of scan/summary table*/
var InitShowSummary = function($scope){
    $scope.showScan = true;
    $scope.showSummary = false;
    $scope.view_summary = "view summary";
};

/*clear a form*/
var ClearForm = function($scope){
    $scope.form = null;
  };

/*clear an entry*/
var ClearEntry = function(scopevar, $scope){
    for (var key in $scope[scopevar]){
      if (key !== 'station_id' && key !== 'stage_id'){
        $scope[scopevar][key] = "";
      }
    }
  };


/*clear form and entry*/
var Clear = function(scopevar, $scope){
    ClearForm($scope);
    ClearEntry(scopevar, $scope);
  };

/*fill in fields in entry*/
var MakeEntry = function(form, scopevar, $scope){
    for (var key in form){
        $scope[scopevar][key] = form[key];
    }
  };

