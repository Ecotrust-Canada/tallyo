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
      if ($scope.config.startpolling) {
        $scope.pollFn({field: $scope.config.startpolling});
      }
    };

    $scope.$watch('formchange', function(newValue, oldValue) {
      if ($scope.formchange !== undefined){
        //var state = $scope.form.state;
        $scope.Clear();
        /*if (state){
          $scope.form.state = state;
        }*/
        
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
  

  //patches station with current_collectionid
  $scope.StationCurrent = function(id){
    var today = moment(new Date()).format();
    var patch = {'current_collectionid': id, 'collectionid_date': today};
    var query = '?code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.current.collectionid = id;
    };
    DatabaseServices.PatchEntry('station', patch, query, func);
  };

  //response functions

  var AddDB = function(response){

  };

  var AddtoList = function(response){
    var thedata = response.data;
    $scope.list[table].push(thedata);
  };
  var AddSetCurrent = function(response){
    var thedata = response.data;
    $scope.list.collection.push(thedata);
    $scope.current.collectionid = thedata[$scope.station_info.collectionid];
  };
  var AddSetCurrentDB = function(response){
    var thedata = response.data;
    $scope.list[table].push(thedata);
    $scope.StationCurrent(thedata[$scope.station_info.collectionid]);
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
    var date = moment(new Date()).format();    
    if ($scope.station_info.collectiontable === 'box'){
      $scope.entry[table].timestamp = date;
      $scope.entry[table].station_code = $scope.station_code;
      $scope.entry[table].best_before_date = moment(new Date()).add(2, 'years').format();
      $scope.entry[table].box_number = createBoxNum(moment(new Date()).format());
    }
    if ($scope.station_info.collectiontable === 'shipping_unit'){
      $scope.entry[table].timestamp = date;
      $scope.entry[table].station_code = $scope.station_code;
      $scope.entry[table].shipping_unit_number = createShipNum(moment(new Date()).format());
    }
    if ($scope.station_info.collectiontable === 'lot'){
      $scope.entry[table].timestamp = date;
      CreateLotEntryPeriod(date, 'day', $scope);
      $scope.entry[table].station_code = $scope.station_code;
      $scope.entry[table].lot_number = createLotNum($scope.station_code, moment(new Date()).format());
    }
    

    MakeEntry(form, table, $scope);
    //console.log($scope.entry[table]);
    $scope.ToDatabase(responsefunction);
  };

  //The different submit buttons
  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, AddtoList);
  };

  $scope.SubmitAddSetCurrent = function(form){
    $scope.Submit(form, AddSetCurrent);
  };

  $scope.SubmitAddSetCurrentDB = function(form){
    $scope.Submit(form, AddSetCurrentDB);
  };

  $scope.SubmitAddDB = function(form){
    $scope.Submit(form, AddDB);
  };

})

;
