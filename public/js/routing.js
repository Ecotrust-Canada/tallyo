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
    .when('/harsam_boxing', {
        templateUrl: 'html/harsam_boxing.html',
    })
    .when('/harsam_admin', {
        templateUrl: 'html/harsam_admin.html',
    })
    .when('/harsam_shipping', {
        templateUrl: 'html/harsam_shipping.html',
    })
    
    .otherwise({redirectTo: '/harsam_receiving'})


    ;
}])

;
