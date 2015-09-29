'use strict';


angular.module('scanthisApp.filters', [])


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
