'use strict';

angular.module('scanthisApp.formController', [])

.controller('entryformCtrl', function($scope, $http, DatabaseServices) {
  if ($scope.config.startpolling){
    $scope.pollScale = true;
  }
  $scope.editdrop = {};
  $scope.hideform = false;
  if ($scope.config.hide){
    $scope.hideform = true;
  }

  if($scope.config.dboptions){
    var table = $scope.config.dboptions;
    var func = function(response){
      $scope.formoptions = response.data; 
    };

    var query = '?table_name=eq.' + table;
    DatabaseServices.GetEntries('formoptions', func, query);
  }

  $scope.formarray = $scope.config.fields;  

  $scope.Clear = function(){
    $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
    if ($scope.config.startpolling) {
      $scope.pollFn({field: $scope.config.startpolling});
    }
  };

  $scope.$watch('formchange', function(newValue, oldValue) {
    if ($scope.formchange !== undefined){
      $scope.Clear();
    }
  });

  $scope.hidefn = function(){
    if ($scope.config.hide){
      $scope.hideform = true;
    }
  };

  $scope.scalefn = function(){
    if ($scope.pollScale===true){
      for (var i=0;i<$scope.formarray.length;i++){
        if ($scope.formarray[i].pollarg){
          $scope.form[$scope.formarray[i].fieldname]= null;
        }
      }
    }
    $scope.pollScale = !$scope.pollScale;
  };


  $scope.FormData = function(table){
    var func = function(response){
      $scope.formoptions = response.data; 
    };
    var query = '?table_name=eq.' + table;
    DatabaseServices.GetEntryNoAlert('formoptions', func, query);
    };

  $scope.Delete = function(value, field){
    var query='?table_name=eq.' + $scope.config.dboptions + '&value=eq.' + value + '&field_name=eq.' + field;
    var func = function(response){
      $scope.FormData($scope.config.dboptions);
    };
    DatabaseServices.RemoveEntry('formoptions', query, func);
  };

  $scope.New = function(value, field){
    if (value){
      var entry ={"table_name": $scope.config.dboptions, "value": value, "field_name": field};
      var func = function(response){
        $scope.FormData($scope.config.dboptions);
      };
      DatabaseServices.DatabaseEntry('formoptions', entry, func);
    }    
  };

  if ($scope.config.dboptions){
    $scope.FormData($scope.config.dboptions);
  }
})

.controller('FormSubmitCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.form = {};
  var table;
  if($scope.formtable){
    table = $scope.formtable;
  }else{
    table = $scope.station_info.collectiontable;
  }
  
  $scope.entry[table] = {};
  $scope.formchange = true;

  //response functions
  var AddtoList = function(thedata){
    $scope.list[table].push(thedata);
  };
  var AddSetCurrent = function(thedata){
    $scope.list.collection.push(thedata);
    $scope.current.collectionid = thedata[$scope.station_info.collectionid];
  };

  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      responsefunction((response.data[0] ? response.data[0] : response.data));
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryCreateCode(table, $scope.entry[table], $scope.processor, func);
    }
    else{ toastr.error("empty form"); }  
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    var date = moment(new Date()).format();    
    if ($scope.station_info.collectiontable === 'box'){
      $scope.entry[table].timestamp = date;
      $scope.entry[table].station_code = $scope.station_code;
      $scope.entry[table].best_before_date = moment(new Date()).add(2, 'years').format();
    }
    if ($scope.station_info.collectiontable === 'shipping_unit'){
      $scope.entry[table].timestamp = date;
      $scope.entry[table].station_code = $scope.station_code;
    }
    if ($scope.station_info.collectiontable === 'lot'){
      $scope.entry[table].timestamp = date;
      CreateLotEntryPeriod(date, 'day', $scope);
      $scope.entry[table].station_code = $scope.station_code;
      $scope.entry[table].processor_code = $scope.processor;
    }
    if ($scope.options.receivelot){
      $scope.entry.harvester.processor_code = $scope.processor;
      $scope.entry.harvester.active = true;
    }
    MakeEntry(form, table, $scope);
    //console.log(table);
    $scope.ToDatabase(responsefunction);
  };

  //The different submit buttons
  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, AddtoList);
  };

  $scope.SubmitAddSetCurrent = function(form){
    $scope.Submit(form, AddSetCurrent);
  };

})

.controller('ListCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.getArray = function(){
    return copyArrayPart($scope.itemlist, $scope.config.fields);
  };
  $scope.getHeader = function(){
    return $scope.config.headers;
  };

})

.controller('AddtoTableCtrl', function($scope, $http, DatabaseServices, toastr) {
  var table = $scope.tableinform;

  $scope.form = {};
  $scope.entry[table] = {};
  $scope.formchange = true;


  var AddtoList = function(response){
    var thedata = response.data;
    if ($scope.list[table] !== undefined){
      $scope.list[table].push(thedata);
      toastr.success("added");
    }    
  };

  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      responsefunction(response);
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryReturn(table, $scope.entry[table], func);
    }
    else{ toastr.error("empty form"); }
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    if (table === 'product'){
      $scope.entry.product.product_code = ($scope.form.sap_item_code ? $scope.form.sap_item_code : createProdCode(new Date()));
      MakeEntry(form, 'product', $scope);
      $scope.entry.product.best_before = ($scope.form.best_before ? moment.duration($scope.form.best_before, 'years') : moment.duration(1, 'years'));
    }
    else{
      MakeEntry(form, table, $scope);
    }
    $scope.ToDatabase(responsefunction);
  };

  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, AddtoList);
  };

})

.controller('FieldsetCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.choices = [{id: 'choice1'}];
  
  $scope.addNewChoice = function() {
    var newItemNo = $scope.choices.length+1;
    $scope.choices.push({'id':'choice'+newItemNo});
  };
    
  $scope.removeChoice = function() {
    var lastItem = $scope.choices.length-1;
    $scope.choices.splice(lastItem);
  };

  
})

;
