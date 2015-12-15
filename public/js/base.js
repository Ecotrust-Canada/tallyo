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
    $scope.station_info = settings.station_info;

    if(settings.onLabel){
      $scope.onLabel = settings.onLabel;
    }

    if(settings.printurl){
      $scope.printurl = settings.printurl;
    }

    if(settings.printString){
      $scope.printString = settings.printString;
    }
    
    if(settings.packingconfig){
      $scope.packingconfig = packingconfigs[settings.packingconfig.id];    
    }
            
    $scope.entry = {};
    $scope.list = {};
    $scope.current = {};
    $scope.current.lotlistchange = true;

    if (settings.forms){
      $scope.scanform = formconfigs[settings.forms.scanform];
      $scope.collectionform = formconfigs[settings.forms.collectionform];
    }

    if (settings.dropdowns){
      $scope.collectiondropdown = dropdownconfigs[settings.dropdowns.collectiondropdown];
    }
    
    if(settings.lists){
      $scope.itemlistconfig = listconfigs[settings.lists.items];
      $scope.totallistconfig = listconfigs[settings.lists.totals];
    }

    $scope.includes = [];
    for (var i=0;i<settings.includes.length;i++){ 
      $scope.includes[i] = 'htmlcomponents/' + settings.includes[i]+ '.html';
    }
  };
  $scope.printLabel = function(codeString, fieldarray) {
    $http({
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      url: $scope.printurl + 'print',
      transformRequest: transformRequestAsFormPost,
      data: {data:$scope.printString(codeString, fieldarray)}

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

