'use strict';

var BaseCtrl = function($scope, $http, $location) {
  
  
  /*creates start and end dates based on current timestamp and period */
  $scope.CreateEntryPeriod = function(today, period){
    var dates = dateManipulation(today, period);
    $scope.lot_entry.start_date = dates.start_date;
    $scope.lot_entry.end_date = dates.end_date;
  };


  /*checks if there is an existing lot matching query, if not creates new one, callback function on lot number*/
  $scope.CreateLot = function(queryString, callBack){
    $http.get('http://10.10.50.30:3000/lot' + queryString).then(function(response) {
      if (response.data.length < 1){
        $scope.lot_entry.lot_number = createLotNum($scope.queryparams.stage_id, $scope.queryparams.date);
        $scope.CreateEntryPeriod($scope.queryparams.date, 'week');
        $http.post('http://10.10.50.30:3000/lot', $scope.lot_entry).then(function(response){
          callBack($scope.lot_entry.lot_number);
        }, function(response){
            alert(response.statusText);
          }); //end post lot
      }//end if
      else{
        callBack(response.data[0].lot_number);
      }

    }, function(response){
      alert(response.status);
    });//end get lot
  };

  /*set is_current to true for lot number*/
  $scope.SetLotAsCurrent = function(lot_number){
    $http.patch('http://10.10.50.30:3000/lot?stage_id=eq.' + $scope.stage_id, {'is_current': false}).then(function(response){
    }, function(response){
      alert(response.status);
    });
    $http.patch('http://10.10.50.30:3000/lot?stage_id=eq.' + $scope.stage_id + '&lot_number=eq.' + lot_number, {'is_current': true}).then(function(response){
    }, function(response){
      alert(response.status);
    });
  };

  /*gets all suppliers in table*/
  $scope.ListSuppliers = function(){
    $http.get('http://10.10.50.30:3000/supplier').then(function(response){
      $scope.suppliers = response.data;
    }, function(response){
      alert(response.status);
    });
  };

  /*gets lots from given stage*/
  $scope.ListLots = function(stage_id){
    $http.get('http://10.10.50.30:3000/lot?stage_id=eq.' + stage_id).then(function(response){
      $scope.lots = response.data;
    }, function(response){
      alert(response.status);
    });
  };

  /*for selecting on a table*/
  $scope.setSelected = function(id) {
    $scope.selected_id = id;
  };



  $scope.ReadInScale = function(weight, column){
    //weight would be read from scale
    $scope.entry[column] = weight;
  };


  $scope.GetCurrentLotNumber = function(callBack){
    $http.get('http://10.10.50.30:3000/lot?stage_id=eq.' + $scope.stage_id + '&is_current=eq.true').then(function(response){
      $scope.current_lot_number = response.data[0].lot_number;
      callBack(response.data[0].lot_number);
    }, function(response){
      alert(response.status);
    });
  };

  $scope.CreateEntry = function(lot_number){
    var date = moment(new Date()).format();
    $scope.entry.timestamp = date;
    $scope.entry.lot_number = lot_number;
    console.log($scope.entry);
    $http.post('http://10.10.50.30:3000/entry', $scope.entry).then(function(response){
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








};//end of controller
