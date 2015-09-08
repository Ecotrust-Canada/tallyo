var SelectLotCtrl = function($scope, $http) {

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




};
