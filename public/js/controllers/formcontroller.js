'use strict';

angular.module('scanthisApp.formController', [])




.controller('entryformCtrl', function($scope, $http, DatabaseServices) {


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
  };

  $scope.$watch('formchange', function(newValue, oldValue) {
    if ($scope.formchange !== undefined){
      $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
    }
  });

  $scope.hidefn = function(){
    if ($scope.config.hide){
      $scope.hideform = true;
    }
  };

})

.controller('FormSubmitCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.form = {};
  var table = $scope.station_info.collectiontable;
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
      $scope.entry.lot.lot_number = 'placeholder';
      $scope.entry[table].timestamp = date;
      CreateLotEntryPeriod(date, 'day', $scope);
      $scope.entry[table].station_code = $scope.station_code;
    }
    if ($scope.station_info.collectiontable === 'harvester'){
      $scope.entry.harvester.processor_code = $scope.processor;
      $scope.entry.harvester.active = true;
    }
    MakeEntry(form, table, $scope);
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

;
