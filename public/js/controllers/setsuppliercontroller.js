'use strict';


angular.module('scanthisApp.setsupplierController', [])

.controller('SetSupplierCtrl', function($scope, $http, DatabaseServices, $rootScope) {

  /*Loads all the harvesters for the current processor*/
  $scope.ListHarvesters = function(){
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query;
    if ($scope.settings.thisfish_enabled && $scope.settings.thisfish_enabled === true){
      query = '?processor_code=eq.' + $scope.processor + '&active=eq.true&order=traceable.desc,serial_id.desc';
    }else{
      query = '?processor_code=eq.' + $scope.processor + '&active=eq.true&traceable=eq.false&order=serial_id.desc';
    }
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


.controller('EditRLotCtrl', function($scope, $http, DatabaseServices, $rootScope, toastr) {

  $scope.showedit=false;
  //for harvester drop down
  $scope.form = {};
  $scope.form.state = 'Dirty';

  $scope.selected = 'no selected';

  $scope.resetform= function(){
    $scope.default = JSON.parse(JSON.stringify($scope.current.harvester_lot));
    $scope.form = {};
    $scope.form.state = ( $scope.current.harvester_lot.internal_lot_code.substring(10,11) === '9'? 'Clean' : 'Dirty' );
    $scope.selected = 'no selected';
  };

  $scope.ListHarvesters = function(){
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '?processor_code=eq.' + $scope.processor + '&active=eq.true';
    DatabaseServices.GetEntries('harvester', func, query);
  };
  $scope.ListHarvesters();

  $scope.GetHar = function(harvester){
    $scope.form.harvester_code = harvester.harvester_code;
    $scope.current.harvester = harvester;
  };

  $scope.GenInternalLot = function(form){
    if (!form.harvester_code && !$scope.default){
      toastr.error('set harvester');      
    }
    else if (!form.state){
      toastr.error('set state');
    }
    else{
      if (!form.harvester_code){
        form.harvester_code = $scope.default.harvester_code;
      }
      $http.get('/server_time').then(function successCallback(response) {
        var date = response.data.timestamp;
        var now = moment(date).utcOffset(response.data.timezone).format();
        var day = moment(date).utcOffset(response.data.timezone).format('DD');
        var date_group = DateGroup(day);
        var hars = $scope.list.harvester.filter(function(el){
          return el.harvester_code === form.harvester_code;
        });
        var sup_code = (hars[0] ? hars[0].supplier_group : $scope.default.supplier_group);
        var loin_code = LoinCode(form.state);
        var date_code = moment(date).utcOffset(response.data.timezone).format('DDMMYY');
        var internal_lot_code = $scope.options.process_plant + sup_code + date_group + date_code + loin_code;
        $scope.EditCurrentHarvester(form.harvester_code, internal_lot_code, now);
      }, function errorCallback(response) {
      });
    }
  };

  $scope.toggleStateValue = function(){
    var checkInput = document.getElementById('toggle-state-edit');
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.form.state = checkInput.checked ? 'Clean' : 'Dirty';
      });
    }, 0);
  };

  $scope.EditCurrentHarvester = function(harvester_code, internal_lot_code, now){
    $scope.current.harvester_code = harvester_code;
    var date = now;
    var query = "?lot_number=eq." + $scope.current.collectionid;
    var patch = {"harvester_code": harvester_code, "internal_lot_code": internal_lot_code};
    var func = function(response){
      $scope.current.lot = (response.data[0] || response.data);
      $rootScope.$broadcast('collection-change', {id: $scope.current.collectionid});
      $scope.form = {};
      $scope.showedit = false;
    };
    DatabaseServices.PatchEntry('lot', patch, query, func);
  };

})

.controller('NewLotCtrl', function($scope, $http, DatabaseServices, $rootScope, toastr) {
  //for recent lots drop down

  $scope.lotselected = 'no selected';

  $scope.ListLots = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).format();
      var query = '?end_date=gte.'+ date + '&processor_code=eq.' + $scope.processor;
      var func = function(response){
        $scope.list.lot = response.data;
      };
      DatabaseServices.GetEntries('harvester_lot', func, query);      
    }, function errorCallback(response) {
    });
  };
  $scope.ListLots();

  $scope.ListMoreLots = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(30, 'days').format();
      var query = '?end_date=gte.'+ date + '&processor_code=eq.' + $scope.processor;
      var func = function(response){
        $scope.list.lots = response.data;
      };
      DatabaseServices.GetEntries('harvester_lot', func, query);      
    }, function errorCallback(response) {
    });
  };
  $scope.ListMoreLots();

  $scope.ListStationLots = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(30, 'days').format();
      var query = '?end_date=gte.'+ date + '&processor_code=eq.' + $scope.processor + '&station_code=eq.' + $scope.station_code;
      var func = function(response){
        $scope.list.stnlots = response.data;
      };
      DatabaseServices.GetEntries('harvester_lot', func, query);      
    }, function errorCallback(response) {
    });
  };
  $scope.ListStationLots();

  $scope.$on('collection-change', function(event, args) {
    $scope.ListLots();
  });

  $scope.SetLot = function(lot_number){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).format();
      var end_date = moment.parseZone(date).endOf('day').format();


      var patch = {'end_date': end_date};
      var query = '?lot_number=eq.' + lot_number;
      var func = function(response){
        if (response.data.length > 0){
          $scope.current.lot = response.data[0];
          $rootScope.$broadcast('collection-change', {id: $scope.current.lot.lot_number});
          $scope.current.shipping_unit = null;
          $scope.current.harvester = null;
          $scope.current.supplier = null;
        }//end if
        else{
        }
      };
      DatabaseServices.PatchEntry('lot', patch, query, func);
    }, function errorCallback(response) {
    });
  };

  //for harvester drop down
  $scope.form = {};
  $scope.form.state = 'Dirty';

  $scope.selected = 'no selected';

  $scope.ListHarvesters = function(){
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '?processor_code=eq.' + $scope.processor + '&active=eq.true';
    DatabaseServices.GetEntries('harvester', func, query);
  };
  $scope.ListHarvesters();


  /*
   * lotlocations functions
   */

  $scope.AddNew = function(lot_number, station_code, bool){
    var func = function(response){
    };
    var entry = {'lot_number': lot_number, 'station_code': station_code, 'in_progress': bool};
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
    var query = '?station_code=eq.' + station_code + '&lot_number=eq.' + lot_number;
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
    var query = '?station_code=eq.' + station_code + '&lot_number=eq.' + lot_number; 
    DatabaseServices.GetEntries('lotlocations', func, query);
  };
  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined && $scope.current.collectionid !== null && $scope.current.collectionid !== 'no selected'){
      for (var i=0;i<$scope.setstation.set.length;i++){
        var station = $scope.setstation.set[i];
        if ($scope.current.lot){
          $scope.StationLot($scope.current.collectionid, station);
        }        
      }
      for (var j=0;j<$scope.setstation.add.length;j++){
        var station1 = $scope.setstation.add[j];
        $scope.AddStationLot($scope.current.collectionid, station1);
      }

      $rootScope.$broadcast('collection-change', {id: $scope.current.collectionid});

    }
  });
  /*
   * end lotlocations
   */

  $scope.thisfishCode = function(lotnum){
    var query = '';
    var func = function(response){
      var nextcode = response.data[0].tf_code;
      $scope.assignCode(lotnum, nextcode);
    };
    DatabaseServices.GetEntries('nextcode', func, query);
  };

  $scope.assignCode = function(lotnum, tf_code){
    var query = '?tf_code=eq.' + tf_code;
    var func = function(response){
      $scope.current.collectionid = lotnum;
    };
    var patch = {lot_number: lotnum};
    DatabaseServices.PatchEntry('thisfish',patch, query, func);
  };

  /*make a new lot in the database*/
  $scope.DatabaseLot = function(){
    var func = function(response){
      $scope.current.lot = (response.data[0] || response.data);

      if ($scope.current.harvester && $scope.current.harvester.traceable){
        $scope.thisfishCode($scope.current.lot.lot_number);
      }
      else{
        $scope.current.collectionid = $scope.current.lot.lot_number;
        $scope.current.shipping_unit = null;
        $scope.current.harvester = null;
        $scope.current.supplier = null;
      }

      $scope.form = {};

    };
    DatabaseServices.DatabaseEntryCreateCode('lot', $scope.entry.lot, $scope.processor, func);
  };

  /*fill in fields in json obj*/
  $scope.MakeLotEntry = function(date, internal_lot_code){    
    CreateLotEntryPeriod(date, 'day', $scope);
    $scope.entry.lot.station_code = $scope.station_code;

    $scope.entry.lot.receive_station = $scope.settings.receive_station;
    $scope.entry.lot.process_station = $scope.settings.process_station;

    $scope.entry.lot.internal_lot_code = internal_lot_code;

  };

  /*Gets current lot given selected supplier, if does not exist creates a new lot*/
  $scope.CreateLot = function(queryString, date, internal_lot_code){
    var func = function(response){
      if (response.data.length > 0){
        $scope.current.lot = response.data[0];
        $scope.current.collectionid = $scope.current.lot.lot_number;
      }//end if
      else{
        $scope.MakeLotEntry(date, internal_lot_code);
        $scope.DatabaseLot();  
      }
    };
    DatabaseServices.GetEntries('lot', func, queryString);
  };

  
  /*gets selected supplier, creates querystring for lot*/

  $scope.SetCurrentHarvester = function(harvester_code, internal_lot_code, now){

    $scope.current.harvester_code = harvester_code;
    var date = now;
    var queryString = "?harvester_code=eq." + harvester_code + "&internal_lot_code=eq." + internal_lot_code + "&start_date=lt." + date + "&end_date=gt." + date;
    $scope.entry.lot = {"harvester_code": harvester_code, "station_code": $scope.station_code, "processor_code": $scope.processor};
    $scope.CreateLot(queryString, date, internal_lot_code);

  };

  $scope.SubmitNewLot = function(form){
    if (form){
      $http.get('/server_time').then(function successCallback(response) {
        var the_date = response.data.timestamp;
        var date = moment(the_date).utcOffset(response.data.timezone).format();
        if (!$scope.options.no_harvester){
          var harvester_code = $scope.current.harvester.harvester_code;
        }
        var ship_code = $scope.current.shipping_unit.shipping_unit_number;
        var ref_num = $scope.current.shipping_unit.po_number;
        var sup_code = $scope.current.supplier.supplier_code;
        var r_date = $scope.current.receivedate || null;
        var queryString = "?internal_lot_code=eq." + ref_num;
        $scope.entry.lot = {"harvester_code": (harvester_code || null), "shipping_unit_number": ship_code ,
        "station_code": $scope.station_code, "processor_code": $scope.processor, "supplier_code": sup_code, "receive_date": r_date};
        $scope.CreateLot(queryString, date, ref_num);
      }, function errorCallback(response) {
      });
    }    
  };


  $scope.GetHar = function(harvester){
    $scope.form.harvester_code = harvester.harvester_code;
    $scope.current.harvester = harvester;
  };

  $scope.GenInternalLot = function(form){
    if (!form.harvester_code){
      toastr.error('set harvester');
    }
    else if (!form.state){
      toastr.error('set state');
    }
    else{
      $http.get('/server_time').then(function successCallback(response) {
        var date = response.data.timestamp;
        var now = moment(date).utcOffset(response.data.timezone).format();
        var day = moment(date).utcOffset(response.data.timezone).format('DD');
        var date_group = DateGroup(day);
        var hars = $scope.list.harvester.filter(function(el){
          return el.harvester_code === form.harvester_code;
        });
        var sup_code = hars[0].supplier_group;
        var loin_code = LoinCode(form.state);
        var date_code = moment(date).utcOffset(response.data.timezone).format('DDMMYY');
        var internal_lot_code = $scope.options.process_plant + sup_code + date_group + date_code + loin_code;
        $scope.SetCurrentHarvester(form.harvester_code, internal_lot_code, now);
      }, function errorCallback(response) {

      });
    }

  };

  $scope.toggleStateValue = function(){
    var checkInput = document.getElementById('toggle-state');
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.form.state = checkInput.checked ? 'Clean' : 'Dirty';
      });
    }, 0);
  };

  $scope.changelot = function(){
    $scope.current.lot = null;
    $scope.current.collectionid = null;
    $scope.form.state = 'Dirty';
    $scope.form.harvester_code = null;
    $rootScope.$broadcast('change-lot');
  };

  $scope.formchange=true;
})

.controller('ListLotsCtrl', function($scope, $http, DatabaseServices, $rootScope, toastr) {
  $scope.ListStationLots();

  $scope.dropdownSelect = function(lot_number){
    $scope.current.lot_to_edit_or_select = lot_number;
  };

  $scope.CreateButton = function(){
    $scope.current.showforms='CREATE';
    $scope.current.shipping_unit = null;
    $scope.current.harvester = null;
    $scope.current.supplier = null;
    $scope.entry = null;
    $scope.current.receivedate = null;
  };
})


.controller('CreateLotCtrl', function($scope, $http, DatabaseServices, $rootScope, toastr) {
  //for recent lots drop down

  $scope.form = {};
  $scope.create_button = true;


  $scope.ListStationLots = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(30, 'days').format();
      var query = '?end_date=gte.'+ date + '&processor_code=eq.' + $scope.processor + '&station_code=eq.' + $scope.station_code;
      var func = function(response){
        $scope.list.stnlots = response.data;
        $scope.current.lot_to_edit_or_select=null;
        $scope.current.showforms='NONE';
        $scope.create_button = true;
        $scope.current.shipping_unit = null;
        $scope.current.harvester = null;
        $scope.current.supplier = null;

      };
      DatabaseServices.GetEntries('harvester_lot', func, query);      
    }, function errorCallback(response) {
    });
  };
  //$scope.ListStationLots();


  /*make a new lot in the database*/
  $scope.DatabaseLot = function(){
    var func = function(response){
      $scope.ListStationLots();
      $scope.form = {};
    };
    DatabaseServices.DatabaseEntryCreateCode('lot', $scope.entry.lot, $scope.processor, func);
  };

  /*fill in fields in json obj*/
  $scope.MakeLotEntry = function(date, internal_lot_code){    
    CreateLotEntryPeriod(date, 'day', $scope);
    $scope.entry.lot.station_code = $scope.station_code;

    $scope.entry.lot.receive_station = $scope.settings.receive_station;
    $scope.entry.lot.process_station = $scope.settings.process_station;

    $scope.entry.lot.internal_lot_code = internal_lot_code;

  };

  /*Gets current lot given selected supplier, if does not exist creates a new lot*/
  $scope.CreateLot = function(queryString, date, internal_lot_code){
    var func = function(response){
      if (response.data.length > 0){
        $scope.current.lot = response.data[0];
        $scope.current.collectionid = $scope.current.lot.lot_number;
      }//end if
      else{
        $scope.MakeLotEntry(date, internal_lot_code);
        $scope.DatabaseLot();  
      }
    };
    DatabaseServices.GetEntries('lot', func, queryString);
  };


  $scope.SubmitNewLot = function(form){
    $scope.create_button = false;
    if (form){
      if (!$scope.current.shipping_unit){
        toastr.error('Set Shipment Info');
      }
      else if (!$scope.current.supplier){
        toastr.error('Set Supplier Info');
      }
      else if (!$scope.options.no_harvester && !$scope.current.harvester){
        toastr.error('Set Fishing Info');
      }
      else{
        $http.get('/server_time').then(function successCallback(response) {
          var the_date = response.data.timestamp;
          var date = moment(the_date).utcOffset(response.data.timezone).format();
          if (!$scope.options.no_harvester){
            var harvester_code = $scope.current.harvester.harvester_code;
          }
          var ship_code = $scope.current.shipping_unit.shipping_unit_number;
          var ref_num = $scope.current.shipping_unit.po_number;
          var sup_code = $scope.current.supplier.supplier_code;
          var r_date = $scope.current.receivedate || null;
          var queryString = "?internal_lot_code=eq." + ref_num;
          $scope.entry.lot = {"harvester_code": (harvester_code || null), "shipping_unit_number": ship_code ,
          "station_code": $scope.station_code, "processor_code": $scope.processor, "supplier_code": sup_code, "receive_date": r_date};
          $scope.CreateLot(queryString, date, ref_num);
        }, function errorCallback(response) {
        });
      }
    }    
  };

  $scope.$watch('createforms', function(newValue, oldValue) {
    if ($scope.createforms === true){
      $scope.current.receivedate = null;
      $scope.current.shipping_unit = null;
      $scope.current.harvester = null;
      $scope.current.supplier = null;
    }    
  });

})


;
