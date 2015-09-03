'use strict';

/* Controllers */

var scanthisControllers = angular.module('scanthisControllers', []);

scanthisControllers.filter('processToString', function() {
  return function(input) {
    console.log(input);
    if (String(input) === 'true'){
      return 'In Processing';
    }
    else if (String(input) === 'false'){
      return  'Process Today';
    }
    else {
      return 'wrong equals';
    }
    //return input;
  };
})

scanthisControllers.controller('ReceivingCtrl', function($scope, $http) {
  
  /*initialize some values  - later read in from scans*/
  var grade = "A";
  var clean = "clean";
  var weight = 0.00;
  $scope.scale = weight.toFixed(2);


  /*Scan Box - for now iterate through suppliers */
  var scanboxcounter = 0;
  var iterator = ['1', '2', '3']
  $scope.ScanIncoming = function(clickEvent) {
    var current = iterator[scanboxcounter % iterator.length];
    $http.get('http://10.10.50.30:3000/supplier?id=eq.' + current).success(function(data) {
      $scope.sup = data[0];
    });
    scanboxcounter++;
  };


  $scope.PlaceOnScale = function(clickEvent) {
    $scope.scale = 14.03
  };
  $scope.ScanDirtyClean = function(clickEvent) {
    $scope.clean = clean;
  };
  $scope.ScanGrade = function(clickEvent) {
    $scope.weight = $scope.scale;
    $scope.grade = grade;
    $scope.datereceived = new Date();
  };

  
  
  var clear = function(){
    $scope.grade="";
    $scope.datereceived="";
    $scope.clean="";
    $scope.weight="";
  }
  $scope.Redo = function(clickEvent) {
    clear();
  };


  $scope.Confirm = function(clickEvent) {

    /* if there is not yet a receiving lot matching date and supplier, create one */
    var date = $scope.datereceived;
    var date_p = moment(date.valueOf()).format();
    var start_date = moment(date.valueOf()).startOf('isoWeek');
    var end_date = moment(date.valueOf()).endOf('isoWeek');
    var datestring = moment(date.valueOf()).format('DDMMYYYY');
    var sup_id = $scope.sup.id;
    var lot_num = (String(sup_id)).concat(datestring);
    $http.get('http://10.10.50.30:3000/receiving_lots?id_supplier=eq.' + sup_id + '&start_date=lt.' + date_p + '&end_date=gt.' + date_p).success(function(data) {
      if (data.length < 1){
        var toSubmit = {'lot_number': lot_num, 'id_supplier': sup_id, 'in_prod': 'false', 'start_date': start_date, 'end_date': end_date}
        $http.post('http://10.10.50.30:3000/receiving_lots', toSubmit);
      }
    });

    /* create receiving entry */
    var receiving_submit = {'weight': $scope.weight,'timestamp': date_p,'grade': $scope.grade, 'lot_number_receiving_lots': lot_num};
    $http.post('http://10.10.50.30:3000/receiving', receiving_submit);

    /*clear data for completed entry */
    clear();
  };//end of clickEvent



});//end of controller


scanthisControllers.controller('InProductionCtrl', function($scope, $http) {
  $http.get('http://10.10.50.30:3000/all_receiving').success(function(data) {
    var array = data;
    for (var i=0;i<array.length;i++){
      array[i].start_date = new Date(array[i].start_date);
      array[i].end_date = new Date(array[i].end_date);
    }
    $scope.receiving = array;
  });

  $scope.processToday = function(lot_num) {
    var change = {'in_prod': 'true'};
    $http.patch('http://10.10.50.30:3000/receiving_lots?lot_number=eq.' + lot_num, change)
  };
  /*TODO: add code so can not keep clicking same in one day, visually show if in production*/
  /*if true - 'in processing' if false - 'process today'*/
  /*TODO: add code so can not keep clicking same in one day*/

});


scanthisControllers.controller('SelectLotCtrl', function($scope, $http) {
  $scope.scale="00.00kg"
  $scope.PlaceOnScale = function(clickEvent) {
    $scope.scale="14.85kg"
  };

  $http.get('json/harsamlots.json').success(function(data) {
    $scope.lots = data;
  });

});


