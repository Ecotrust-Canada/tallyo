'use strict';


angular.module('scanthisApp.formController', [])

.controller('formCtrl', function($scope, $http, DatabaseServices) {
  /*
   *
   *Creates and submits a form for a new database row using two json files
   *
   */

  $scope.init = function(table){

    /*resets the form to default values*/
    $scope.ClearForm = function(){
      for (var i=0;i<$scope.formarray.length;i++){
        if ($scope.formarray[i].type === 'text'){
          $scope.form[$scope.formarray[i].fieldname] = $scope.formarray[i].value;
        }
        else{
          $scope.form[$scope.formarray[i].fieldname] = "";
        }
      }
    };

    $scope.FormData = function(table){
      var func = function(response){
        $scope.formarray = response.data[0].form.fields;
        $scope.entry[table] = response.data[0].entry;
        $scope.form = {};
        $scope.ClearForm();        
      };
      var query = '?tablename=eq.' + table;
      DatabaseServices.GetEntryNoAlert('form', func, query);
    };
    $scope.FormData(table);

    
    /*submits the form to the database*/
    $scope.ToDatabase = function(){
      var func = function(response){
        $scope.ClearForm();
        var thedata = response.data;
        $scope.list[table].push(thedata);
        $scope.current[table] = thedata;
        $scope.list.included = [];
      };
      if (NotEmpty($scope.form)){
        DatabaseServices.DatabaseEntryReturn(table, $scope.entry[table], func);
      }
      else{ alert("empty form"); }  
    };

    /*fills in entry json obj from form, sends to database*/
    $scope.Submit = function(form){
      if ($scope.entry[table].timestamp === ''){$scope.entry[table].timestamp = moment(new Date()).format();}
      if ($scope.entry[table].best_before_date === '') {$scope.entry[table].best_before_date = moment(new Date()).add(2, 'years').format();}
      MakeEntry(form, table, $scope);
      $scope.ToDatabase();
    };

  };


});
