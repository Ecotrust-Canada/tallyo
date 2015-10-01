'use strict';


angular.module('scanthisApp.directives', [])

.directive('viewsummarybutton', function() { return { templateUrl: 'htmlpartials/viewsummarybutton.html' }; })

.directive('selectlot', function() { return { templateUrl: 'htmlpartials/selectlot.html' }; })

.directive('makeitem', function() { return { templateUrl: 'htmlpartials/makeitem.html' }; })

.directive('summaryblock', function() { return { templateUrl: 'htmlpartials/summaryblock.html' }; })

.directive('createform', function() { return { templateUrl: 'htmlpartials/createform.html' }; })

.directive('movelot', function() { return { templateUrl: 'htmlpartials/movelot.html' }; })

.directive('supplierlist', function() { return { templateUrl: 'htmlpartials/supplierlist.html' }; })

.directive('reprint', function() {
  return {
    templateUrl: 'htmlpartials/reprint.html',
    controller: function($scope, $injector) {
        $injector.invoke(BaseCtrl, this, {$scope: $scope});

        $scope.ListAllItems = function(station_id){
            var query = '?station_id=eq.' + station_id;
            $scope.GetEntries('item', 'items', query);
          };

        $scope.ListAllItems($scope.station_id);        
    }
  };
});
