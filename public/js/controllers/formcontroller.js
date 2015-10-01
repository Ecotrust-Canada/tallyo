'use strict';


angular.module('scanthisApp.formController', [])

.controller('formCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.init = function(jsonname, table, name){

    var jsonentry = '../json/' + jsonname + 'entry.json';
    var jsonform = '../json/' + jsonname + 'form.json';

    var entry = table + '_entry';

    $http.get(jsonform).success(function(data) {
      $scope.formarray = data.fields;
      $scope.form = {};
      $scope.ClearForm();
    });

    $http.get(jsonentry).success(function(data) {
      $scope[entry] = data;
    });

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

    $scope.ToDatabase = function(){
      var func = function(response){
        $scope.Clear(entry);
        $scope[name].push(response.data);
        if ($scope.current){
          $scope.current[0] = response.data;
        }
      };
      if (NotEmpty($scope.form)){
        $scope.DatabaseEntryReturn(table, $scope[entry], func);
      }
      else{ alert("empty"); }  
    };


    $scope.Submit = function(form){
      if ($scope[entry].packing_date === ''){$scope[entry].packing_date = moment(new Date()).format();}
      if ($scope[entry].best_before_date === '') {$scope[entry].best_before_date = moment(new Date()).add(2, 'years').format();}
      $scope.MakeEntry(form, entry);
      $scope.ToDatabase();
    };

  };


});
