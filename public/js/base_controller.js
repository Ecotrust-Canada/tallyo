'use strict';

var BaseCtrl = function($scope, $http, $location, $anchorScroll) {
  
  
  /*
   *
   * Create a lot if does not exist, set as current, display
   *
   */

  /*function to create a new lot*/
  $scope.NewLot = function(callback){
    $scope.lot_entry.lot_number = $scope.currentlot;        
    $scope.CreateEntryPeriod($scope.queryparams.date, 'week');
    $http.post('http://10.10.50.30:3000/lot', $scope.lot_entry).then(function(response){
    }, function(response){
        alert(response.statusText);
      }); //end post lot
    callback(null, null);
  };

   /*checks if there is an existing lot matching query, if not creates new one (calls newlot)*/
  $scope.CreateLot = function(queryString, callback){
    $http.get('http://10.10.50.30:3000/lot' + queryString).then(function(response) {
      if (response.data.length > 0){
        $scope.currentlot = response.data[0].lot_number;
        callback(null, null);
      }//end if
      else{
        $scope.currentlot = createLotNum($scope.queryparams.stage_id, $scope.queryparams.date);
        $scope.NewLot(callback);        
      }
    }, function(response){
      alert(response.status);
    });//end get lot
  };

  /*set is_current to true for lot number*/
  $scope.SetLotAsCurrent = function(lot_number, callback){
    $http.patch('http://10.10.50.30:3000/lot?stage_id=eq.' + $scope.stage_id, {'is_current': false}).then(function(response){
      $http.patch('http://10.10.50.30:3000/lot?stage_id=eq.' + $scope.stage_id + '&lot_number=eq.' + lot_number, {'is_current': true}).then(function(response){
        callback(null, null);
      }, function(response){
        alert(response.status);
      });      
    }, function(response){
      alert(response.status);
    });
  };

  /*helpers*/

  /*creates start and end dates based on current timestamp and period */
  $scope.CreateEntryPeriod = function(today, period){
    var dates = dateManipulation(today, period);
    $scope.lot_entry.start_date = dates.start_date;
    $scope.lot_entry.end_date = dates.end_date;
  };

  /*
   *
   *HTML manipulation
   *
   */

  /*switch between scanning and view summary*/
  $scope.show = function(){
    if ($scope.showSummary === false){
      $scope.showSummary = true;
      $scope.showScan = false;
      $scope.view_summary = "Back to scan";
    }
    else {
      $scope.showSummary = false;
      $scope.showScan = true;
      $scope.view_summary = "view summary";
    }
  };


  /*
   *
   * Create an entry
   *
   */
  /*this is the 'callback function'*/
  $scope.updateFunction = function(arg){
  };

  /*finds lot with is_current set to true*/
  $scope.GetCurrentLotNumber = function(callback){
    $http.get('http://10.10.50.30:3000/lot?stage_id=eq.' + $scope.stage_id + '&is_current=eq.true').then(function(response){
      if (response.data.length > 0){
        $scope.current_lot_number = response.data[0].lot_number;
      }
      else{
      }
      callback(null,null);
    }, function(response){
      alert(response.status);
    });
  };

  /*function for submit button*/
  $scope.submit = function(clickEvent){
    $scope.CreateEntry();
  };

  /*fill in entry fields*/
  $scope.update = function(form){
    $scope.entry.lot_number = $scope.current_lot_number;
    $scope.entry.timestamp = moment(new Date()).format();
    for (var key in form){
        $scope.entry[key] = form[key];
    }
  };

  /*make an entry*/
  $scope.CreateEntry = function(){
    if (NoMissingValues($scope.entry)){
      $http.post('http://10.10.50.30:3000/entry', $scope.entry).then(function(response){
        $scope.ClearEntry();
        $scope.GetAllbyLotNumber($scope.current_lot_number, $scope.station_id);
      }, function(response){
        alert(response.status);
      });
    }
    else{
      alert("missing values");
    }
  };

  /*helpers*/

  $scope.ClearEntry = function(){
    $scope.form = null;
    for (var key in $scope.entry){
      if (key !== 'station_id' && key !== 'stage_id'){
        $scope.entry[key] = "";
      }
    }
  };
  
  /*
   *
   * Displaying tables
   *
   */  

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
      $scope.listlots = response.data;
    }, function(response){
      alert(response.status);
    });
  };

  /*get the entries for a given lot number and station_id*/
  $scope.GetAllbyLotNumber = function(lot_number, station_id){
    $http.get('http://10.10.50.30:3000/entry?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id).then(function(response){
      $scope.lots = response.data;
    }, function(response){
      alert(response.status);
    });
  };

  /*
   *
   * Admin
   *
   */
   /*gets lot_number and supplier info which is_current*/
   $scope.AdminGetCurrentLotNumber = function(){
    $http.get('http://10.10.50.30:3000/lot_supplier?stage_id=eq.' + $scope.stage_id + '&is_current=eq.true').then(function(response){
      if (response.data.length > 0 ){
        $scope.selected = response.data[0];
      }
    }, function(response){
      alert(response.status);
    });
  };


};//end of controller
