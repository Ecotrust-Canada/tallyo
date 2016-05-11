'use strict';


angular.module('scanthisApp.directives', [])


//2 lot dropdowns, current and recently completed
.directive('selectfromcurrentlots', function() { return { templateUrl: 'htmlpartials/selectfromcurrentlots.html' }; })

//lot dropdown with lots only from current day
.directive('selectsamedaylot', function() { return { templateUrl: 'htmlpartials/selectsamedaylot.html' }; })

//create lot from harvester, or select recently completed lot
.directive('receivelot', function() { return { templateUrl: 'htmlpartials/receivelot.html' }; })

.directive('setshipmentinfo', function() { return { templateUrl: 'htmlpartials/setshipmentinfo.html' }; })

.directive('setsupplierinfo', function() { return { templateUrl: 'htmlpartials/setsupplierinfo.html' }; })

.directive('setharvesterinfo', function() { return { templateUrl: 'htmlpartials/setharvesterinfo.html' }; })

.directive('searchtext', function() { return { templateUrl: 'htmlpartials/searchtext.html' }; })

.directive('display', function() { return { 
  scope: {config: '=',
          obj: '=',
          settings: '='},
  templateUrl: 'htmlpartials/display.html' }; })

.directive('list', function() { return { 
  scope: { itemlist: '=',  
           config: '=' , 
           filterstring: '=', 
           istotal: '=', 
           updateFn: '&',
           secondFn: '&'},
  controller: 'ListCtrl',
  templateUrl: 'htmlpartials/list.html' }; })


.directive('bufferedscrolllist', function() { return { 
  scope: { itemlist: '=',  
           config: '=' ,
           listlength: '=', 
           filterstring: '=', 
           istotal: '=', 
           updateFn: '&',
           secondFn: '&',
           testFn: '&'}, 
  controller: 'BufferScrollCtrl',
  templateUrl: 'htmlpartials/bufferedscrolllist.html' }; })

.directive('expandedlist', function() { return { 
  scope: { itemlist: '=', 
           displaycfg: '=', 
           config: '=' , 
           filterstring: '=',  
           updateFn: '&',
           hideFn: '&'},
  controller: 'ListCtrl',
  templateUrl: 'htmlpartials/expandedlist.html' }; })

.directive('dropdown', function() { return { 
  scope: { itemlist: '=',  
           cfg: '=', 
           selectedoption: '=', 
           changeFn: '&' },
  controller: 'OptionCtrl',
  templateUrl: 'htmlpartials/dropdown.html' }; })

.directive('entryform', function() { return { 
  scope: {table: '=',  
          config: '=', 
          scale: '=',  
          formchange: '=',
          list1: '=', 
          list2: '=', 
          formdisabled: '=', 
          submitFn: '&',
          pollFn: '&'},
  controller: 'entryformCtrl', 
  templateUrl: 'htmlpartials/entryform.html' }; })

.directive('editform', function() { return { 
  scope: {obj: '=',  
          config: '=',   
          formchange: '=',
          formdisabled: '=', 
          submitFn: '&'},
  controller: 'editformCtrl', 
  templateUrl: 'htmlpartials/editform.html' }; })

.directive('fieldsetrepeat', function() { return { 
  scope: { config: '=' , 
           submitFn: '&'},
  controller: 'FieldsetCtrl',
  templateUrl: 'htmlpartials/fieldsetrepeat.html' }; })


//to validate forms - return error if number is negative
.directive('negative', function (){ 
   return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {

          //For DOM -> model validation
          ngModel.$parsers.unshift(function(value) {
             var valid = value >= 0;
             ngModel.$setValidity('negative', valid);
             return valid ? value : undefined;
          });

          //For model -> DOM validation
          ngModel.$formatters.unshift(function(value) {
             ngModel.$setValidity('negative', value >= 0);
             return value;
          });
      }
   };
})

.directive('anyOtherClick', ['$document', "$parse", function ($document, $parse) {
  return {
    restrict: 'A',
    link:  function (scope, element, attr, controller) {
      var id = (attr.anyOtherClick || 'scaninput');
      var documentClickHandler = function (event) {
        var eventOutsideTarget = (element[0] !== event.target) && (0 === element.find(event.target).length);
        if (isDescendant(element[0], event.target)){
          eventOutsideTarget = false;
        }
        if (eventOutsideTarget) {
          scope.$apply(function () {
            var thediv = document.getElementById(id);
            if (thediv){
              thediv.focus();
            }
          });
        }
      };
      $document.on("click", documentClickHandler);
      scope.$on("$destroy", function () {
        $document.off("click", documentClickHandler);
      });
    },
  };
}])
.directive('inputDropdown', function($compile) {
    
    return {
        restrict: 'EA',
        scope: {
            thelist: '=',
            config: '=',
            limit: '=',
            form: '=',
            onSelect: '&'
        },
        templateUrl: 'htmlpartials/searchdropdown.html',
        link: function(scope, element, attrs) {
            element.addClass('input-dropdown');
            scope.select = function(e, value) {
                scope.the_val = value;
                if (scope.config.arg){
                  scope.onSelect({$event: e, value: value[scope.config.arg]});
                }
                else{
                  scope.onSelect({$event: e, value: value});
                }
                
            };
            scope.pcselect = function(e, value) {
              if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))) {
                scope.the_val = value;
                if (scope.config.arg){
                  scope.onSelect({$event: e, value: value[scope.config.arg]});
                }
                else{
                  scope.onSelect({$event: e, value: value});
                }
              }  
            };



            scope.setnull = function(){
              scope.the_val = null;
              if(scope.form){scope.form = null;}
            };
        }
    };
})
.directive('bufferedScroll', function ($parse) {
    return function ($scope, element, attrs) {
      var handler = function () {
        if ($scope.itemlist && $scope.limit < $scope.itemlist.length) {
          $scope.limit += 5;
        }
      };
      element.on('scroll',function (evt) {
        var scrollTop    = element[0].scrollTop,
            scrollHeight = element[0].scrollHeight,
            offsetHeight = element[0].offsetHeight;

        if (scrollTop === (scrollHeight - (offsetHeight-17))) {
          $scope.$apply(function () {
            handler($scope);
          });
        }
        if (scrollTop === (scrollHeight - offsetHeight)) {
          $scope.$apply(function () {
            handler($scope);
          });
        }
        if (scrollTop === 0) {
          $scope.$apply(function () {
            $scope.limit = 10;
          });
        }
      });
    };
  })

.directive('bufferedScrollLots', function ($parse) {
    return function ($scope, element, attrs) {
      var handler = function () {
        if ($scope.limit < $scope.list.harvester_lot.length) {
          $scope.limit += 5;
        }
      };
      element.on('scroll',function (evt) {
        var scrollTop    = element[0].scrollTop,
            scrollHeight = element[0].scrollHeight,
            offsetHeight = element[0].offsetHeight;

        if (scrollTop === (scrollHeight - offsetHeight)) {
          $scope.$apply(function () {

            handler($scope);
          });
        }
        if (scrollTop === 0) {
          $scope.$apply(function () {
            $scope.limit = 10;
          });
        }
      });
    };
  })



.directive( 'elemReady', function( $parse ) {
   return {
       restrict: 'A',
       link: function( $scope, elem, attrs ) {    
          elem.ready(function(){
            $scope.$apply(function(){
                var func = $parse(attrs.elemReady);
                func($scope);
            });
          });
       }
    };
})

.directive('autodecimal', ['$filter', function ($filter) {
    return {
        require: 'ngModel',
  
        link: function (scope, elem, attrs, ctrl) {
            var dec = attrs.autodecimal;
            var num = Math.pow(10, dec);
            if (!ctrl) return;

            ctrl.$formatters.unshift(function (a) {
                return $filter('number')(ctrl.$modelValue);
            });
            ctrl.$parsers.unshift(function (viewValue) {
                var plainNumber = viewValue.replace(/[^\d|\-+]/g, '');
                elem.val($filter('number')(plainNumber/num,dec));
                return plainNumber/num;
            });
        }
    };
}])


;
