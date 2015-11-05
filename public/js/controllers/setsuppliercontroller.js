'use strict';


angular.module('scanthisApp.setsupplierController', [])

.controller('SetSupplierCtrl', function($scope, $http, DatabaseServices) {

  /*
   *sets the supplier
   */

  $scope.editdrop = true;
  $scope.addnew = true;
  $scope.current.bool = true;

  /*display all suppliers*/
  $scope.ListSuppliers = function(){
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '?processor_code=eq.' + $scope.processor;
    DatabaseServices.GetEntries('harvester', func, query);
  };

  $scope.ListSuppliers();

  

  /*gets the the supplier from the current lot number*/
  $scope.GetHarvesterLot = function(lot_number){
    var func = function(response){
      $scope.current.harvester_lot = response.data[0];
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntryNoAlert('harvester_lot', func, query);
  };



  /*$scope.LotCode = function(lot_code, form){
    var func = function(response){
      $scope.CurrentLot();
    };
    var patch = {'internal_lot_code': lot_code};
    var query = '?lot_number=eq.' + $scope.supplier_lot.lot_number;
    DatabaseServices.PatchEntry('lot', patch, query, func);
    $scope.lot_code = form;
  };*/


  /*$scope.CurrentLot = function(){
    var func = function(response){
      $scope.SupplierFromLotNumber(response.data[0].current_lot_number);
    };
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.GetEntries('stage', func, query);
  };

  $scope.CurrentLot();*/

  /*Sets the current lot number for the stage*/
  $scope.PatchStationWithLot = function(lot_number, station_code){
    var func = function(response){
    };
    var patch = {'current_collectionid': lot_number};
    var query = '?code=eq.' + station_code;
    DatabaseServices.PatchEntry('station', patch, query, func);
  };


  $scope.$watch('current.lot', function(newValue, oldValue) {
    if ($scope.current.lot !== undefined){
      $scope.PatchStationWithLot($scope.current.lot, 'HS0-001');
      $scope.PatchStationWithLot($scope.current.lot, 'HS0-002');
      $scope.PatchStationWithLot($scope.current.lot, 'HS0-ADM');
      $scope.GetHarvesterLot($scope.current.lot);
    }

  });


  /*
   * This creates a new lot from a harvester id and sets it for the first stations
   */

  

  /*make a new lot in the database*/
  var DatabaseLot = function(lot_number){
    var func = function(){
      $scope.current.lot = lot_number;
    };
    DatabaseServices.DatabaseEntry('lot', $scope.lot_entry, func);
  };

  /*fill in fields in json obj*/
  $scope.MakeLotEntry = function(date, lot_number){
    $scope.lot_entry.lot_number = lot_number;
    $scope.lot_entry.timestamp = moment(new Date()).format();        
    CreateEntryPeriod(date, 'week', $scope);
    $scope.lot_entry.station_code = $scope.station_code;
  };

  /*Gets current lot given selected supplier, if does not exist creates a new lot*/
  $scope.CreateLot = function(queryString, date){
    var func = function(response){
      if (response.data.length > 0){
        $scope.current.lot = response.data[0].lot_number;
      }//end if
      else{
        var lot_number = createLotNum($scope.station_code, date);
        $scope.MakeLotEntry(date, lot_number);
        DatabaseLot(lot_number);  
      }
    };
    DatabaseServices.GetEntries('lot', func, queryString);
  };

  
  /*gets selected supplier, creates querystring for lot*/
  $scope.SetCurrentHarvester = function(harvester_id){
    $scope.current.harvester = harvester_id; 
    var date = new Date();
    var queryString = LotQuery({'harvester_id': harvester_id, 'date': date});
    $scope.lot_entry = {"harvester_id": harvester_id, "stage_id": $scope.stage_id, "station_code": $scope.station_code};
    $scope.CreateLot(queryString, date);
  };


})













.controller('DropDownCtrl',function($scope, $http, DatabaseServices){
  $scope.FormData = function(table){
      var func = function(response){
        $scope.formjson = response.data[0].form;  
      };
      var query = '?tablename=eq.' + table;
      DatabaseServices.GetEntryNoAlert('form', func, query);
    };

  $scope.New = function(value){
    if (value){
      $scope.formjson.fields[$scope.model.id].value.push({"name": value});
    }    
    
    var func = function(response){
    };
    var query = '?tablename=eq.' + $scope.tablename;
    DatabaseServices.PatchEntry('form', {'form': $scope.formjson }, query, func);
  };

  $scope.init = function(table){
    $scope.tablename = table;
    $scope.FormData(table);
    $scope.model = {};
    $scope.search = {};
    $scope.search.type = "select";
  };



});
