'use strict';

var BaseCtrl = function($scope, $http, $location, $anchorScroll) {
  
  
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

  $scope.Test = function(str){
    console.log(str);
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

  $scope.DatabaseEntry = function(table, entry, func){
    $http.post('http://10.10.50.30:3000/' + table, entry).then(function(response){
      func();
    }, function(response){
      alert(response.statusText);
    });
  };

  $scope.DatabaseEntryReturn = function(table, entry, func){
    $http.post('http://10.10.50.30:3000/' + table, entry, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      func(response);
    }, function(response){
      alert(response.statusText);
    });
  };

  $scope.PatchEntry = function(table, patch, querystring, func){
    $http.patch('http://10.10.50.30:3000/' + table + querystring, patch, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      func(response);
    }, function(response){
      alert(response.statusText);
    });
  };

  $scope.RemoveEntry = function(table, querystring, func){
    $http.delete('http://10.10.50.30:3000/' + table + querystring).then(function(response){
      func();
    }, function(response){
      alert(response.statusText);
    });
  };


  $scope.GetEntries = function(table, scopevar, querystring){
    var url;
    if (querystring){
      url = 'http://10.10.50.30:3000/' + table + querystring;
    }
    else{
      url = 'http://10.10.50.30:3000/' + table;
    }
    $http.get(url).then(function(response){
      $scope[scopevar] = response.data;
    }, function(response){
      alert(response.status);
    });
  };

  $scope.GetEntry = function(table, func, querystring){
    var url = 'http://10.10.50.30:3000/' + table + querystring;
    $http.get(url).then(function(response){
      func(response);
    }, function(response){
      alert(response.status);
    });
  };


  /*switch between scanning and view summary*/
  $scope.show = function(){
    if ($scope.showSummary === false){
      $scope.showSummary = true;
      $scope.showScan = false;
      $scope.view_summary = "Back to scan";
    }
    else {
      $scope.showSummary = false;
      $scope.showScan = true;
      $scope.view_summary = "view summary";
    }
  };


  /*this is the 'callback function'*/
  $scope.updateFunction = function(arg){
  };




};//end of controller
