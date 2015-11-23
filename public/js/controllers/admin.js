'use strict';


angular.module('scanthisApp.AdminController', [])

.controller('FormSelectionCtrl', function($scope, $http, DatabaseServices) {

  $scope.getProcessors = function(){

    var func = function(response){
      $scope.list.processor = response.data;
    };
    var query = '';
    DatabaseServices.GetEntries('processor', func, query);
  };

  $scope.getProcessors();
})



.controller('HarvesterDropDownCtrl', function($scope, $http, DatabaseServices) {

  $scope.getHarvesters = function(processor){

    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '?processor_code=eq.' + processor;
    DatabaseServices.GetEntries('harvester', func, query);
  };

  $scope.$watch('current.shipping_unit.received_from', function(newValue, oldValue) {
    if ($scope.current.shipping_unit !== undefined){
       $scope.getHarvesters($scope.current.shipping_unit.received_from);
    }
  });


 
});
