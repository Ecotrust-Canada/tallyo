'use strict';


angular.module('scanthisApp.packingController', [])


.controller('PackingCtrl', function($scope, $http, DatabaseServices, toastr, $animate, $timeout) {

  /*put an object in a container if the id matches an object. alerts to overwrite if in another*/
  $scope.PutObjInContainer = function(raw_id){
    if (!raw_id) {
      toastr.error('please scan a code');
    }
    else{
      var id = raw_id.split("/")[0].toUpperCase();
      $scope.id = id;

      var func = function(response){
        $scope.current.patchitem = response.data[0];//so can check most recent scan against rest to determine if mixing harvesters
        var itemcollection = response.data[0][$scope.station_info.collectionid];
        //if the object is in another collection
        if (itemcollection && itemcollection !== $scope.current.collectionid  && itemcollection.substring(2,5) === $scope.processor){ 
          confirmTrue("overwrite from previous?", $scope.PatchObjWithContainer, $scope.clearField);
        }
        //if it is already in current collection
        else if (itemcollection === $scope.current.collectionid){
          toastr.warning('already added');
          $scope.clearField();
        }
        else{
          $scope.PatchObjWithContainer(id);
        }      
      };
      var onErr = function() {
        toastr.error('invalid object'); // show failure toast.
      };

      var query = '?' + $scope.station_info.itemid + '=eq.' + id;
      DatabaseServices.GetEntry($scope.station_info.patchtable, func, query, onErr);
    }

    
  };

  $scope.clearField = function(){
    $scope.obj_id = null;
  };

  $scope.MakeScan = function(id){
    $scope.entry.scan = {"station_code": $scope.station_code,};
    $scope.entry.scan[$scope.station_info.itemid] = id;
    $scope.entry.scan[$scope.station_info.collectionid] = $scope.current.collectionid;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  /*writes the foreignkey of the object, adds object to list*/
  $scope.PatchObjWithContainer = function(){

    var func = function(response){
      //toastr.success('added'); // show success toast.

      // attempt to highlight new row in itemstable
      setTimeout(function () {
        var tr = angular.element(document.querySelector('#item-'+response.data[0][$scope.station_info.itemid]));  
        if (tr){
          var c = 'new_item';
          tr.addClass(c);
          $timeout(function(){ tr.removeClass(c); }, 2000); 
        }
      }, 100);
      
      $scope.MakeScan($scope.id);

    };
    var onErr = function(){
      toastr.error('invalid object'); // show failure toast.
    };

    var patch = {};
    patch[$scope.station_info.collectionid] = $scope.current.collectionid;
    var query = '?' + $scope.station_info.itemid + '=eq.' + $scope.id;   
    DatabaseServices.PatchEntry($scope.station_info.patchtable, patch, query, func, onErr);
  };  


  $scope.MakeQR = function(){
    var data = dataCombine($scope.current[$scope.station_info.collectiontable], $scope.onLabel.qr);
    var labels = ArrayFromJson($scope.current[$scope.station_info.collectiontable], $scope.onLabel.print);
    console.log(data, labels);
    //$scope.printLabel(data, labels);
  };



  $scope.Complete = function(){
    if ($scope.onLabel){
      $scope.MakeQR();
    }
    $scope.current.selected = 'no selected';
    $scope.current.collectionid = null;
  };

  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid === undefined  || $scope.current.collectionid === null || $scope.current.collectionid === 'no selected'){
      $scope.formdisabled = true;
    }
    else{
      $scope.formdisabled = false;
    }
  });



})

.controller('RemovePatchCtrl', function($scope, $http, DatabaseServices) {
  
  $scope.PatchObjRemoveContainer = function(id){
    var func = function(response){     
      $scope.RemoveScan(id);
    };
    var patch = {};
    patch[$scope.station_info.collectionid] = null;
    var query = '?' + $scope.station_info.itemid + '=eq.' + id;
    DatabaseServices.PatchEntry($scope.station_info.patchtable, patch, query, func);
  };

  $scope.RemoveScan = function(itemid){
    var query = '?' + $scope.station_info.itemid + '=eq.' + itemid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

})





.controller('CalculateBoxCtrl', function($scope, $http, DatabaseServices) {
  $scope.CalcBox = function(){
    var lot_num = GetBoxLotNumber($scope.list.included);
    if (lot_num !== undefined){
      $scope.GetInfo(lot_num);
    }
    else{
      var harvester_code = 'none';
      var box_weight = CalculateBoxWeight($scope.list.included);
      var best_before = null;
      var num = 0;
      var internal_lot_code = '';
      lot_num = 'none';
      if ($scope.current.collectionid) {
          $scope.PatchBoxWithWeightLot(box_weight, lot_num, num, harvester_code, internal_lot_code, best_before);
      }
    }
  };

  $scope.GetInfo = function(lot_num){
    var func = function(response){
      var internal_lot_code = response.data[0].internal_lot_code ? 
                              cutString(response.data[0].internal_lot_code, 4, 5).substring(0, 8) : null;
      var harvester_code = response.data[0].harvester_code;
      var box_weight = CalculateBoxWeight($scope.list.included);
      var num = $scope.list.included.length;

      var tf_code = response.data[0].tf_code;
      var ft_fa_code = response.data[0].ft_fa_code;
      var best_before = moment(response.data[0].timestamp).add(2, 'years').format();

      $scope.PatchBoxWithWeightLot(box_weight, lot_num, num, harvester_code, internal_lot_code, tf_code, ft_fa_code, best_before);

    };
    var query = '?lot_number=eq.' + lot_num;
    DatabaseServices.GetEntry('harvester_lot', func, query);
  };


    /*adds final info to box*/
  $scope.PatchBoxWithWeightLot = function(box_weight, lot_num, num, harvester_code, internal_lot_code, tf_code, ft_fa_code, best_before){
    var func = function(response){
      $scope.current.box = response.data[0];
      $scope.current.box.internal_lot_code = internal_lot_code;
      $scope.current.box.harvester_code = harvester_code;
      $scope.current.box.tf_code = tf_code;
      $scope.current.box.ft_fa_code = ft_fa_code;
    };
    var patch = {'weight': box_weight, 'pieces': num, 'best_before_date': best_before};

    if (lot_num !== 'none'){
      patch.lot_number = lot_num;
    }
    var query = '?box_number=eq.' + $scope.current.collectionid;
    DatabaseServices.PatchEntry('box', patch, query, func);
  }; 

  $scope.$watch('list.included', function() {
    if ($scope.list.included !== undefined && $scope.list.included !== null){
      $scope.CalcBox();
    }
  });

})

.controller('HarvesterBoxCtrl', function($scope, $http, DatabaseServices, toastr) { 
  $scope.harvesterArray = [];
  $scope.collectionid = '';

  $scope.CheckHarvester = function(harvester){
    if(harvester){
      if ($scope.harvesterArray.length === 0){
        $scope.harvesterArray.push(harvester);
      }
      else if ($scope.harvesterArray.indexOf(harvester) !== -1){
      }
      else{
        $scope.harvesterArray.push(harvester);
        toastr.error('Warning: Mixing Harvesters in Lot');
      }
    }      
  };

  $scope.$watch('list.included', function() {
    if($scope.current.collectionid !== $scope.collectionid){
      $scope.collectionid = $scope.current.collectionid;
      var all = fjs.pluck('harvester_code', $scope.list.included);
      var unique = fjs.nub(function (arg1, arg2) {
        return arg1 === arg2;
      });
      $scope.harvesterArray = unique(all);
    }else{
      if ($scope.current.patchitem){
        if ($scope.current.patchitem.harvester_code){
          $scope.CheckHarvester($scope.current.patchitem.harvester_code);        
        }
      }
    }    
  });
})


.controller('AddInventoryCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.entry.scan = {};

  $scope.ScanIn = function(){
    if (!$scope.raw.string) {
      toastr.error('please scan a code');
    }
    else{
      var rawArray = $scope.raw.string.split("/");
      var id = rawArray[0];

      var func = function(response){
        $scope.CheckScan(id);
      };
      var onErr = function() {
        $scope.raw.string = null;
        toastr.error('invalid object'); // show failure toast.
      };
      var query = '?' + $scope.station_info.itemid + '=eq.' + id;
      DatabaseServices.GetEntry($scope.station_info.patchtable, func, query, onErr);
      } 
  };
 
  $scope.CheckScan = function(id){
    var func = function(response){
      if (response.data.length >0){
        $scope.raw.string = null;
        toastr.warning("already exists");
      }
      else{
        $scope.entry.scan[$scope.station_info.itemid] = id;
        $scope.entry.scan.station_code = $scope.station_code;
        $scope.DatabaseScan();
      }
    };
    var query = '?' + $scope.station_info.itemid + '=eq.' + id + '&station_code=eq.' + $scope.station_code;
    DatabaseServices.GetEntries('scan', func, query);
  };

  $scope.DatabaseScan = function(){    
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      toastr.success('added');
      $scope.raw.string = null;
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  var thediv = document.getElementById('inv_input');
      if(thediv){
        thediv.focus();
      }
})



.controller('ThisfishAddCtrl', function($scope, $http, DatabaseServices, toastr) {


  $scope.show_element = '';

  $scope.ListTFCodes = function(){
    var query = '?lot_number=is.null';
    var func = function(response){
      $scope.list.tf_codes = response.data;
    };
    DatabaseServices.GetEntries('group_codes', func, query);
  };

  $scope.ListTFCodes();

  $scope.selectedoption = 'no selected';

  $scope.the_config = 
  { 
    limit: "10",
    order: "-timestamp", 
    arg: "codes", 
    fields: ["label", "codes"]
  };

  $scope.SetCodes = function(codes){
    $scope.current.codes = JSON.parse(codes);
    $scope.current.codes.forEach(
      function(el){
        $scope.PatchLot($scope.current.collectionid, el);
      }
    );
  };

  $scope.PatchLot = function(lot_number, tf_code){
    var query = '?tf_code=eq.' + tf_code;
    var patch = {'lot_number': lot_number};
    var func = function(response){
      $scope.ListTFCodes();
    };
    DatabaseServices.PatchEntry('thisfish', patch, query, func);
  };

  $scope.RemoveCodes = function(codes){
    codes.forEach(
      function(el){
        $scope.PatchLot(null, el);
      }
    );
  };

  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined  && $scope.current.collectionid !== null && $scope.current.collectionid !== 'no selected'){
      $scope.current.codes = null;
      $scope.show_element = '';
      var query = '?lot_number=eq.' + $scope.current.collectionid;
      var func = function(response){
        if (response.data.length>0){
          $scope.current.codes = response.data[0].codes;
          $scope.current.products = response.data[0].products;
        }
      };
      DatabaseServices.GetEntries('group_codes', func, query);
    }
  });

})


;

