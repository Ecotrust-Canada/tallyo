'use strict';


angular.module('scanthisApp.AdminController', [])


.controller('StartNewLotCtrl', function($scope, $injector, $timeout, toastr, DatabaseServices) {

  $scope.isDisabled = false;
  $scope.StartNewLot = function(){
    var func = function(response){
      $scope.current.collectionid = response.data.lot_number;
      //$scope.current.lot = response.data;
      $scope.list.lot.push(response.data);
      toastr.success('lot created');
    };
    $scope.isDisabled = true;
    // reenable button after two seconds have passed
    $timeout(function(){
      $scope.isDisabled = false;},
      2000);
    var entry = {};
    var date = new Date();
    entry.lot_number = createLotNum($scope.station_code, date);
    entry.timestamp = moment(date).format();
    var dates = dateManipulation(date, 'day');
    entry.start_date = dates.start_date;
    entry.end_date = dates.end_date;
    entry.station_code = $scope.station_code;
    DatabaseServices.DatabaseEntryReturn('lot', entry, func);
  };

})



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
})

.controller('ShipListCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListShipments = function(){
    var func = function(response){
      $scope.list.shipments = response.data;
    };
    var query = '?station_code=eq.' + $scope.station_code;
    DatabaseServices.GetEntries('shipping_unit', func, query);
  };

  $scope.ListShipments();

  $scope.Edit = function(ship_id){

    var index = arrayObjectIndexOf($scope.list.shipments, ship_id, 'shipping_unit_number');
    $scope.current.shipment = {};
    for (var name in $scope.list.shipments[index]){
      $scope.current.shipment[name] = $scope.list.shipments[index][name];
    }
  };



  $scope.form={};

  
  $scope.ShipInfo = function(){

    var func = function(response){
      $scope.current.shipment = null;
      $scope.ListShipments();
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.shipment.shipping_unit_number;
    //console.log(query);
    DatabaseServices.PatchEntry('shipping_unit', $scope.current.shipment, query, func);
  };


  /*$scope.$watch('current.ship_id', function(newValue, oldValue) {
    if ($scope.current.ship_id !== undefined){
       
    }
  });*/ 

})
;
