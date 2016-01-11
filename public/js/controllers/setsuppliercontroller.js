'use strict';


angular.module('scanthisApp.setsupplierController', [])

.controller('SetSupplierCtrl', function($scope, $http, DatabaseServices, $rootScope) {

  /*
   *sets the supplier
   */

  $scope.editdrop = true;
  $scope.addnew = true;
  $scope.current.bool = true;

  /*Loads all the harvesters for the current processor*/
  $scope.ListHarvesters = function(){
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '?processor_code=eq.' + $scope.processor + '&active=eq.true';
    DatabaseServices.GetEntries('harvester', func, query);
  };
  $scope.ListHarvesters();



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
  $scope.$watch('current.lot', function(newValue, oldValue) {
    if ($scope.current.lot !== undefined){
      $scope.StationLot($scope.current.lot, 'HS0-001');
      $scope.StationLot($scope.current.lot, 'HS0-002');
      $scope.AddStationLot($scope.current.lot, 'HS0-003');
      $rootScope.$broadcast('collection-change', {id: $scope.current.lot});
    }
  });




  /*make a new lot in the database*/
  $scope.DatabaseLot = function(){
    var func = function(response){
      $scope.current.lot = (response.data[0].lot_number || response.data.lot_number);
    };
    //DatabaseServices.DatabaseEntry('lot', $scope.lot_entry, func);
    DatabaseServices.DatabaseEntryCreateCode('lot', $scope.lot_entry, $scope.processor, func);
  };

  /*fill in fields in json obj*/
  $scope.MakeLotEntry = function(date){
    $scope.lot_entry.lot_number = 'placeholder';
    $scope.lot_entry.timestamp = moment(new Date()).format();        
    CreateEntryPeriod(date, 'day', $scope);
    $scope.lot_entry.station_code = $scope.station_code;
  };

  /*Gets current lot given selected supplier, if does not exist creates a new lot*/
  $scope.CreateLot = function(queryString, date){
    var func = function(response){
      if (response.data.length > 0){
        $scope.current.lot = response.data[0].lot_number;
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
    $scope.lot_entry = {"harvester_code": harvester_code, "station_code": $scope.station_code};
    $scope.CreateLot(queryString, date);
  };

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


.controller('HarvesterSubmitCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.form = {};
  $scope.entry.harvester = {};
  $scope.formchange = true;



  var AddtoList = function(response){
    var thedata = (response.data[0] || response.data);
    if ($scope.list.harvester !== undefined){
      $scope.list.harvester.push(thedata);
    }    
  };

  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      responsefunction(response);
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryCreateCode('harvester', $scope.entry.harvester, $scope.processor, func);
    }
    else{ toastr.error("empty form"); }
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    $scope.entry.harvester.processor_code = $scope.processor;
    $scope.entry.harvester.active = true;
    MakeEntry(form, 'harvester', $scope);
    $scope.ToDatabase(responsefunction);
  };

  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, AddtoList);
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
