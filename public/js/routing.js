'use strict';

angular.module('scanthisApp.routing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/harsam_receiving', {
        templateUrl: 'html/harsam_receiving.html',
    })
    .when('/harsam_retouching', {
        templateUrl: 'html/harsam_retouching.html',
    })
    .otherwise({redirectTo: '/harsam_receiving'})


    ;
}])

;
