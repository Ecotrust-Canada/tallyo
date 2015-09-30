'use strict';


angular.module('scanthisApp.directives', [])

.directive('viewsummarybutton', function() { return { templateUrl: 'htmlpartials/viewsummarybutton.html' }; })

.directive('selectlot', function() { return { templateUrl: 'htmlpartials/selectlot.html' }; })

.directive('makeitem', function() { return { templateUrl: 'htmlpartials/makeitem.html' }; })

.directive('summaryblock', function() { return { templateUrl: 'htmlpartials/summaryblock.html' }; })

.directive('reprint', function() {
  return {
    templateUrl: 'htmlpartials/reprint.html',
    controller: function($scope, $injector) {
        $injector.invoke(EntryCtrl, this, {$scope: $scope});
        $scope.ListAllItems($scope.station_id);        
    }
  };
})

.directive('movelot', function() {
  return {
    templateUrl: 'htmlpartials/movelot.html'
  };
});
