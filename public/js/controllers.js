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
    $http.get('http://10.10.50.30:3000/supplier?id=eq.' + current).then(function(response) {
      $scope.sup = response.data[0];
    }, function(response) {
      alert(response.status)
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

    /*get local variables from $scope*/
    var weight = $scope.weight;
    var grade = $scope.grade;
    var date = $scope.datereceived;
    var sup_id = $scope.sup.id;
    
    /*initialize lot_num*/
    var lot_num;
    
    /*get week from current timestamp*/
    var dates = dateManipulation(date);
    
    /*see if there is an existing receiving_lot matching date and supplier id*/
    $http.get('http://10.10.50.30:3000/receiving_lots?id_supplier=eq.' + sup_id + '&start_date=lt.' + dates.postgres_date + '&end_date=gt.' + dates.postgres_date).then(function(response) {
      
      if (response.data.length < 1){/*if no, create a new lot_number and receiving_lot entry*/
        lot_num = createLotNum(date, sup_id);
        var toSubmit = {'lot_number': lot_num, 'id_supplier': sup_id, 'in_prod': 'false', 'start_date': dates.start_date, 'end_date': dates.end_date}
        $http.post('http://10.10.50.30:3000/receiving_lots', toSubmit).then(function(response){}, 
        function(response){
          alert(response.status);
        });
      }      
      else{/*if yes, get the lot_number*/
        lot_num = response.data[0].lot_number
      }

      /*create a receiving entry*/
      var receiving_submit = {'weight': weight,'timestamp': dates.postgres_date,'grade': grade, 'lot_number_receiving_lots': lot_num};
      $http.post('http://10.10.50.30:3000/receiving', receiving_submit).then(function(response){}, 
        function(response){
          alert(response.status);
        });

    }, function(response){
      alert(response.status)
    });

    /*clear data for completed entry */
    clear();
  };//end of clickEvent



});//end of controller


scanthisControllers.controller('InProductionCtrl', function($scope, $http) {
  $http.get('http://10.10.50.30:3000/all_receiving').then(function(response) {
    var array = response.data;
    for (var i=0;i<array.length;i++){
      array[i].start_date = new Date(array[i].start_date);
      array[i].end_date = new Date(array[i].end_date);
    }
    $scope.receiving = array;
  }, function(response){
    alert(response.status);
  });

  $scope.processToday = function(lot_num) {
    var change = {'in_prod': 'true'};
    $http.patch('http://10.10.50.30:3000/receiving_lots?lot_number=eq.' + lot_num, change).then(function(response){}, 
        function(response){
          alert(response.status);
        });
  };
  /*TODO: add code so can not keep clicking same in one day, visually show if in production*/
  /*if true - 'in processing' if false - 'process today'*/
  /*TODO: add code so can not keep clicking same in one day*/

});

scanthisControllers.controller('SupplierEditCtrl', function($scope, $http) {
  $http.get('http://10.10.50.30:3000/supplier').then(function(response){
      $scope.suppliers = response.data;
  }, function(response){
    alert(response.status);
  });


});


scanthisControllers.controller('SelectLotCtrl', function($scope, $http) {

  var grade = "A";
  var weight = 0.00;
  $scope.scale = weight.toFixed(2);

  $scope.PlaceOnScale = function(clickEvent) {
    $scope.scale = 14.03
  };

  $scope.Weigh = function(clickEvent) {
    $scope.weight = $scope.scale
    $scope.datereceived = new Date();
  };

  $scope.SelectGrade = function(clickEvent) {
    $scope.grade = grade
  };



  $http.get('http://10.10.50.30:3000/all_receiving?in_prod=eq.true').then(function(response) {
    var array = response.data;
    for (var i=0;i<array.length;i++){
      array[i].start_date = new Date(array[i].start_date);
      array[i].end_date = new Date(array[i].end_date);
    }
    $scope.lots = array;
    $scope.selected_lot = array[0].lot_num;
  }, function(response){
    alert(response.status);
  });
  $scope.setSelected = function(lot_num) {
    $scope.selected_lot = lot_num;
  };


  $scope.CreateLabel = function(clickEvent) {

    /*get local variables from $scope*/
    var weight = $scope.weight;
    var grade = $scope.grade;
    var date = $scope.datereceived;
    var receive_lot = $scope.selected_lot;
    var prod_id = 1;
    
    /*initialize lot_num*/
    var lot_num;
    
    /*get week from current timestamp*/
    var dates = dateManipulation(date);
    
    /*see if there is an existing process_lot matching date and  product id and receiving lot*/
    $http.get('http://10.10.50.30:3000/process_lot?lot_number_receiving_lots=eq.' + receive_lot + '&id_product=eq.' + prod_id + '&start_date=lt.' + dates.postgres_date + '&end_date=gt.' + dates.postgres_date).then(function(response) {
      
      if (response.data.length < 1){/*if no, create a new lot_number and receiving_lot entry*/
        lot_num=CreateProductionLotNumber(prod_id, receive_lot, date);
        console.log(lot_num);
        var toSubmit = {'lot_number': lot_num, 'id_product': prod_id, 'lot_number_receiving_lots': receive_lot, 'start_date': dates.start_date, 'end_date': dates.end_date}
        $http.post('http://10.10.50.30:3000/process_lot', toSubmit).then(function(response){}, 
        function(response){
          alert(response.status);
        });
      }      
      else{/*if yes, get the lot_number*/
        lot_num = response.data[0].lot_number
      }

      /*create a processing entry*/
      var processing_submit = {'weight': weight,'timestamp': dates.postgres_date,'grade': grade, 'lot_number_process_lot': lot_num};
      $http.post('http://10.10.50.30:3000/processing', processing_submit).then(function(response){}, 
        function(response){
          alert(response.status);
        });

    }, function(response){
      alert(response.status)
    });

  };//end of clickEvent




});





