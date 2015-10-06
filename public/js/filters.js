'use strict';


angular.module('scanthisApp.filters', [])

/*turns a string into a date object*/
.filter('stringtodate', function() {
  return function(input) {
    return new Date(input);
  };
})

/*returns 'FT' string for fair trade*/
.filter('isfairtrade', function() {
  return function(input) {
    if (String(input) === 'true'){
        return 'FT';
    }
    else return '';
  };
});
