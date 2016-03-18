'use strict';

/*period defaults to day*/
/*creates a start date and end date from input date and period*/
var dateManipulation = function(date, period){
    var momentper;
    var dates;
    if (period === 'week'){
      momentper = 'isoWeek';
    }
    else if (period === 'day'){
      momentper = 'day';
    }
    else{
      momentper = 'day';
    }
    dates = {
      'postgres_date': moment.parseZone(date).format(),
      'start_date': moment.parseZone(date).startOf(momentper).format(),
      'end_date': moment.parseZone(date).endOf(momentper).format()
    };
    return dates;
};

var createProdCode = function(date){
  var datestring = moment(date.valueOf()).format('-DDDYY-HHmmss');
  return 'P' +  datestring;
};


/*checks whether a date is within a range*/
var DateRangeCurrent = function(date, start_date, end_date){
    if (date > start_date && date < end_date){
        return true;
    }
    return false;
};



/*checks that a json object has no "" values*/
var NoMissingValues = function(jsonobj, except){
    for (var key in jsonobj) {
      if (jsonobj.hasOwnProperty(key) && key !== except) {
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


var CreateLotEntryPeriod = function(today, period, $scope){
    var dates = dateManipulation(today, period);
    $scope.entry.lot.start_date = dates.start_date;
    $scope.entry.lot.end_date = dates.end_date;
  };

/*sums weights of all objects in array*/
var CalculateBoxWeight = function(array){
    var totalweight = 0;
    for (var i=0;i<array.length;i++){
        if (array[i].weight_1){
            totalweight += array[i].weight_1;
        }
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


/*fill in fields in entry*/
var MakeEntry = function(form, scopevar, $scope){
    for (var key in form){
        $scope.entry[scopevar][key] = form[key];
    }
  };


var ClearFormToDefault = function(form_arr, def_arr){
    for (var i=0;i<def_arr.length;i++){
      if (def_arr[i].type === 'text'){
        if (!def_arr[i].stay){
          form_arr[def_arr[i].fieldname] = def_arr[i].value;
        }
      }
      else if (def_arr[i].type === 'radio' && def_arr[i].value.length == 2){
        if (!def_arr[i].stay){
          form_arr[def_arr[i].fieldname] = def_arr[i].value[0].val;
        }
      }
      else{
        if (!def_arr[i].stay){
          form_arr[def_arr[i].fieldname] = "";
        }
        else if (!form_arr[def_arr[i].fieldname]){
          form_arr[def_arr[i].fieldname] = "";
        }        
      }
    }
    return form_arr;
  };

var QRCombine = function (stringarray){
   var qrstring = function (arg1, arg2){
     return String(arg1) + '/' + String(arg2);
   };
   var qrstringReduce = fjs.reduce(qrstring);
   return qrstringReduce(stringarray);
};

var ArrayFromJson = function(json, stringarray){
  var newarray = [];
  for (var i=0;i<stringarray.length;i++){
    if (stringarray[i] === 'weight' || stringarray[i] === 'weight_1'){
      json[stringarray[i]] = parseFloat(json[stringarray[i]]).toFixed(2);
    }
    newarray.push(json[stringarray[i]]);
  }
  return newarray;
};

var dataCombine = function (json, stringarray){
  var newarray = ArrayFromJson(json, stringarray);
  return QRCombine(newarray);
};


//indexOf for an array of json objects
var arrayObjectIndexOf = function(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
};

// + character disapears from url, this fixes that
var cleanQueryString = function(querystring){
  var queryStringNew = querystring.replace("+", "&#x2B;");
  return queryStringNew;
};




var cleanJsonArray = function(array){

  var cleanJson = function(element, index, array){
    for (var key in element) {
      if (element.hasOwnProperty(key)) {
        if (element[key] === '' || element[key] === undefined  || element[key] === null){
            delete element[key];
        }
      }
    }
  };

  array.forEach(cleanJson);
};

var padz = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

var tableInfo = function(table){
  if (table === 'box'){
    return {letter:'B', field: 'box_number'};
  }
  else if (table === 'loin'){
    return {letter:'T', field:'loin_number'};
  }
  else if (table === 'lot'){
    return {letter:'L', field:'lot_number'};
  }
  else if (table === 'shipping_unit'){
    return {letter:'S', field:'shipping_unit_number'};
  }
  else if (table === 'harvester'){
    return {letter:'H', field:'harvester_code'};
  }
};

var isInArray = function(value, array) {
  return array.indexOf(value) > -1;
};

var AddtoEntryNonFormData = function($scope, table){
  $scope.entry[table][$scope.station_info.collectionid] = $scope.current.collectionid;
  $scope.entry[table].station_code = $scope.station_code;
  if($scope.current[$scope.station_info.collectiontable] && $scope.current[$scope.station_info.collectiontable].internal_lot_code){
    $scope.entry[table].internal_lot_code = $scope.current[$scope.station_info.collectiontable].internal_lot_code;
  }
};

var AddtoEntryFormData = function(form, scopevar, $scope){
  for (var key in form){
      $scope.entry[scopevar][key] = form[key];
  }
};

var onlyUnique = function(value, index, self) { 
    return self.indexOf(value) === index;
};

var copyArrayPart = function(array, fields){
  var newarray = [];
  for (var i=0;i<array.length;i++){
    var obj = {};
    for (var j=0;j<fields.length;j++){
      obj[fields[j]] = array[i][fields[j]];
    }
    newarray.push(obj);
  }
  return newarray;
};



var sizefromweight = function(weight_kg){
  var size;
  if (weight_kg < 1.36){
    size = "1-3 lb";
  }
  else if (weight_kg > 1.36 && weight_kg < 2.27){
    size = "3-5 lb";
  }
  else if (weight_kg > 2.27 && weight_kg < 3.63){
    size = "5-8 lb";
  }
  else if (weight_kg > 3.63){
    size = "8-up lb";
  }
  return size;
};


var formIsValid = function($scope){
  
};

var confirmTrue = function(message, func, elsefunc){
  var alert = confirm(message);
  if (alert === true){
    func();
  }
  else{
    elsefunc(); //this is the ng-model for the input form
  }
};


var copyObj = function(obj) {
  var copy = Object.create(Object.getPrototypeOf(obj));
  var propNames = Object.getOwnPropertyNames(obj);
  console.log(propNames);

  propNames.forEach(function(name) {
    var desc = Object.getOwnPropertyDescriptor(obj, name);
    console.log(desc);
    Object.defineProperty(copy, name, desc);
  });

  return copy;
};

var clearObj = function(obj) {
  var propNames = Object.getOwnPropertyNames(obj);

  propNames.forEach(function(name) {
    obj[name] = null;
  });
};

var isDescendant = function(parent, child) {
     var node = child.parentNode;
     while (node !== null) {
         if (node === parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
};

var propertyNames = function(obj){
  var propNames = Object.getOwnPropertyNames(obj);
  var props = propNames.filter(function(el){
    return el.substring(0,1) !== '$';
  });
  return props;
};



var DateGroup = function(today){
  var day = parseInt(today);
  var date_group = '';
  if (day <= 5){
    date_group = 1;
  }
  else if (day >= 6 && day <=10){
    date_group = 2;
  }
  else if (day >= 11 && day <=15){
    date_group = 3;
  }
  else if (day >= 16 && day <=20){
    date_group = 4;
  }
  else if (day >= 21 && day <=25){
    date_group = 5;
  }
  else if (day >= 26){
    date_group = 6;
  }
  return date_group;
};

var LoinCode = function(state){
  var loin_code = '';
  if (state === 'Dirty'){
    loin_code = 8;
  }
  else if (state === 'Clean'){
    loin_code = 9;
  }
  return loin_code;
};

var cutString = function (str, cutStart, cutEnd){
  if (!str) return;  
  return str.substr(0,cutStart) + str.substr(cutEnd+1);
};

var eventFire = function(el, etype){
  if(el){
    if (el.fireEvent) {
      el.fireEvent('on' + etype);
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
  }
};
