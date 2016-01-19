'use strict';


angular.module('scanthisApp.setsupplierController', [])

.controller('SetSupplierCtrl', function($scope, $http, DatabaseServices, $rootScope) {

  /*
   *sets the supplier
   */

  /*Loads all the harvesters for the current processor*/
  $scope.ListHarvesters = function(){
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '?processor_code=eq.' + $scope.processor + '&active=eq.true';
    DatabaseServices.GetEntries('harvester', func, query);
  };
  $scope.ListHarvesters();

  $scope.PatchHarvester = function(harvester_code){
    var func = function(response){
      $scope.ListHarvesters();
    };
    var query = '?harvester_code=eq.' + harvester_code;
    var patch = {'active': false};
    DatabaseServices.PatchEntry('harvester', patch, query, func);
  };

  $scope.DeleteHarvester = function(harvester_code){
    var func = function(response){
      $scope.ListHarvesters();
    };
    var query = '?harvester_code=eq.' + harvester_code;
    DatabaseServices.RemoveEntry('harvester', query, func);
  };

  $scope.RemoveHarvester = function(harvester_code){
    var func = function(response){
      if (response.data.length > 0){
        $scope.PatchHarvester(harvester_code);
      }
      else{
        $scope.DeleteHarvester(harvester_code);
      }
    };
    var query = '?harvester_code=eq.' + harvester_code;
    var r = confirm("Are you sure you want to delete this?");
    if (r === true) {
      DatabaseServices.GetEntries('lot', func, query);
    }
    
  };


})

.controller('NewLotCtrl', function($scope, $http, DatabaseServices, $rootScope) {

  $scope.form = {};

  //lotlocations functions
  $scope.AddNew = function(lot_number, station_code, bool){
    var func = function(response){
    };
    var today = moment(new Date()).format();
    var entry = {'collectionid': lot_number, 'in_progress_date': today, 'station_code': station_code, 'in_progress': bool};
    DatabaseServices.DatabaseEntry('lotlocations', entry, func);
  };
  $scope.RemoveOld = function(lot_number, station_code, bool){
    var func = function(response){
      $scope.AddNew(lot_number, station_code, bool);
    };
    var query = '?station_code=eq.' + station_code; 
    DatabaseServices.RemoveEntry('lotlocations', query, func);
  };
  $scope.patchtrue = function(lot_number, station_code){
    var patch = {'in_progress': true};
    var func = function(response){
    };
    var query = '?station_code=eq.' + station_code + '&collectionid=eq.' + lot_number;
    DatabaseServices.PatchEntry('lotlocations',patch, query, func);
  };
  $scope.StationLot = function(lot_number, station_code){
    var func = function(response){
      if(response.data.length>0){
        $scope.RemoveOld(lot_number, station_code, true);
      }
      else{
        $scope.AddNew(lot_number, station_code, true);
      }      
    };
    var query = '?station_code=eq.' + station_code; 
    DatabaseServices.GetEntries('lotlocations', func, query);
  };
  $scope.AddStationLot = function(lot_number, station_code){
    var func = function(response){
      if(response.data.length>0){ 
        $scope.patchtrue(lot_number, station_code);       
      }
      else{
        $scope.AddNew(lot_number, station_code, true);
      }      
    };
    var query = '?station_code=eq.' + station_code + '&collectionid=eq.' + lot_number; 
    DatabaseServices.GetEntries('lotlocations', func, query);
  };
  $scope.$watch('current.lot.lot_number', function(newValue, oldValue) {
    if ($scope.current.lot !== undefined){
      for (var i=0;i<$scope.setstation.set.length;i++){
        var station = $scope.setstation.set[i];
        $scope.StationLot($scope.current.lot.lot_number, station);
      }
      for (var j=0;j<$scope.setstation.add.length;j++){
        var station1 = $scope.setstation.add[j];
        $scope.AddStationLot($scope.current.lot.lot_number, station1);
      }
      $rootScope.$broadcast('collection-change', {id: $scope.current.lot.lot_number});
    }
  });


  /*make a new lot in the database*/
  $scope.DatabaseLot = function(){
    var func = function(response){
      $scope.current.lot = (response.data[0] || response.data);
    };
    DatabaseServices.DatabaseEntryCreateCode('lot', $scope.entry.lot, $scope.processor, func);
  };

  /*fill in fields in json obj*/
  $scope.MakeLotEntry = function(date){
    $scope.entry.lot.timestamp = moment(new Date()).format();        
    CreateLotEntryPeriod(date, 'day', $scope);
    $scope.entry.lot.station_code = $scope.station_code;
  };

  /*Gets current lot given selected supplier, if does not exist creates a new lot*/
  $scope.CreateLot = function(queryString, date){
    var func = function(response){
      if (response.data.length > 0){
        $scope.current.lot = response.data[0];
      }//end if
      else{
        $scope.MakeLotEntry(date);
        $scope.DatabaseLot();  
      }
    };
    DatabaseServices.GetEntries('lot', func, queryString);
  };

  
  /*gets selected supplier, creates querystring for lot*/
  $scope.SetCurrentHarvester = function(harvester_code){
    $scope.current.harvester_code = harvester_code;
    var date = moment(new Date()).format();
    var queryString = "?harvester_code=eq." + harvester_code + "&start_date=lt." + date + "&end_date=gt." + date;
    $scope.entry.lot = {"harvester_code": harvester_code, "station_code": $scope.station_code, "processor_code": $scope.processor};
    $scope.CreateLot(queryString, date);
  };


  $scope.SubmitNewLot = function(form){
    var harvester_code = $scope.current.harvester.harvester_code;
    var ship_code = $scope.current.shipping_unit.shipping_unit_number;
    var date = moment(new Date()).format();
    var queryString = "?harvester_code=eq." + harvester_code + "&shipping_unit_number=eq." + ship_code + "&start_date=lt." + date + "&end_date=gt." + date;
    $scope.entry.lot = {"harvester_code": harvester_code, "shipping_unit_number": ship_code ,"station_code": $scope.station_code, "processor_code": $scope.processor};
    AddtoEntryFormData(form, 'lot', $scope);
    $scope.CreateLot(queryString, date);
  };




})

.controller('CurrentLotCtrl', function($scope, $http, DatabaseServices) {
/*Gets the harvester_lot entry for the given lot_number*/

  $scope.form = {};
  $scope.GetHarvesterLot = function(lot_number){
    var func = function(response){
      $scope.current.harvester_lot = response.data[0];
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntryNoAlert('harvester_lot', func, query);
  };

  $scope.LotCode = function(PatchTo, SetFormTo){
    var func = function(response){
      $scope.form.internal_lot_code = SetFormTo;//this is to fill in with previous when clicking edit
      $scope.GetHarvesterLot($scope.current.harvester_lot.lot_number);
    };
    var patch = {'internal_lot_code': PatchTo};
    var query = '?lot_number=eq.' + $scope.current.harvester_lot.lot_number ;
    DatabaseServices.PatchEntry('lot', patch, query, func);    
  };


  //This is to update at beginning once getCurrentCtrl executes
  $scope.$watch('current.collectionid', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.GetHarvesterLot($scope.current.collectionid);
    }
  });

  $scope.$on('collection-change', function(event, args) {
    var id = args.id;
    $scope.GetHarvesterLot(id);
  });
})


;
