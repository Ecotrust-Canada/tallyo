'use strict';

angular.module('scanthisApp.routing', ['ngRoute'])



.config(function($routeProvider) {
  //
  // For any unmatched url, redirect to /state1

  $routeProvider.when('/terminal/:terminal_id', { 
      controller: 'RoutingCtrl', 
      template: '<div ng-repeat="station in currentstations"><div ng-include="station.include"></div></div>'  
  });


});
