'use strict';

angular.module('scanthisApp.formController', [])

//controller attached to entryform directive
.controller('entryformCtrl', function($scope, $http, DatabaseServices, toastr) {
  
  //display scale buttons
  if ($scope.config.startpolling){
    $scope.pollScale = true;
  }

  //booleans for show/hide edit dropdown
  $scope.editdrop = {};
  if (!$scope.form){
    $scope.form = {};
  }

  //default show or hide form
  $scope.hideform = false;
  if ($scope.config.hide){
    $scope.hideform = true;
  }

  //all the fields in the form
  $scope.formarray = JSON.parse(JSON.stringify($scope.config.fields));

  //clear fields to default
  $scope.Clear = function(){
    $scope.submitted=false;
    $scope.formarray = JSON.parse(JSON.stringify($scope.config.fields));
    $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
    if ($scope.config.startpolling) {
      clearObj($scope.scale);
      if ($scope.pollscale === true){
        $scope.pollFn({field: $scope.config.startpolling});
      }
      else{
        var scales = $scope.formarray.filter(function(el){
          return (el.scale);
        });
        scales.forEach(function(el){
          el.scale = 'off';
        });
      }     
    }
  };

  //watch outside variable to know when to clear form
  $scope.$watch('formchange', function(newValue, oldValue) {
    if ($scope.formchange !== undefined){
      $scope.Clear();
    }
  });


  //hide the form once it's submitted
  $scope.hidefn = function(){
    if ($scope.config.hide){
      $scope.hideform = true;
    }
  };

  //stores scale value, starts polling next field
  $scope.store = function(row){
    $scope.form[row.fieldname] = $scope.scale[row.fieldname];
    row.scale = "lock";
    var index = arrayObjectIndexOf($scope.formarray, row.pollarg, 'fieldname');
    if (index !== -1){
      var nextrow = $scope.formarray[index];
      nextrow.scale = 'on';
    }
  };

  //called when scale field on focus
  $scope.weigh = function(row){
    var scales = $scope.formarray.filter(function(el){
      return el.scale === 'on';
    });
    scales.forEach(function(el){
      el.scale = 'lock';
    });
    row.scale = 'on';
  };

  //turn the scale on or off
  $scope.scalefn = function(){
    clearObj($scope.scale);
    if ($scope.pollScale === true){
      var scales = $scope.formarray.filter(function(el){
        return (el.scale);
      });
      scales.forEach(function(el){
        el.scale = 'off';
      });
    }
    else{
      $scope.formarray = JSON.parse(JSON.stringify($scope.config.fields));
      $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
    }
    
    $scope.pollScale = !$scope.pollScale;
  };

  $scope.submitted=false;

  $scope.isValid = function(form){
    $scope.submitted = true;
    var form_error = false;
    for (var i=0;i<$scope.formarray.length;i++){
      var row = $scope.formarray[i];
      var req_error = $scope.theform[row.fieldname].$error.required;
      var neg_error = $scope.theform[row.fieldname].$error.negative;
      if (req_error === true || neg_error === true){
        form_error = true;
        
      }
    }
    if (form_error === true){
      toastr.error('errors in form');
      form = null;
    }
    if (form){
      if ($scope.config.hide){
        $scope.hideform = true;
      }
    }
    if ($scope.config.hidden){
      $scope.config.hidden.forEach(function(entry){
        form[entry.fieldname] = entry.val;
      });
    }
    

    return form;

  };


  //functions for editing dropdown choices
  $scope.FormData = function(table){
    var func = function(response){
      $scope.formoptions = response.data; 
    };
    var query = '?table_name=eq.' + table;
    DatabaseServices.GetEntryNoAlert('formoptions', func, query);
    };

  $scope.Delete = function(value, field){
    var query='?table_name=eq.' + $scope.config.dboptions + '&value=eq.' + value + '&field_name=eq.' + field;
    var func = function(response){
      $scope.FormData($scope.config.dboptions);
    };
    DatabaseServices.RemoveEntry('formoptions', query, func);
  };

  $scope.New = function(value, field){
    if (value){
      var entry ={"table_name": $scope.config.dboptions, "value": value, "field_name": field};
      var func = function(response){
        $scope.FormData($scope.config.dboptions);
      };
      DatabaseServices.DatabaseEntry('formoptions', entry, func);
    }    
  };

  if ($scope.config.dboptions){
    $scope.FormData($scope.config.dboptions);
  }

})

//default controller with submit form functions
.controller('FormSubmitCtrl', function($scope, $http, DatabaseServices, toastr) {
  //$scope.form = {};
  var table;
  if($scope.formtable){
    table = $scope.formtable;
  }else{
    table = $scope.station_info.collectiontable;
  }
  
  $scope.entry[table] = {};
  $scope.formchange = true;

  //response functions
  var AddtoList = function(thedata){
    $scope.list[table].push(thedata);
  };
  var AddSetCurrent = function(thedata){
    $scope.list.collection.push(thedata);
    $scope.current.collectionid = thedata[$scope.station_info.collectionid];
  };

  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      responsefunction((response.data[0] ? response.data[0] : response.data));
    };
    DatabaseServices.DatabaseEntryCreateCode(table, $scope.entry[table], $scope.processor, func); 
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    var date = moment(new Date()).format();    
    if ($scope.station_info.collectiontable === 'box'){
      $scope.entry[table].station_code = $scope.station_code;
      $scope.entry[table].best_before_date = moment(new Date()).add(2, 'years').format();
    }
    if ($scope.station_info.collectiontable === 'shipping_unit'){
      $scope.entry[table].station_code = $scope.station_code;
    }
    if ($scope.station_info.collectiontable === 'lot'){
      CreateLotEntryPeriod(date, 'day', $scope);
      $scope.entry[table].station_code = $scope.station_code;
      $scope.entry[table].processor_code = $scope.processor;
    }
    if ($scope.options && $scope.options.receivelot){
      $scope.entry.harvester.processor_code = $scope.processor;
      $scope.entry.harvester.active = true;
    }
    MakeEntry(form, table, $scope);
    $scope.ToDatabase(responsefunction);
  };

  //The different submit buttons
  $scope.SubmitAddtoList = function(form){
    if(form){
      $scope.Submit(form, AddtoList);
    }
  };

  $scope.SubmitAddSetCurrent = function(form){
    if(form){
      $scope.Submit(form, AddSetCurrent);
    }
  };

})

//controller attached to list and expandedlist - ?mostly for csv?
.controller('ListCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.getArray = function(){
    return copyArrayPart($scope.itemlist, $scope.config.fields);
  };
  $scope.getHeader = function(){
    return $scope.config.headers;
  };

})


//when forms contain a dropdown with options from a given table
.controller('AddtoTableCtrl', function($scope, $http, DatabaseServices, toastr) {
  var table = $scope.tableinform;

  //$scope.form = {};
  $scope.entry[table] = {};
  $scope.formchange = true;

  var AddtoList = function(response){
    var thedata = response.data;
    if ($scope.list[table] !== undefined){
      $scope.list[table].push(thedata);
      toastr.success("added");
    }    
  };

  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      responsefunction(response);
    };
    DatabaseServices.DatabaseEntryReturn(table, $scope.entry[table], func);
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    if (table === 'product'){
      $scope.entry.product.product_code = (form.sap_item_code ? form.sap_item_code : createProdCode(new Date()));
      MakeEntry(form, 'product', $scope);
      $scope.entry.product.best_before = (form.best_before ? moment.duration(form.best_before, 'years') : moment.duration(1, 'years'));
    }
    else{
      MakeEntry(form, table, $scope);
    }
    $scope.ToDatabase(responsefunction);
  };

  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, AddtoList);
  };

})

//for adding more fieldsets
.controller('FieldsetCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.choices = [{id: 'choice1'}];
  $scope.submitted=false;
  
  $scope.addNewChoice = function() {
    var newItemNo = $scope.choices.length+1;
    $scope.choices.push({'id':'choice'+newItemNo});
  };
    
  $scope.removeChoice = function() {
    var lastItem = $scope.choices.length-1;
    $scope.choices.splice(lastItem);
  };

  $scope.isValid = function(choices){
    $scope.submitted = true;
    var form_error = false;
    var propNames = propertyNames($scope.theform);

    for (var i=0;i<propNames.length;i++){
      var row = propNames[i];
      var req_error = $scope.theform[row].$error.required;
      var neg_error = $scope.theform[row].$error.negative;
      if (req_error === true || neg_error === true){
        form_error = true;        
      }
    }
    if (form_error === true){
      toastr.error('errors in form');
      choices = null;
    }

    return choices;
  };

  $scope.reset = function(){
    $scope.submitted = false;
    $scope.choices = [{id: 'choice1'}];
  };
})

;
