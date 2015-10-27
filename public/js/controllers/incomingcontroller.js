'use strict';


angular.module('scanthisApp.incomingController', [])

.controller('IncomingCtrl', function($scope, $http, DatabaseServices) {



  /*reads in item and lot info from QR - grade, weight, size?*/
  //how to decode string with several pieces of information?
  $scope.ReadScan = function(inString){
    var form = {};
    form.grade = inString.substring(0, 1);
    form.weight_1 = parseFloat(inString.substring(1, 6));
    var supplier_id = parseInt(inString.substring(7,9));
    var lot_number = inString.substring(9);
    $scope.GetLot(lot_number, supplier_id, form);
    //size
    //start_date
    //end_date
    //??
    
  };



  $scope.ReadBox = function(lot_number, form){
    var query = '?lot_number=eq.' + lot_number;
    var func = function(response){
      if (response.data.length >0){
        $scope.count.loin = response.data[0].max_loin + 1;
        $scope.DatabaseItem(form);
      }
      else {
        $scope.count.loin = 1;
        $scope.DatabaseItem(form);
      }
    };
    DatabaseServices.GetEntries('loin', func, query);
  };



  /*takes lot number as input, creates new lot entry if doesn't exist*/
  $scope.GetLot = function(lot_number, supplier_id, form){
    var query = '?lot_number=eq.' + lot_number;
    var func = function(response){
      if (response.data.length >0){
        $scope.current.lot = lot_number;
        $scope.ReadBox(lot_number, form);
      }
      else{
        $scope.CreateLot(lot_number, supplier_id, form);
      }
    };

    DatabaseServices.GetEntries('lot', func, query);
  };

  /*makes lot*/
  $scope.CreateLot = function(lot_number, harvester_id, form){
    var entry = {'lot_number': lot_number, 'stage_id': $scope.stage_id, 'harvester_id': harvester_id};
    //receive_date?
    var func = function(response){
      $scope.current.lot = lot_number;
      $scope.ReadBox(lot_number, form);
    };
    DatabaseServices.DatabaseEntryReturn('lot', entry, func);


  };




});
