'use strict';

angular.module('scanthisApp.routing', ['ngRoute', 'ui.router'])



.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/harsam_admin/suppliers");
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
    .state('harsam_admin.manage_suppliers', {
      url: "/suppliers",
      templateUrl: "html/admin_manage_suppliers.html"
    })
    .state('harsam_admin.manage_lots', {
      url: "/lots",
      templateUrl: "html/admin_manage_lots.html"
    })

    .state('harsam_shipping', {
      url: "/harsam_shipping",
      templateUrl: 'html/harsam_shipping.html'
    })

    .state('amanda_admin', {
      url: "/amanda_admin",
      templateUrl: 'html/amanda_admin.html',
    })

    .state('amanda_external_receiving', {
      url: "/amanda_external_receiving",
      templateUrl: 'html/amanda_external_receiving.html'
    })
    .state('amanda_external_receiving.scan', {
      url: "/scan",
      templateUrl: "html/receiving_scan.html"
    })
    .state('amanda_external_receiving.print', {
      url: "/print",
      templateUrl: "html/receiving_print.html"
    })

    .state('amanda_internal_receiving', {
      url: "/amanda_internal_receiving",
      templateUrl: 'html/amanda_internal_receiving.html'
    })

    .state('amanda_weigh', {
      url: "/amanda_weigh",
      templateUrl: 'html/amanda_weigh.html'
    });





});
