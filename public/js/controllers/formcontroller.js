'use strict';


angular.module('scanthisApp.formController', [])

.controller('formCtrl', function($scope, $http, DatabaseServices) {
  /*
   *
   *Creates and submits a form for a new database row using two json files
   *
   */

  $scope.init = function(jsonname, table, name){


    /*define urls to get entry json and form info*/
    var jsonentry = '../json/' + jsonname + 'entry.json';
    var jsonform = '../json/' + jsonname + 'form.json';

    var entry = table + '_entry';

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

    /*Get the entry and form info from json files*/

    $http.get(jsonform).success(function(data) {
      $scope.formarray = data.fields;
      $scope.form = {};
      $scope.ClearForm();
    });

    $http.get(jsonentry).success(function(data) {
      $scope[entry] = data;
    });

    
    /*submits the form to the database*/
    $scope.ToDatabase = function(){
      var func = function(response){
        //Clear(entry, $scope);
        $scope.ClearForm();
        var thedata = response.data;
        $scope[name].push(thedata);
        if ($scope.current){
          $scope.current[0] = thedata;
        }
        if ($scope.included){
          $scope.included.items = [];
        }
      };
      if (NotEmpty($scope.form)){
        DatabaseServices.DatabaseEntryReturn(table, $scope[entry], func);
      }
      else{ alert("empty"); }  
    };

    /*fills in entry json obj from form, sends to database*/
    $scope.Submit = function(form){
      if ($scope[entry].packing_date === ''){$scope[entry].packing_date = moment(new Date()).format();}
      if ($scope[entry].best_before_date === '') {$scope[entry].best_before_date = moment(new Date()).add(2, 'years').format();}
      MakeEntry(form, entry, $scope);
      $scope.ToDatabase();
    };

  };


});
