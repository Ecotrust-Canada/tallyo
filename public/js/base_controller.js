'use strict';

var BaseCtrl = function($scope, $http, $location, $anchorScroll) {

  var databaseurl = 'http://10.10.50.30:3000/';
  
  
  $scope.ClearForm = function(){
    $scope.form = null;
  };

  $scope.ClearEntry = function(scopevar){
    for (var key in $scope[scopevar]){
      if (key !== 'station_id' && key !== 'stage_id'){
        $scope[scopevar][key] = "";
      }
    }
  };

  $scope.Clear = function(scopevar){
    $scope.ClearForm();
    $scope.ClearEntry(scopevar);
  };

  $scope.MakeEntry = function(form, scopevar){
    for (var key in form){
        $scope[scopevar][key] = form[key];
    }
  };






  $scope.GetEntries = function(table, scopevar, querystring){
    var url;
    if (querystring){
      url = databaseurl + table + querystring;
    }
    else{
      url = databaseurl + table;
    }
    $http.get(url).then(function(response){
      $scope[scopevar] = response.data;
    }, function(response){
      alert(response.status);
    });
  };

  


  


};//end of controller
