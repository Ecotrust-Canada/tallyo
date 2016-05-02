'use strict';


angular.module('scanthisApp.packingController', [])


.controller('PackingCtrl', function($scope, $http, DatabaseServices, toastr, $animate, $timeout) {

  $scope.input = {};
  $scope.current.addnew = false;
  $scope.current.select_change = false;

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
        var itemcollection = response.data[0][($scope.station_info.patchid || $scope.station_info.collectionid)];
        //if the object is in another collection
        if (itemcollection && itemcollection !== $scope.current.collectionid  && itemcollection.substring(2,5) === $scope.processor){ 
          //confirmTrue("overwrite from previous?", $scope.PatchObjWithContainer, $scope.clearField);
          var disabled = function(event) {
            event.preventDefault();
  
          };
          document.onkeydown = disabled;
          $scope.overlay('overwrite');
        }
        //if it is already in current collection
        else if (itemcollection === $scope.current.collectionid){
          toastr.warning('already added');
          $scope.clearField();
        }
        else{
          if ($scope.options.check_grade){
            $scope.CheckGrade($scope.current.box.grade, $scope.current.patchitem.grade);
          }else{
            $scope.PatchObjWithContainer();
          }
          
        }      
      };
      var onErr = function() {
        $scope.clearField();
        toastr.error('invalid QR code'); // show failure toast.
      };

      var query = '?' + $scope.station_info.itemid + '=eq.' + id;
      DatabaseServices.GetEntry($scope.station_info.patchtable, func, query, onErr);
    }    
  };

  $scope.CheckGrade = function(box_grade, loin_grade){
    var conv = {
      'A': 'AAA',
      'B': 'AA',
      'C': 'A',
      'D': 'D'
    };
    loin_grade = conv[loin_grade];
    if (loin_grade !== box_grade){
      $scope.overlay('mixgrade');
    }else{
      $scope.PatchObjWithContainer();
    }
  };

  $scope.clearField = function(){
    $scope.input.code = null;
  };

  $scope.MakeScan = function(id){
    $scope.entry.scan = {"station_code": $scope.station_code};
    $scope.entry.scan[$scope.station_info.itemid] = id;
    $scope.entry.scan[$scope.station_info.collectionid] = $scope.current.collectionid;
    var func = function(response){
      $scope.input.code=null;
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  /*writes the foreignkey of the object, adds object to list*/
  $scope.PatchObjWithContainer = function(){

    var func = function(response){
      //toastr.success('added'); // show success toast.

      // attempt to highlight new row in itemstable
      /*setTimeout(function () {
        var tr = angular.element(document.querySelector('#item-'+response.data[0][$scope.station_info.itemid]));  
        if (tr){
          var c = 'new_item';
          tr.addClass(c);
          $timeout(function(){ tr.removeClass(c); }, 2000); 
        }
      }, 100);*/
      $scope.current.addnew = true;
      
      $scope.MakeScan($scope.id);

    };
    var onErr = function(){
      toastr.error('invalid QR code'); // show failure toast.
    };

    var patch = {};
    patch[($scope.station_info.patchid || $scope.station_info.collectionid)] = $scope.current.collectionid;
    //console.log(patch);
    var query = '?' + $scope.station_info.itemid + '=eq.' + $scope.id;   
    DatabaseServices.PatchEntry($scope.station_info.patchtable, patch, query, func, onErr);
  };  


  $scope.MakeQR = function(){
    var data = dataCombine($scope.current[$scope.station_info.collectiontable], $scope.onLabel.qr);
    var labels = ArrayFromJson($scope.current[$scope.station_info.collectiontable], $scope.onLabel.print);
    console.log(data, labels);
    if ($scope.current[$scope.station_info.collectiontable].ft_fa_code) {
      $scope.printLabelFairTrade(data, labels);
    } else {
      $scope.printLabel(data, labels);
    }
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

  $scope.showEdit = function(){
    $scope.current.edit_box= !$scope.current.edit_box;
  };







})

.controller('PackingTotalCtrl', function($scope, $http, DatabaseServices) {

  $scope.current.totals = {};

  $scope.loadTotals = function(){
    if ($scope.station_info.collectiontable === 'lot'){
      var func = function(response){
        if (response.data.length > 0){
          var data = response.data[0];
          $scope.current.totals.weight = data.weight_1;
          $scope.current.totals.pieces = data.boxes;
        }        
      };
      var query = '?lot_number=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntries('lot_summary', func, query);
    }
    /*else if ($scope.station_info.collectiontable === 'box'){
      $scope.current.totals.weight = $scope.current.box.weight;
      $scope.current.totals.pieces = $scope.current.box.pieces;      
    }*/
    else if ($scope.station_info.collectiontable === 'shipping_unit'){
      var func1 = function(response){
        if (response.data.length > 0){
          var data = response.data[0];
          $scope.current.totals.weight = data.total_weight;
          $scope.current.totals.pieces = data.boxes;
        }
      };
      var query1 = '?shipping_unit_number=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntries('ship_with_info', func1, query1);
    }
  };

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      if ($scope.current.collectionid === 'no selected'){
      }
      else{
        $scope.loadTotals();         
      }
    }
  });

})



.controller('RemovePatchCtrl', function($scope, $http, DatabaseServices, toastr) {


  //confirmTrue = function(message, func, elsefunc)
  
  $scope.PatchObjRemoveContainer = function(obj){
    //var id = obj[$scope.station_info.itemid];
    $scope.to_delete = obj;
    if ($scope.options.qrform && obj.lot_number !== null){
      toastr.error('cannot delete - box in processing');
    }
    else if ($scope.options.qrform && obj.shipping_unit_number !== null){
      toastr.error('cannot delete - box shipped');
    }else{
      $scope.overlay('delete');
    }
    
  };

  $scope.PatchNull = function(){
    var id = $scope.to_delete[$scope.station_info.itemid];
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
      if ($scope.options.qrform){
        $scope.removeObj(itemid);
      }
      else{
        $scope.current.itemchange = !$scope.current.itemchange;
        $scope.to_delete=null;
      }
      
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

  $scope.removeObj = function(itemid){
    var query = '?' + $scope.station_info.itemid + '=eq.' + itemid;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.to_delete=null;
    };
    DatabaseServices.RemoveEntry($scope.station_info.patchtable, query, func);
  };

})





.controller('CalculateBoxCtrl', function($scope, $http, DatabaseServices) {
  $scope.CalcBox = function(){
    var case_num;
    if(!$scope.current.box.case_number){
      case_num = ($scope.options.case_label || 'Z' ) + padz(String(parseInt($scope.current.collectionid.substring(6,10),36)%10001),5);
    }
    else case_num = $scope.current.box.case_number;
    var lot_num = GetBoxLotNumber($scope.list.included);
    if (lot_num !== undefined){
      $scope.GetInfo(lot_num, case_num);
    }
    else{
      var harvester_code = null;
      var box_weight = CalculateBoxWeight($scope.list.included);
      var best_before = null;
      var num = 0;
      var internal_lot_code = '';
      lot_num = null;
      var the_yield = null;
      if ($scope.current.collectionid) {
          $scope.PatchBoxNull(box_weight, lot_num, num, harvester_code, internal_lot_code, best_before, case_num, the_yield);
      }
    }
  };

  $scope.GetInfo = function(lot_num, case_num){
    var func = function(response){
      var box_har = response.data[0];
      $scope.PatchBoxWithWeightLot(box_har, lot_num, case_num);
    };
    var query = '?lot_number=eq.' + lot_num;
    DatabaseServices.GetEntry('harvester_lot', func, query);
  };


  $scope.PatchBoxNull = function(box_weight, lot_num, num, harvester_code, internal_lot_code, best_before, case_num, the_yield){

    var func = function(response){
      $scope.current.box = response.data[0];
        $scope.current.box.tf_code = null;
        $scope.current.box.ft_fa_code = null;
        $scope.current.box.fleet = null;
        $scope.current.box.receive_date = null;
        $scope.current.box.prod_date = null;
        $scope.current.box.supplier_group = null;
        $scope.current.box.wpp = null;
    };
    var patch = {'weight': box_weight, 'pieces': num, 'best_before_date': best_before, 'internal_lot_code': internal_lot_code, 'harvester_code': harvester_code, 'lot_number': lot_num, 'case_number':case_num, 'yield':the_yield};
    var query = '?box_number=eq.' + $scope.current.collectionid;
    DatabaseServices.PatchEntry('box', patch, query, func);
    
  };

    /*adds final info to box*/
  $scope.PatchBoxWithWeightLot = function(box_har, lot_num, case_num){
    var internal_lot_code = box_har.internal_lot_code ? 
                              cutString(box_har.internal_lot_code, 4, 5).substring(0, 8) : null;
    var box_weight = CalculateBoxWeight($scope.list.included);
    var num = $scope.list.included.length;
    var best_before = moment(box_har.timestamp).add(2, 'years').format();

    var func = function(response){
      $scope.current.box = response.data[0];
        $scope.current.box.tf_code = box_har.tf_code;
        $scope.current.box.ft_fa_code = box_har.ft_fa_code;
        $scope.current.box.fleet = box_har.fleet;
        $scope.current.box.harvest_date = moment(box_har.timestamp).format();
        $scope.current.box.prod_date = moment(box_har.timestamp).format('YYYY-MM-DD');
        $scope.current.box.supplier_group = box_har.supplier_group;
        $scope.current.box.wpp = box_har.fishing_area;
        $scope.current.totals.weight = $scope.current.box.weight;
        $scope.current.totals.pieces = $scope.current.box.pieces;
    };
    var patch = {'weight': box_weight, 'pieces': num, 'best_before_date': best_before, 'internal_lot_code': internal_lot_code, 'harvester_code': box_har.harvester_code, 'lot_number': lot_num, 'case_number':case_num, 'yield':box_har.yield_by_pieces};
    var query = '?box_number=eq.' + $scope.current.collectionid;
    DatabaseServices.PatchEntry('box', patch, query, func);
  }; 

  $scope.$watch('list.included', function() {
    if ($scope.list.included !== undefined && $scope.list.included !== null){
      $scope.CalcBox();
    }
  });

})

.controller('HarvesterBoxCtrl', function($scope, $http, DatabaseServices, toastr, $timeout) { 
  $scope.harvesterArray = [];
  //$scope.collectionid = '';
  $scope.current.mixed = false;

  $scope.$watch('list.included', function() {
      var all = fjs.pluck('harvester_code', $scope.list.included);
      var unique = fjs.nub(function (arg1, arg2) {
        return arg1 === arg2;
      });
      $scope.harvesterArray = unique(all);
      if($scope.current.collectionid !== null && $scope.current.collectionid !== undefined){
        if ($scope.harvesterArray.length === 0){
          $scope.current.mixed = false;
          $scope.PatchLotwithHar(null, null);
        }
        else if ($scope.harvesterArray.length === 1){
          $scope.current.mixed = false;
          var ship = fjs.pluck('shipping_unit_in', $scope.list.included);
          var ship_num = ship[0];
          $scope.PatchLotwithHar($scope.harvesterArray[0], ship_num);        
        }
        else if ($scope.harvesterArray.length > 1){
          if ($scope.current.mixed === false){
            toastr.warning('Warning: Mixing Harvesters in Lot');      
          }
          $scope.PatchLotwithHar(null, null);
          $scope.current.mixed = true;
        }  
      }  
  });

  $scope.PatchLotwithHar = function(harvester_code, ship_num){
    var func = function(response){
      $scope.DisplayCollectionInfo();
    };
    var patch = {'harvester_code': harvester_code, 'shipping_unit_number': ship_num};
    var query = '?lot_number=eq.' + $scope.current.collectionid;
    DatabaseServices.PatchEntry('lot', patch, query, func);
  };

  $scope.DisplayCollectionInfo = function(){
    var func = function(response){

      if (response.data.length > 0){
        $scope.current.lot = response.data[0];
        var thediv = document.getElementById('scaninput');
        if(thediv){
         $timeout(function(){thediv.focus();}, 0);
        }
      }
    };
    var query = '?lot_number=eq.' + $scope.current.collectionid;
    DatabaseServices.GetEntryNoAlert('harvester_lot', func, query);
  };



})




.controller('AddInventoryCtrl', function($scope, $http, DatabaseServices, toastr, $timeout) {

  $scope.current.addnew = false;

  $scope.entry.scan = {};

  var focusScan = function(){
    var thediv = document.getElementById('scaninput');
    if(thediv){
     $timeout(function(){thediv.focus();}, 0);
    }
  };

  focusScan();



  $scope.ScanIn = function(){
    if (!$scope.raw.string) {
      toastr.error('please scan a code');
    }
    else{
      var rawArray = $scope.raw.string.toUpperCase().split("/");
      var id = rawArray[0].toUpperCase();

      var func = function(response){
        $scope.CheckScan(id);
      };
      var onErr = function() {
        $scope.raw.string = null;
        toastr.error('invalid QR code'); // show failure toast.
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
      $scope.current.addnew = true;
      //toastr.success('added');
      if ($scope.options.secondstation){
        $scope.SecondScan();
      }
      $scope.raw.string = null;
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  $scope.SecondScan = function(){
    $scope.entry.scan.station_code = $scope.options.secondstation;    
    var func = function(response){
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  

})


.controller('AddInventoryTotalCtrl', function($scope, $http, DatabaseServices, toastr, $timeout) {
  $scope.LoadTotals = function(){
    var table;
    var fields;
    if ($scope.options.total_by === 'lot'){
      table = 'today_total_lot';
      fields = ["internal_lot_code"];
    }
    else if($scope.options.total_by === 'ship'){
      table = 'today_total_ship';
      fields = ["ship_har"];
    }

    var func = function(response){
      $scope.list.items = response.data;
      $scope.totallistconfig = JSON.parse(JSON.stringify($scope.boxconfig)); 
      $scope.totallistconfig.fields = fields.concat($scope.totallistconfig.fields);
      $scope.LoadRecent();
    };
    var query = '?station_code=eq.' + $scope.station_code;
    DatabaseServices.GetEntries(table, func, query);
  };
  $scope.boxconfig = 
  {
    cssclass: "fill small", 
    fields: [ "boxes"], 
    order: 'grade'
  };

  $scope.$watch('current.itemchange', function() {   
    $scope.LoadTotals();
  });

  $scope.LoadRecent = function(){
    var func = function(response){
      $scope.list.included = response.data;
    };
    var query = '?station_code=eq.' + $scope.station_code + '&order=timestamp.desc';
    DatabaseServices.GetEntries('box_with_info', func, query, 'twenty');
  };


  $scope.PatchNull = function(){
    var itemid = $scope.to_delete;
    var query = '?' + $scope.station_info.itemid + '=eq.' + itemid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      if ($scope.options.secondstation){
        console.log('secondstation');
        $scope.RemoveSecondScan(itemid, $scope.options.secondstation);
      }else{
        $scope.current.itemchange = !$scope.current.itemchange;
        $scope.to_delete = null;
      }     
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

  $scope.RemoveSecondScan = function(itemid, stn){
    var query = '?' + $scope.station_info.itemid + '=eq.' + itemid + '&station_code=eq.' + stn;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.to_delete = null;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };


  $scope.PatchObjRemoveContainer = function(obj){
    var id = obj.box_number;
    $scope.to_delete = id;
    if (($scope.options.total_by === 'ship' && obj.lot_number !== null) || ($scope.options.total_by === 'lot' && obj.shipping_unit_number !== null)){
      toastr.error('cannot delete - box in further processing');
    }else{
      $scope.overlay('delete');
    }
    
  };

  $scope.HighlightGreen = function(str){
    if(str===0  && $scope.current.addnew === true){
      setTimeout(function () {
          var tr = angular.element(document.querySelector('#item-'+ str));  
          if (tr){
            var c = 'new_item';
            tr.addClass(c);
            $timeout(function(){ tr.removeClass(c); }, 700); 
          }
        }, 0);
    }
    $scope.current.addnew = false;
  };

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
  /*{ 
    limit: "10",
    order: "-timestamp", 
    arg: "codes", 
    fields: ["label", "codes"]
  };

  $scope.dropdownconfig = */
  { id: 0, 
    title: "Search Labels", 
    limit: "5",
    order: "-timestamp", 
    arg: "codes", 
    searchfield: "label", 
    delimeter: '-',
    fields: ["codes"]
  };

  $scope.SetCodes = function(codes){
    console.log(codes);
    $scope.current.codes = codes;
    codes.forEach(
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
      $scope.ShowCodes();
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

  $scope.ShowCodes = function(){
    var query = '?lot_number=eq.' + $scope.current.collectionid;
      var func = function(response){
        if (response.data.length>0){
          $scope.current.codes = response.data[0].codes;
          $scope.current.products = response.data[0].products;
        }
      };
      DatabaseServices.GetEntries('group_codes', func, query);
  };

  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined  && $scope.current.collectionid !== null && $scope.current.collectionid !== 'no selected'){
      $scope.current.codes = null;
      $scope.show_element = '';
      $scope.ShowCodes();
    }
  });

})


;

