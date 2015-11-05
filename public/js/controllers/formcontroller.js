'use strict';

angular.module('scanthisApp.formController', [])

.controller('formCtrl', function($scope, $http, DatabaseServices) {

  $scope.FormData = function(table){
    var func = function(response){
      $scope.formarray = response.data[0].form.fields;
      $scope.entry[table] = response.data[0].entry;
      $scope.form = {};
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


.controller('formsubmitCtrl', function($scope, $http, DatabaseServices) {

  /*submits the form to the database*/
    $scope.ToDatabase = function(){
      var func = function(response){
        $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
        var thedata = response.data;
        $scope.list[$scope.table].push(thedata);
        $scope.current[$scope.table] = thedata;
        $scope.list.included = [];
      };
      if (NotEmpty($scope.form)){
        DatabaseServices.DatabaseEntryReturn($scope.table, $scope.entry[$scope.table], func);
      }
      else{ alert("empty form"); }  
    };

    /*fills in entry json obj from form, sends to database*/
    $scope.Submit = function(form){
      if ($scope.entry[$scope.table].timestamp === ''){$scope.entry[$scope.table].timestamp = moment(new Date()).format();}
      if ($scope.entry[$scope.table].best_before_date === '') {$scope.entry[$scope.table].best_before_date = moment(new Date()).add(2, 'years').format();}
      MakeEntry(form, $scope.table, $scope);
      $scope.ToDatabase();
    };

});
