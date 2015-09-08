'use strict';

// Declare app level module which depends on views, and components
angular.module('scanthisApp', [
  'ngRoute',
  'scanthisApp.harsam1',
  'scanthisApp.harsam2',
  'scanthisApp.harsam_admin'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/harsam1'});
}]);









/*'use strict';

var HarsamApp = angular.module('HarsamApp', ['ngRoute', 'scanthisControllers']);*/

/*HarsamApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'home.html'
      }).
      when('/harsam',{
        templateUrl: 'harsam.html'
      }).
      when('/harsam_admin', {
        templateUrl: 'harsam_admin.html'
      }).
      when('/harsam2', {
        templateUrl: 'harsam2.html',
        controller: 'SelectLotCtrl'
      }).
      when('/harsam1', {
        templateUrl: 'harsam1.html',
        controller: 'ReceivingCtrl'
      }).
      otherwise({
        redirectTo: '/home'
      });

  }]);*/



