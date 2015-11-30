'use strict';


angular.module('scanthisApp.setsupplierController', [])

.controller('SetSupplierCtrl', function($scope, $http, DatabaseServices) {

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
    var query = '?processor_code=eq.' + $scope.processor;
    DatabaseServices.GetEntries('harvester', func, query);
  };

  $scope.ListHarvesters();

  

  /*Gets the harvester_lot entry for the given lot_number*/
  $scope.GetHarvesterLot = function(lot_number){
    var func = function(response){
      $scope.current.harvester_lot = response.data[0];
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntryNoAlert('harvester_lot', func, query);
  };


  //sets the internal lot code for a given lot
  //sets internal_lot_code to PatchTo
  //sets form to SetFormTo
  $scope.LotCode = function(PatchTo, SetFormTo){
    var func = function(response){
      $scope.form.internal_lot_code = SetFormTo;//this is to fill in with previous when clicking edit
      $scope.GetHarvesterLot($scope.current.harvester_lot.lot_number);
    };
    var patch = {'internal_lot_code': PatchTo};
    var query = '?lot_number=eq.' + $scope.current.harvester_lot.lot_number ;
    DatabaseServices.PatchEntry('lot', patch, query, func);    
  };


  //When the current.collectionid updates, update the harvester_lot
  $scope.$watch('current.collectionid', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.GetHarvesterLot($scope.current.collectionid);
    }
  });



  /*Sets the current lot number for the station*/
  $scope.PatchStationWithLot = function(lot_number, station_code){
    var func = function(response){
    };
    var today = moment(new Date()).format();
    var patch = {'current_collectionid': lot_number, 'collectionid_date': today};
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
  $scope.DatabaseLot = function(lot_number){
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
        $scope.DatabaseLot(lot_number);  
      }
    };
    DatabaseServices.GetEntries('lot', func, queryString);
  };

  
  /*gets selected supplier, creates querystring for lot*/
  $scope.SetCurrentHarvester = function(harvester_code){
    $scope.current.harvester_code = harvester_code;
    var date = moment(new Date()).format();
    var queryString = '?harvester_code=eq.' + harvester_code + '&start_date=lt.' + date + '&end_date=gt.' + date;
    $scope.lot_entry = {"harvester_code": harvester_code, "station_code": $scope.station_code};
    $scope.CreateLot(queryString, date);
  };


})


.controller('HarvesterSubmitCtrl', function($scope, $http, DatabaseServices, toastr) {


  var AddtoList = function(response){
    var thedata = response.data;
    if ($scope.list[$scope.table] !== undefined){
      $scope.list[$scope.table].push(thedata);
    }    
  };

  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
      responsefunction(response);
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryReturn($scope.table, $scope.entry[$scope.table], func);
    }
    else{ toastr.error("empty form"); }  
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    if ($scope.entry[$scope.table].processor_code === "") $scope.entry[$scope.table].processor_code = $scope.processor;
    $scope.entry[$scope.table].harvester_code = createHarvesterCode($scope.processor, moment(new Date()).format());
    MakeEntry(form, $scope.table, $scope);
    $scope.ToDatabase(responsefunction);
  };

  //The different submit buttons
  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, AddtoList);
  };

})


.controller('DropDownCtrl',function($scope, $http, DatabaseServices){
  $scope.FormData = function(table){
      var func = function(response){
        $scope.formjson = response.data[0].form;  
      };
      var query = '?tablename=eq.' + table + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntryNoAlert('form', func, query);
    };

  $scope.New = function(value){
    if (value){
      $scope.formjson.fields[$scope.model.id].value.push({"name": value});
      $scope.SaveDB();
    }    
    
    /*var func = function(response){
    };
    var query = '?tablename=eq.' + $scope.tablename + '&station_code=eq.' + $scope.station_code;
    DatabaseServices.PatchEntry('form', {'form': $scope.formjson }, query, func);*/
  };

  $scope.SaveDB = function(){
    var func = function(response){
    };
    var query = '?tablename=eq.' + $scope.tablename + '&station_code=eq.' + $scope.station_code;
    DatabaseServices.PatchEntry('form', {'form': $scope.formjson }, query, func);
  };

  $scope.Edit = function(index, name){
    //console.log($scope.formjson.fields[$scope.model.id].value[index]);
    $scope.formjson.fields[$scope.model.id].value[index].name = name;
  };

  $scope.Save = function(index, name){
    //console.log($scope.formjson.fields[$scope.model.id].value[index]);
    $scope.formjson.fields[$scope.model.id].value[index].name = name;
    $scope.SaveDB();
  };

  $scope.Delete = function(index, name){
    $scope.formjson.fields[$scope.model.id].value = $scope.formjson.fields[$scope.model.id].value.filter(function (el) {
                        return el.name !== name;
                       });
    $scope.SaveDB();
  };

  $scope.init = function(table){
    $scope.tablename = table;
    $scope.FormData(table);
    $scope.model = {};
    $scope.search = {};
    $scope.search.type = "select";
  };



})

.controller('SubmitProcessorCtrl',function($scope, $http, DatabaseServices, toastr){
  $scope.FormData = function(){
    console.log('function called');
      var func = function(response){
        $scope.formjson = response.data[0].form; 
        console.log($scope.formjson); 
        $scope.New($scope.codepatch);
      };
      var query = '?tablename=eq.harvester' + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntryNoAlert('form', func, query);
    };

  $scope.New = function(value){
    if (value){
      $scope.formjson.fields[14].value.push({"name": value});
    }    
    
    var func = function(response){
    };
    var query = '?tablename=eq.harvester' + '&station_code=eq.' + $scope.station_code;
    DatabaseServices.PatchEntry('form', {'form': $scope.formjson }, query, func);
  };


  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
      responsefunction(response);
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryReturn($scope.table, $scope.entry[$scope.table], func);
    }
    else{ toastr.error("empty form"); }  
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    MakeEntry(form, $scope.table, $scope);
    $scope.codepatch = $scope.form.processor_code;
    console.log($scope.codepatch);
    $scope.ToDatabase(responsefunction);
  };

  //The different submit buttons
  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, $scope.FormData);
  };

})



.controller('LotCtrl', function($scope, $http, DatabaseServices) {
 
  $scope.GetLotLocations = function(){
    var query = '';
    var func = function(response){
      $scope.list.lot_location = response.data;
    };
    DatabaseServices.GetEntries('lot_aggregated', func, query);
  };

  $scope.GetLotLocations();

  $scope.GetTotals1 = function(){
    var query = '?station_code=eq.HS0-001';
    var func = function(response){
      $scope.list.s_one_totals = response.data;
    };
    DatabaseServices.GetEntries('scan_total', func, query);
  };

  $scope.GetTotals1();

  $scope.GetTotals2 = function(){
    var query = '?station_code=eq.HS0-002';
    var func = function(response){
      $scope.list.s_two_totals = response.data;
    };
    DatabaseServices.GetEntries('scan_total', func, query);
  };

  $scope.GetTotals2();

  $scope.GetTotals3 = function(){
    var query = '?station_code=eq.HS0-003';
    var func = function(response){
      $scope.list.s_three_totals = response.data;
    };
    DatabaseServices.GetEntries('scan_total', func, query);
  };

  $scope.GetTotals3();

  $scope.GetTotals4 = function(){
    var query = '?station_code=eq.HS0-004';
    var func = function(response){
      $scope.list.s_four_totals = response.data;
    };
    DatabaseServices.GetEntries('box_total', func, query);
  };

  $scope.GetTotals4();

});
