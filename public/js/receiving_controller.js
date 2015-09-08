var ReceivingCtrl = function($scope, $http, $location) {
  
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



};//end of controller
