'use strict';

angular.module('scanthisApp.routing', ['ngRoute', 'ui.router'])

/*.config(['$routeProvider', function($routeProvider) {
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
}])*/

.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/harsam_receiving");
  //
  // Now set up the states
  $stateProvider
    .state('harsam_receiving', {
      url: "/harsam_receiving",
      templateUrl: 'html/harsam_receiving.html'
    })

    .state('harsam_retouching', {
      url: "/harsam_retouching",
      templateUrl: 'html/harsam_retouching.html'
    })
    .state('harsam_retouching.main', {
      url: "/main",
      templateUrl: "html/retouching_main.html"
    })
    .state('harsam_retouching.reprint', {
      url: "/reprint",
      templateUrl: "html/retouching_reprint.html"
    })

    .state('harsam_boxing', {
      url: "/harsam_boxing",
      templateUrl: 'html/harsam_boxing.html'
    })

    .state('harsam_admin', {
      url: "/harsam_admin",
      templateUrl: 'html/harsam_admin.html',
    })
    .state('harsam_admin.receiving', {
      url: "/suppliers",
      templateUrl: "html/admin_receiving.html"
    })
    .state('harsam_admin.manage_lots', {
      url: "/lots",
      templateUrl: "html/admin_manage_lots.html"
    })

    .state('harsam_shipping', {
      url: "/harsam_shipping",
      templateUrl: 'html/harsam_shipping.html'
    });
});
