'use strict';

var BaseCtrl = function($scope, $http, $location, $anchorScroll) {
  
  
  $scope.ClearForm = function(){
    $scope.form = null;
  };

  $scope.ClearEntry = function(){
    for (var key in $scope.entry){
      if (key !== 'station_id' && key !== 'stage_id'){
        $scope.entry[key] = "";
      }
    }
  };

  $scope.Clear = function(){
    $scope.ClearForm();
    $scope.ClearEntry();
  };

  $scope.MakeEntry = function(form, scopevar){
    if ($scope[scopevar].lot_number === '') $scope.entry.lot_number = $scope.currentlot;
    if ($scope[scopevar].timestamp === '') $scope.entry.timestamp = moment(new Date()).format();
    for (var key in form){
        $scope[scopevar][key] = form[key];
    }
  };

  $scope.DatabaseEntry = function(table, entry){
    $http.post('http://10.10.50.30:3000/' + table, entry).then(function(response){
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
