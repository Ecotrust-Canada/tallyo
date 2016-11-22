'use strict';


angular.module('scanthisApp.packingController', [])


.controller('PackingCtrl', function($scope, $http, DatabaseServices, toastr, $animate, $timeout) {

  $scope.input = {};
  $scope.current.addnew = false;
  $scope.current.select_change = false;
  $scope.current.no_label = false;

  $scope.ListSuppliers = function(){
    var func = function(response){
      $scope.list.lotin = response.data;
    };
    var query = '?lot_in=is.null';
    query += '&order=timestamp.desc';
    DatabaseServices.GetEntries('lot', func, query, 'fifty');
  };
  $scope.ListSuppliers();

  /*put an object in a container if the id matches an object. alerts to overwrite if in another*/
  $scope.PutObjInContainer = function(raw_id){
    var thediv = document.getElementById('scaninput');
          if (thediv){
              thediv.disabled = true;
          }
    if (!raw_id) {
      toastr.error('please scan a code');
      $scope.clearField();
    }
    else{
      var thediv = document.getElementById('scaninput');
          if (thediv){
              thediv.disabled = true;
          }
      var id = raw_id.split("/")[0].toUpperCase();
      $scope.id = id;

      var func = function(response){
        $scope.current.patchitem = response.data[0];//so can check most recent scan against rest to determine if mixing harvesters
        $scope.id = response.data[0][$scope.station_info.itemid];
        var itemcollection = response.data[0][($scope.station_info.patchid || $scope.station_info.collectionid)];
        //if the object is in another collection
        if (itemcollection && itemcollection !== $scope.current.collectionid  && itemcollection.substring(2,5) === $scope.processor){ 
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
      var onErr = function(err) {
        console.log(err);
        $scope.clearField();
        toastr.error('invalid QR code'); // show failure toast.
      };
      var err_func = function(err) {
        console.log(err);
        $scope.clearField();
        toastr.error('Database error'); // show failure toast.
      };
      var query;
      if ($scope.station_info.scanid && $scope.station_info.scanid === 'uuid_from_label' && id.length === 8){
        query = '?uuid_from_label=gt.' + id + '-0000-0000-0000-000000000000&uuid_from_label=lt.' + id + '-ffff-ffff-ffff-ffffffffffff' ;
        DatabaseServices.GetEntry($scope.station_info.patchtable, func, query, onErr, null, err_func);
      }
      else if ($scope.station_info.scanid && $scope.station_info.scanid === 'uuid_from_label' && id.length !== 8 && id.length !== 36){
        $scope.clearField();
        toastr.error('invalid QR code');
      }else{
        query = '?' + ($scope.station_info.scanid || $scope.station_info.itemid) + '=eq.' + id;
        DatabaseServices.GetEntry($scope.station_info.patchtable, func, query, onErr, null, err_func);
      }
    }    
  };

  $scope.CheckGrade = function(box_grade, loin_grade){
    var conv = {
      'AAA': 'AAA',
      'AA': 'AA',
      'A': 'A',
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
    var thediv = document.getElementById('scaninput');
          if (thediv){
            thediv.disabled = false;
            thediv.focus();
          }
  };

  $scope.MakeScan = function(id){
    $scope.entry.scan = {"station_code": $scope.station_code};
    $scope.entry.scan[$scope.station_info.itemid] = id;
    $scope.entry.scan[$scope.station_info.collectionid] = $scope.current.collectionid;
    var func = function(response){
      $scope.clearField();
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };


  $scope.PatchOldScan = function(){

    var func = function(response){
      $scope.PatchObjWithContainer();
    };

    var patch = {pieces: 0};
    var query = '?' + $scope.station_info.itemid + '=eq.' + $scope.id + '&station_code=eq.' + $scope.station_code;   
    DatabaseServices.PatchEntry('scan', patch, query, func);
  };

  /*writes the foreignkey of the object, adds object to list*/
  $scope.PatchObjWithContainer = function(){

    var func = function(response){
      $scope.current.addnew = true;      
      $scope.MakeScan($scope.id);
    };
    var onErr = function(){
      toastr.error('invalid QR code'); // show failure toast.
      $scope.clearField();
    };

    var patch = {};
    patch[($scope.station_info.patchid || $scope.station_info.collectionid)] = $scope.current.collectionid;
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
        else{
          $scope.current.totals.weight = 0;
          $scope.current.totals.pieces = 0;
        }        
      };
      var query = '?lot_number=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntries('lot_summary', func, query);
    }
    else if ($scope.station_info.collectiontable === 'shipping_unit'){
      var func1 = function(response){
        if (response.data.length > 0){
          var data = response.data[0];
          $scope.current.totals.weight = data.total_weight;
          $scope.current.totals.pieces = data.boxes;
        }
        else{
          $scope.current.totals.weight = 0;
          $scope.current.totals.pieces = 0;
        }
      };
      var query1 = '?shipping_unit_number=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntries('ship_with_info', func1, query1);
    }
    // else if ($scope.station_info.collectiontable === 'box'){
    //   $scope.CalcBox();
    // }
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

  $scope.clearField = function(){
    $scope.input.code = null;
    var thediv = document.getElementById('scaninput');
          if (thediv){
            thediv.disabled = false;
            thediv.focus();
          }
  };
  
  $scope.PatchObjRemoveContainer = function(obj){
    $scope.to_delete = obj;
    if ($scope.options.qrform && obj.lot_number !== null){
      toastr.error('cannot delete - box in processing');
      $scope.clearField();
    }
    else if ($scope.options.qrform && obj.shipping_unit_number !== null){
      toastr.error('cannot delete - box shipped');
      $scope.clearField();
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


.controller('SearchBoxCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.hide_search = true;

  $scope.search = {};

  $scope.ListFilteredItems = function(case_number, int_lot_code, harvester_code){
    var query = '?box_number=not.is.null';
    if (int_lot_code !== undefined && int_lot_code !== null && int_lot_code !== ''){
      query += '&internal_lot_code=like.*' + int_lot_code + '*';
    }
    if (harvester_code !== undefined && harvester_code !== null && harvester_code !== ''){
      query += '&harvester_code=like.*' + harvester_code + '*';
    }
    if (case_number !== undefined && case_number !== null && case_number !== ''){
      query += '&case_number=like.*' + case_number + '*';
    }
    query += '&order=timestamp.desc';
    var func = function(response){
      $scope.boxes = response.data;
      $scope.search = {};
    };
    DatabaseServices.GetEntries('box_search', func, query);
  };

  $scope.EditBox = function(obj){
    $scope.current.collectionid = obj.box_number;
  };

  $scope.ListHarvesters = function(){
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '?processor_code=eq.' + $scope.processor + '&active=eq.true';
    DatabaseServices.GetEntries('harvester', func, query);
  };
  $scope.ListHarvesters();

  $scope.changeVal = function(value){
    $scope.search.harvester_code = value.harvester_code;
  };

})


.controller('InternalAddCtrl', function($scope, $http, DatabaseServices) {

  $scope.formchange1 = true;

  $scope.PatchPDC = function(pdc, box_number){
    var func = function(response){
      $scope.PutObjInContainer(response.data[0].box_number);
    };
    var patch = {'pdc_text': pdc};
    var query = '?box_number=eq.' + box_number;
    DatabaseServices.PatchEntry('box', patch, query, func);

  };

  $scope.CheckBoxExists = function(form){
    if (form){
      var query = '?station_code=eq.'+ $scope.options.unlabelled_from + '&lot_in=eq.' + $scope.current.lot.lot_in + '&size=eq.' + form.size.toUpperCase() + '&weight=eq.' + form.weight + '&grade=eq.' + form.grade.toUpperCase() + '&species=eq.' + form.species.toUpperCase();
      var func = function(response){
        if (response.data.length > 0){
          $scope.PatchPDC(form.pdc_text, response.data[0].box_number);
        }
        else{
          console.log('new');
          var entry = {};
          entry.pdc_text = form.pdc_text;
          entry.grade = form.grade; 
          entry.species = form.species; 
          entry.size = form.size;
          entry.weight = form.weight;
          entry.supplier_code = $scope.current.lot.supplier_code;
          entry.lot_number = $scope.current.collectionid;
          $scope.MakeBox(entry);
        }
      };
      DatabaseServices.GetEntries('inventory_all', func, query);
    }    
  };

  $scope.MakeBox = function(entry){
    var func = function(response){
      $scope.MakeScan(response.data[0].box_number);
    };
    DatabaseServices.DatabaseEntryCreateCode('box', entry, $scope.processor, func);
  };

  $scope.MakeScan = function(id){
    var entry = {};
    entry.box_number = id;
    entry.station_code = $scope.station_code;
    entry.lot_number = $scope.current.collectionid;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.formchange1 = !$scope.formchange1;
      $scope.current.addnew = true;  
    };
    DatabaseServices.DatabaseEntryCreateCode('scan', entry, $scope.processor, func);
  };


})


.controller('CalculateBoxCtrl', function($scope, $http, DatabaseServices) {
  $scope.CalcBox = function(){
        var case_num;
        if(!$scope.current.box.case_number){
          $http.get('/increment').then(function successCallback(response) {
            case_num = ($scope.options.case_label || 'Z' ) + padz(String(parseInt(response.data)),5);

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
              if ($scope.current.collectionid) {
                  $scope.PatchBoxNull(box_weight, lot_num, num, harvester_code, internal_lot_code, best_before, case_num);
              }
            }


          }, function errorCallback(response) {
          });
        }else{
          case_num = $scope.current.box.case_number;

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
            if ($scope.current.collectionid) {
                $scope.PatchBoxNull(box_weight, lot_num, num, harvester_code, internal_lot_code, best_before, case_num);
            }
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


  $scope.PatchBoxNull = function(box_weight, lot_num, num, harvester_code, internal_lot_code, best_before, case_num){

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
    var patch = {'weight': box_weight, 'pieces': num, 'best_before_date': best_before, 'internal_lot_code': internal_lot_code, 'harvester_code': harvester_code, 'lot_number': lot_num, 'case_number':case_num};
    var query = '?box_number=eq.' + $scope.current.collectionid;
    DatabaseServices.PatchEntry('box', patch, query, func);
    
  };

    /*adds final info to box*/
  $scope.PatchBoxWithWeightLot = function(box_har, lot_num, case_num){
    var internal_lot_code = box_har.internal_lot_code ? 
                              cutString(box_har.internal_lot_code, 4, 5).substring(0, 8) : null;
    var box_weight = CalculateBoxWeight($scope.list.included);
    var num = $scope.list.included.length;
    var ts = String(box_har.timestamp);
    var offset = ts.substring(ts.length-6);
    var best_before = moment(box_har.timestamp).add(2, 'years').utcOffset(offset).format();

    var func = function(response){
      $scope.current.box = response.data[0];
        $scope.current.box.tf_code = box_har.tf_code;
        $scope.current.box.ft_fa_code = box_har.ft_fa_code;
        $scope.current.box.fleet = box_har.fleet;
        $scope.current.box.harvest_date = moment(box_har.timestamp).format();
        $scope.current.box.prod_date = moment(box_har.timestamp).utcOffset(offset).format('YYYY-MM-DD');
        $scope.current.box.supplier_group = box_har.supplier_group;
        $scope.current.box.wpp = box_har.fishing_area;
        $scope.current.totals.weight = $scope.current.box.weight;
        $scope.current.totals.pieces = $scope.current.box.pieces;
    };
    var patch = {'weight': box_weight, 'pieces': num, 'best_before_date': best_before, 'internal_lot_code': internal_lot_code, 'harvester_code': box_har.harvester_code, 'lot_number': lot_num, 'case_number':case_num};
    var query = '?box_number=eq.' + $scope.current.collectionid;
    DatabaseServices.PatchEntry('box', patch, query, func);
  }; 

  $scope.$watch('list.included', function() {
    if ($scope.list.included && $scope.list.included.length === 0 && $scope.station_info.collectiontable === 'box'){
      $scope.current.totals.weight = 0;
      $scope.current.totals.pieces = 0;
    }
    if ($scope.list.included !== undefined && $scope.list.included !== null){
      $scope.CalcBox();
    }
  });

})


;

