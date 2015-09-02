'use strict';

/* Controllers */

var scanthisControllers = angular.module('scanthisControllers', []);

scanthisControllers.controller('ReceivingCtrl', function($scope, $http) {
  
  /*initialize some values */
  $scope.scale="00.00kg"


  /*Scan Box - for now iterate through suppliers */
  var scanboxcounter = 0;
  var iterator = ['1', '2', '3']
  $scope.ScanIncoming = function(clickEvent) {
    var current = iterator[scanboxcounter % iterator.length];
    $http.get('http://10.10.50.30:3000/supplier?id=eq.' + current).success(function(data) {
      $scope.sup = data[0];
    });
    scanboxcounter++;
  };



  
  $scope.PlaceOnScale = function(clickEvent) {
    $scope.scale="14.85kg"
  };
  $scope.ScanDirtyClean = function(clickEvent) {
    $scope.clean="Clean"
  };
  $scope.ScanGrade = function(clickEvent) {
    $scope.grade="A";
    $scope.weight=$scope.scale;
    $scope.datereceived=new Date();
  };

  
  
  var clear = function(){
    $scope.grade="";
    $scope.datereceived="";
    $scope.clean="";
    $scope.weight="";
    $scope.scale="00.00kg";
  }
  $scope.Redo = function(clickEvent) {
    clear();
  };
  $scope.Confirm = function(clickEvent) {
    var toSubmit = 
    {'fleet': $scope.sup.fleet,
     'fairtrade': $scope.sup.fairtrade,
      'supplier': $scope.sup.supplier,
      'species': $scope.sup.species,
      'state': $scope.sup.state,
      'handling': $scope.sup.handling,
      'area': $scope.sup.area,
      'weight': $scope.weight,
      'grade': $scope.grade,
      'datereceived': $scope.datereceived,
      'clean': $scope.clean};
    alert(toSubmit.fleet + ", " + toSubmit.weight)
    clear();
  };
  $scope.testing = "It works!"
});

scanthisControllers.controller('SelectLotCtrl', function($scope, $http) {
  $scope.scale="00.00kg"
  $scope.PlaceOnScale = function(clickEvent) {
    $scope.scale="14.85kg"
  };

  $http.get('json/harsamlots.json').success(function(data) {
    $scope.lots = data;
  });

});


