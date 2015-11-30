'use strict';


angular.module('scanthisApp.AdminController', [])


.controller('StartNewLotCtrl', function($scope, $injector, DatabaseServices) {

  $scope.StartNewLot = function(){
    var func = function(response){
      $scope.current.collectionid = response.data.lot_number;
      //$scope.current.lot = response.data;
      $scope.list.lot.push(response.data);
    };
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

.controller('LotBoxScanCtrl', function($scope, $http, DatabaseServices) {
  
  $scope.MakeScan = function(box_number){
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    var entry = {};
    var date = new Date();
    entry.lot_number = $scope.current.collectionid;
    entry.timestamp = moment(date).format();
    entry.station_code = $scope.station_code;
    entry.box_number = box_number;
    DatabaseServices.DatabaseEntryReturn('scan', entry, func);
  };
  
})


.controller('RemoveBoxScanCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(id){
    var query = '?box_number=eq.' + id + '&station_code=eq.' + $scope.station_code;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

})


.controller('WeighLotCtrl', function($scope, $http, DatabaseServices) {
  $scope.GetLots = function(){
    var date = moment(new Date());
    var today = date.startOf('day').format();
    var query = '?start_date=eq.' + today + '&station_code=eq.AM2-002';
    var func = function(response){
      $scope.list.todaylots = response.data;
    };
    DatabaseServices.GetEntries('lot', func, query);
  };
  $scope.GetLots();


  $scope.StationLot = function(lot_number, index){
    $scope.current.index = index;
    var today = moment(new Date()).format();
    var patch = {'current_collectionid': lot_number, 'collectionid_date': today};
    var query = '?code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.current.collectionid = response.data[0].current_collectionid;
    };
    DatabaseServices.PatchEntry('station', patch, query, func);
  };

})
;
