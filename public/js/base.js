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
  'scanthisApp.AdminController',
  'ngSanitize', 
  'ngCsv',
  'toastr'
])

/*
 *counfigure toastr
 */
.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        maxOpened: 3,
        positionClass: 'toast-top-full-width',
        preventOpenDuplicates: true
    });
})

/*
 *Controllers used on most pages to set station and stage
 */

/*.controller('SetStation', function($scope, $http, DatabaseServices) {

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


 
})*/
.controller('RoutingCtrl', function($scope, $routeParams, $http) {
  $scope.stations = stationlist;
  $scope.terminals = terminals;
  if ($routeParams.terminal_id){
    var current_terminal = terminals.filter(function(s){return s.id == $routeParams.terminal_id})[0];
    var stations = current_terminal.stations;
    $scope.currentstations = [];

    for (var i = 0;i<stations.length;i++){
      var index = stations[i];
      $scope.currentstations[i] = {};
      $scope.currentstations[i].include = '/html/' + $scope.stations[index].type + '.html';//$routeParams.controller + '.' + $routeParams.action + '.html';
      $scope.currentstations[i].settings = $scope.stations[index].settings;
    }
  }
})

.controller('StationCtrl', function($scope, $http, $sce) {

  $scope.init = function(settings){
    $scope.station_code = settings.station_code;
    $scope.processor = $scope.station_code.substring(0, 3);
    $scope.title = settings.title;
        
    $scope.entry = {};
    $scope.list = {};
    //$scope.qr = {};
    $scope.scan = {};
    $scope.form = {};
    $scope.current = {};
    
    $scope.station_info = settings.station_info;
    $scope.includes = {};
    $scope.includes.col1 = []; 
    for (var i=0;i<settings.includes.col1.length;i++){ 
      $scope.includes.col1[i] = 'htmlcomponents/' + settings.includes.col1[i]+ '.html';
    }
    $scope.includes.col2 = []; 
    for (var j=0;j<settings.includes.col2.length;j++){ 
      $scope.includes.col2[j] = 'htmlcomponents/' + settings.includes.col2[j]+ '.html';
    }
  };

})

.controller('PrintCtrl', function($scope, $http, DatabaseServices) {
  // rewrite printDiv to use koozie instead of qztray
  $scope.printDiv = function(qrString) {
    $http({
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      url: printurl + 'print',
      transformRequest: transformRequestAsFormPost,
      data: {data:'^XA^FO50,100^FD' + qrString + '^FS^BXN,10,200^FD' + qrString + '^FS^XZ'}
    });
  };

  var transformRequestAsFormPost = function(obj) {
    var str = [];
    for(var p in obj)
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  };
   
})

.controller('CSVCtrl', function($scope, $http, DatabaseServices) {

  $scope.csvcontent = [{a: 1, b:2}, {a:3, b:4}];


})
;

