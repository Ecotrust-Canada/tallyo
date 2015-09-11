'use strict';

// Declare app level module which depends on views, and components
angular.module('scanthisApp', [
  'ngRoute',
  'scanthisApp.harsam_receiving',
  'scanthisApp.harsam_trimming',
  'scanthisApp.harsam_retouching',
  'scanthisApp.harsam_admin'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/harsam_receiving'});
}]);





