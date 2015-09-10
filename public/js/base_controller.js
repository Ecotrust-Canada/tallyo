'use strict';

var BaseCtrl = function($scope, $http, $location) {
  
  

  $scope.CreateEntryPeriod = function(today, period){
    var dates = dateManipulation(today, period);
    $scope.lot_entry.start_date = dates.start_date;
    $scope.lot_entry.end_date = dates.end_date;
  };


  $scope.CreateLot = function(queryString){
    var lot_num;
    $http.get('http://10.10.50.30:3000/lot' + queryString).then(function(response) {
      if (response.data.length < 1){
        lot_num = createLotNum($scope.queryparams.stage_id, $scope.queryparams.date);
        $scope.lot_entry.lot_number = lot_num;
        //$scope.CreateEntryPeriod($scope.queryparams.date, 'week');
        console.log($scope.lot_entry);
        $http.post('http://10.10.50.30:3000/lot', $scope.lot_entry).then(function(response){

        }, function(response){
            alert(response.statusText);
          });//end post lot
      }//end if
      else{
        lot_num = response.data.lot_number;
      }

    }, function(response){
      alert(response.status);
    });//end get lot
    return lot_num;
  };


  $scope.ListSuppliers = function(){
    $http.get('http://10.10.50.30:3000/supplier').then(function(response){
      $scope.suppliers = response.data;
    }, function(response){
      alert(response.status);
    });
  };










  $scope.SetLotInProd = function(){
//set boolean to true
  };

  $scope.DisplayLotsInProd = function(){
//display lots with boolean equal to true
  };

  $scope.SetLotAsCurrent = function(){
//set lot with inputted lot number with boolean is_current true
  };

  $scope.ReadInScale = function(){
//get the information from the scale
  };

  $scope.CreateEntry = function(){
//create an entry based on lot number, data to input, stage_id
  };







};//end of controller
