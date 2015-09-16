'use strict';

var BaseCtrl = function($scope, $http, $location) {
  
  
  /*
   *
   * Create a lot if does not exist, set as current
   *
   */

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
        $scope.AdminGetCurrentLotNumber();
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


  /*clicking and selecting*/

  /*for selecting on a table*/
  $scope.setSelected = function(id) {
    $scope.selected_id = id;
  };

  $scope.MarkComplete = function(lot_number){
    var patch = {'in_production': false};
    $http.patch('http://10.10.50.30:3000/lot?lot_number=eq.' + lot_number, patch).then(function(response){
    }, function(response){
    });
  };

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

  $scope.GetCurrentLotNumber = function(callback){
    $http.get('http://10.10.50.30:3000/lot?stage_id=eq.' + $scope.stage_id + '&is_current=eq.true').then(function(response){
      var date  = moment(new Date()).format();
      //check that there is a lot selected for the current date
      if (response.data.length > 0 && DateRangeCurrent(date, response.data[0].start_date, response.data[0].end_date)){
        $scope.current_lot_number = response.data[0].lot_number;
        $scope.entry.lot_number = $scope.current_lot_number;
        $scope.GetOriginalLotNumber($scope.current_lot_number);
        $scope.GetAllbyLotNumber($scope.current_lot_number, $scope.station_id);
        $scope.update = function(fish){
          $scope.entry.timestamp = moment(new Date()).format();
          callback(fish);
        };
        $scope.submit = function(clickEvent){
          $scope.CreateEntry($scope.current_lot_number);
        };
      }
      else{
        alert("no lot selected");
      }
    }, function(response){
      alert(response.status);
    });
  };

  $scope.CreateEntry = function(lot_number){
    var date = moment(new Date()).format();
    $scope.entry.timestamp = date;
    $scope.entry.lot_number = lot_number;
    console.log($scope.entry);
    if (NoMissingValues($scope.entry)){
      $http.post('http://10.10.50.30:3000/entry', $scope.entry).then(function(response){
        $scope.ClearEntry();
        $scope.GetAllbyLotNumber(lot_number, $scope.station_id);
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
    $scope.fish = null;
    var columns = ['weight_1', 'weight_2', 'timestamp', 'grade'];
    for (var i = 0;i<columns.length;i++){
      if ($scope.entry[columns[i]]){
        $scope.entry[columns[i]] = '';
      }
    }
  };


  $scope.GetOriginalLotNumber = function(lot_number){
    $http.get('http://10.10.50.30:3000/lot?lot_number=eq.' + lot_number).then(function(response){
      if (response.data[0].previous_lot_number){
        $scope.GetOriginalLotNumber(response.data[0].previous_lot_number);
      }
      else{
        $scope.original_lot_number = response.data[0].lot_number;
        //TODO: add callback here
      }
    },function(response){

    });
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
    $http.get('http://10.10.50.30:3000/lot?stage_id=eq.' + stage_id + '&in_production=eq.true').then(function(response){
      $scope.lots = response.data;
    }, function(response){
      alert(response.status);
    });
  };

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

   //todo: this should be a view to get name rather than supplier id
   $scope.AdminGetCurrentLotNumber = function(){
    $http.get('http://10.10.50.30:3000/lot?stage_id=eq.' + $scope.stage_id + '&is_current=eq.true').then(function(response){
      var date  = moment(new Date()).format();
      //check that there is a lot selected for the current date
      if (response.data.length > 0 && DateRangeCurrent(date, response.data[0].start_date, response.data[0].end_date)){
        $scope.selected = response.data[0];
      }
      else{
      }
    }, function(response){
      alert(response.status);
    });
  };

  

};//end of controller
