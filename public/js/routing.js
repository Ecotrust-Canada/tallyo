'use strict';

angular.module('scanthisApp.routing', ['ngRoute'])



.config(function($routeProvider) {
  //
  // For any unmatched url, redirect to /state1

  $routeProvider
    .when('/terminal/:terminal_id', { 
      controller: 'RoutingCtrl', 
      template: '<div class="block" ng-repeat="station in currentstations" ng-include="station.include" ng-show="$index==terminal.substation || terminal.both"></div>'  
    })
    .when('/terminal/:terminal_id/subterminal/:subterminal_id', { 
      controller: 'RoutingCtrl', 
      template: '<div class="block" ng-repeat="station in currentstations" ng-include="station.include"></div>'  
    });


});
