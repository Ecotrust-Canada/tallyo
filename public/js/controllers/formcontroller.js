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
 * Submit button that:
 * pushes responses to arbitrary table
 * sets current.collectionid
 */
.controller('FormSubmitCurrentCtrl', function($scope, $http, DatabaseServices, toastr) {

  /*submits the form to the database*/
    $scope.ToDatabase = function(){
      var func = function(response){
        $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
        var thedata = response.data;
        $scope.list[$scope.table].push(thedata);
        $scope.current.collectionid = thedata[$scope.station_info.collectionid];
      };
      if (NotEmpty($scope.form)){
        DatabaseServices.DatabaseEntryReturn($scope.table, $scope.entry[$scope.table], func);
      }
      else{ toastr.error("empty form"); }  
    };

    /*fills in entry json obj from form, sends to database*/
    $scope.Submit = function(form){
      if ($scope.entry[$scope.table].timestamp === ''){$scope.entry[$scope.table].timestamp = moment(new Date()).format();}
      if ($scope.entry[$scope.table].station_code === ''){$scope.entry[$scope.table].station_code = $scope.station_code;}
      if ($scope.entry[$scope.table].best_before_date === '') {$scope.entry[$scope.table].best_before_date = moment(new Date()).add(2, 'years').format();}
      MakeEntry(form, $scope.table, $scope);
      $scope.ToDatabase();
    };

})


/*
 * Submit button that:
 * //pushes responses to arbitrary table
 * sets current.collectionid
 * databse patch for collectionid in station
 * resets list.included
 */
.controller('SubmitSetCurrentCtrl', function($scope, $http, DatabaseServices, toastr) {

  /*submits the form to the database*/
    $scope.ToDatabase = function(){
      var func = function(response){
        $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
        var thedata = response.data;
        
        //If I add a drop-down then will need this - if statement, I guess
        //$scope.list[$scope.table].push(thedata);

        //not sure where this shortcut is needed or not now..
        //$scope.current[$scope.table] = thedata;

        //$scope.list.included = [];
        $scope.StationCurrent(thedata[$scope.station_info.collectionid]);
      };
      if (NotEmpty($scope.form)){
        DatabaseServices.DatabaseEntryReturn($scope.table, $scope.entry[$scope.table], func);
      }
      else{ toastr.error("empty form"); }  
    };

    $scope.StationCurrent = function(id){
      var patch = {'current_collectionid': id};
      var query = '?code=eq.' + $scope.station_code;
      var func = function(response){
        $scope.current.collectionid = id;
      };
      DatabaseServices.PatchEntry('station', patch, query, func);
    };

    /*fills in entry json obj from form, sends to database*/
    $scope.Submit = function(form){
      if ($scope.entry[$scope.table].timestamp === ''){$scope.entry[$scope.table].timestamp = moment(new Date()).format();}
      if ($scope.entry[$scope.table].best_before_date === '') {$scope.entry[$scope.table].best_before_date = moment(new Date()).add(2, 'years').format();}
      MakeEntry(form, $scope.table, $scope);
      $scope.ToDatabase();
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

.controller('ListTestCtrl', function($scope, $http, DatabaseServices) {

  $scope.GetArray = function(){
    var query = '';
    var func = function(response){
      $scope.list.scan = response.data;
    };
    DatabaseServices.GetEntries('scan', func, query);
  };

  $scope.testFn = function(string){
    $scope.current.test = string;
  };

  $scope.GetArray();



  $scope.listconfig = {
    
    "cssclass": "fill", 
    "headers": ["Lot number", "Weight", "Grade", ""], 
    "fields": ["lot_number", "weight_1", "grade"], 
    "limit": "6",
    "order": "", 
    "arg": "lot_number", 
    "button": "A button"

  };

})




;
