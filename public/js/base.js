'use strict';

// Declare app level module which depends on views, and components
angular.module('scanthisApp', [
  'ngRoute',
  'scanthisApp.harsam_receiving',
  'scanthisApp.harsam_retouching',
  'scanthisApp.harsam_admin'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/harsam_receiving'});
}])

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





