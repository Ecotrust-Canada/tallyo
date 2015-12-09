'use strict';

angular.module('scanthisApp.formController', [])



/*
 * Creates a form from info in form table
 */
.controller('formCtrl', function($scope, $http, DatabaseServices) {

  $scope.FormData = function(table){
    var func = function(response){
      $scope.formarray = response.data[0].form.fields;
      $scope.entry[table] = response.data[0].entry;
      //$scope.form = {};
      $scope.form = ClearFormToDefault($scope.form, $scope.formarray);      
    };
    var query = '?tablename=eq.' + table + '&station_code=eq.' + $scope.station_code;
    DatabaseServices.GetEntryNoAlert('form', func, query);
  };

  $scope.init = function(table){
    $scope.table = table;
    $scope.FormData($scope.table);
  };

})

.controller('entryformCtrl', function($scope, $http, DatabaseServices) {
  
    $scope.formarray = $scope.config.fields;  
    $scope.form = ClearFormToDefault($scope.form, $scope.formarray);

    $scope.Clear = function(){
      $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
    };

    $scope.$watch('formchange', function(newValue, oldValue) {
    if ($scope.formchange !== undefined){
      $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
    }
  });

})

.controller('FormSubmitCtrl', function($scope, $http, DatabaseServices, toastr) {
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
    $scope.list[$scope.table].push(thedata);
  };
  var AddSetCurrent = function(response){
    var thedata = response.data;
    $scope.list[$scope.table].push(thedata);
    $scope.current.collectionid = thedata[$scope.station_info.collectionid];
  };
  var AddSetCurrentDB = function(response){
    var thedata = response.data;
    $scope.list[$scope.table].push(thedata);
    $scope.StationCurrent(thedata[$scope.station_info.collectionid]);
  };

  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
      responsefunction(response);
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryReturn($scope.table, $scope.entry[$scope.table], func);
    }
    else{ toastr.error("empty form"); }  
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    if ($scope.entry[$scope.table].timestamp === ''){$scope.entry[$scope.table].timestamp = moment(new Date()).format();}
    if ($scope.entry[$scope.table].station_code === ''){$scope.entry[$scope.table].station_code = $scope.station_code;}
    if ($scope.entry[$scope.table].best_before_date === '') {$scope.entry[$scope.table].best_before_date = moment(new Date()).add(2, 'years').format();}
    if ($scope.table === 'box'){$scope.entry.box.box_number = createBoxNum(moment(new Date()).format());}
    if ($scope.table === 'shipping_unit'){$scope.entry.shipping_unit.shipping_unit_number = createShipNum(moment(new Date()).format());}
    MakeEntry(form, $scope.table, $scope);
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








/*
 * Splits String into several fields
 */
.controller('QRScanCtrl', function($scope, $http, DatabaseServices) {


  $scope.change = function(){
    var rawArray = $scope.raw.string.split("|");
    for (var i=0;i<$scope.valuesarray.length;i++){
      $scope.form[$scope.valuesarray[i]] = rawArray[i];
    }
    //This is still only for one page
    $scope.MakeBox();
  };

  $scope.init = function(valuesArray){
    $scope.valuesarray = valuesArray;
  };

  })


.controller('NewFormScope', function($scope, $http, DatabaseServices) {
  $scope.form = {};
  $scope.addnew = true;

})



;
