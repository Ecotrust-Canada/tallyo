'use strict';

// Declare app level module which depends on views, and components
angular.module('scanthisApp', [

  'scanthisApp.directives',
  'scanthisApp.routing',
  'scanthisApp.filters',
  'scanthisApp.factories',
  
  'scanthisApp.formController',
  'scanthisApp.itemController',
  'scanthisApp.packingController',
  'scanthisApp.createlotController',
  'scanthisApp.setsupplierController',
  'monospaced.qrcode',
  'ja.qr'
])




/*
 *Controllers used on most pages to set station and stage
 */

.controller('SetStation', function($scope, $http, DatabaseServices) {

  $scope.GetStationInfo = function(station_code){
    var query = '?code=eq.' + station_code;
    var func = function(response){
      $scope.station_info = response.data[0].station_info;
    };
    DatabaseServices.GetEntries('station', func, query);
  };


  $scope.init = function(station_code){
    $scope.processor = station_code.substring(0, 3);
    $scope.station_code = station_code;    
    $scope.entry = {};
    $scope.list = {};
    $scope.qr = {};
    $scope.scan = {};
    $scope.form = {};
    $scope.current = {};
    $scope.GetStationInfo(station_code);
  };


 
})


.controller('PrintCtrl', function($scope, $http, DatabaseServices) {

  $scope.aqr = 'what is this';
  $scope.printDiv = function(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    var popupWin = window.open('', '_blank', 'width=800,height=300');
    popupWin.document.open();
    popupWin.document.write('<!DOCTYPE html><html data-ng-app="monospaced.qrcode"><head><script src="bower_components/angular/angular.js"></script><script src="bower_components/qrcode-generator/js/qrcode.js"></script><script src="bower_components/angular-qrcode/angular-qrcode.js"></script></head><body>' + printContents + '</body></html>');    
    popupWin.document.close();
    popupWin.window.onload = function(){popupWin.window.print(); popupWin.window.close();};
  };

  $scope.printADiv = function(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    var popupWin = window.open('', '_blank', 'width=800,height=300');
    popupWin.document.open();
    popupWin.document.write('<!DOCTYPE html><html data-ng-app="monospaced.qrcode"><head><script src="bower_components/angular/angular.js"></script><script src="bower_components/angular-qr/angular-qr.min.js"></script><script src="bower_components/qrcode/lib/qrcode.min.js"></script></head><body>' + printContents + '</body></html>');    
    popupWin.document.close();
    popupWin.window.onload = function(){popupWin.window.print(); popupWin.window.close();};
  };  
})

;





