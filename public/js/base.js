'use strict';

// Declare app level module which depends on views, and components
angular.module('scanthisApp', [
  'ngRoute',
  'scanthisApp.harsam_receiving',
  'scanthisApp.harsam_retouching',
  'scanthisApp.harsam_admin',
  'scanthisApp.harsam_boxing',
  'scanthisApp.harsam_shipping'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/harsam_receiving'});
}])

.directive('submitbuttons', function() { return { templateUrl: 'htmlpartials/submitbuttons.html' }; })

.directive('inputweight', function() { return { templateUrl: 'htmlpartials/inputweight.html' }; })

.directive('plasticweight', function() { return { templateUrl: 'htmlpartials/plasticweight.html' }; })

.directive('gradebuttons', function() { return { templateUrl: 'htmlpartials/gradebuttons.html' }; })

.directive('showentry', function() { return { templateUrl: 'htmlpartials/showentry.html' }; })

.directive('viewsummarybutton', function() { return { templateUrl: 'htmlpartials/viewsummarybutton.html' }; })

.directive('currentlot', function() { return { templateUrl: 'htmlpartials/currentlot.html' }; })

.directive('selectlot', function() { return { templateUrl: 'htmlpartials/selectlot.html' }; })

.directive('summarytable', function() { return { templateUrl: 'htmlpartials/summarytable.html' }; })


.filter('stringtodate', function() {
  return function(input) {
    return new Date(input);
  };
})
.filter('isfairtrade', function() {
  return function(input) {
    if (String(input) === 'true'){
        return 'FT';
    }
    else return '';
  };
})
.filter('removeslash', function() {
  return function(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
  };
});





