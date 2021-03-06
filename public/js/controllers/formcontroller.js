'use strict';

angular.module('scanthisApp.formController', [])

//controller attached to entryform directive
.controller('entryformCtrl', function($scope, $http, DatabaseServices, toastr, $document, $timeout) {

  $scope.dboptionsconfig =
  { id: 1, 
    arg: "value", 
    searchfield: "value",
    fields: []
  };

  
  //display scale buttons
  if ($scope.config.startpolling){
    $scope.poll_scale = true;
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

  $scope.form_enabled = false;

  //clear fields to default
  $scope.Clear = function(){
    $scope.submitted=false;
    if ($scope.config.startpolling) {
      $scope.formarray = JSON.parse(JSON.stringify($scope.config.fields));
    }
    $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
    if ($scope.config.startpolling) {
      clearObj($scope.scale);
      if ($scope.poll_scale === true){
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
    //$scope.FormData($scope.config.dboptions);
    $scope.form_enabled = true;
    
  };


  $scope.Reset = function(){
    $scope.submitted=false;
    $scope.formarray = JSON.parse(JSON.stringify($scope.config.fields));
    $scope.form = ResetForm($scope.form, $scope.formarray);
    if ($scope.config.startpolling) {
      clearObj($scope.scale);
      if ($scope.poll_scale === true){
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
    $scope.form_enabled = true;
    
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
      $scope.weigh(nextrow);
    }
  };

  //called when scale field on focus
  $scope.weigh = function(row){
    var scales = $scope.formarray.filter(function(el){
      return el.scale === 'on';
    });
    scales.forEach(function(el){
      $scope.form[el.fieldname] = $scope.scale[el.fieldname];
      el.scale = "lock";
    });

    $scope.form[row.fieldname] = null;
    row.scale = 'on';
  };

  //turn the scale on or off
  $scope.scalefn = function(){
    clearObj($scope.scale);
    if ($scope.poll_scale === true){
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
    
    $scope.poll_scale = !$scope.poll_scale;
  };

  $scope.submitted=false;

  $scope.isValid = function(form){
    $scope.submitted = true;
    var form_error = false;
    for (var i=0;i<$scope.formarray.length;i++){
      var row = $scope.formarray[i];
      if (row.required && !$scope.form[row.fieldname]){
        form_error = true;
        toastr.error('Please set ' + row.title.toLowerCase());
        $scope.thediv = document.getElementById('scaninput');
        if($scope.thediv){
          $timeout(function(){$scope.thediv.focus(); delete $scope.thediv;}, 0);
        }
      }
      // only check for empty string is field is also required
      else if (row.required && $scope.form[row.fieldname] === ''){
        form_error = true;
        toastr.error('Please set ' + row.title.toLowerCase());
      }
      else if ($scope.theform[row.fieldname] && $scope.theform[row.fieldname].$error){
        var req_error = $scope.theform[row.fieldname].$error.required;
        var neg_error = $scope.theform[row.fieldname].$error.negative;
        if (neg_error === true){
          form_error = true;
          toastr.error('errors in form');
        }
      }
      else if (row.scale){
        if (!$scope.form[row.fieldname] || $scope.form[row.fieldname] === null){
          form_error = true;
        }
      }
    }
    if (form_error === true){
      $scope.form_enabled = true;
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

  $scope.DoSomething = function(something, row, index){
    $scope.el = document.getElementById(something);
    $scope.el.checked = true;
    delete $scope.el;
    $scope.form[row.fieldname] = row.value[index].val;
  };

  $scope.toggleRadioValue = function(frow){
      var fieldname = frow.fieldname;
      $scope.checkInput = document.getElementById('formswitch-'+fieldname);
      setTimeout(function () {
        $scope.$apply(function () {
          $scope.form[fieldname] = $scope.checkInput.checked ? frow.value[1].val : frow.value[0].val;
          delete $scope.checkInput;
        });
      }, 50);
  };

  $scope.searchset = function(value, row){
    $scope.form[row.fieldname] = value;
  };

})


.controller('editdataCtrl', function($scope, $http, DatabaseServices, toastr, $document, $timeout, $animate) {
  $animate.enabled(true);
  $scope.$watch('thedata', function(newValue, oldValue) {
    if ($scope.thedata !== undefined){
      $scope.Clear();
    }
  });

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

  $scope.form_enabled = false;

  //clear fields to default
  $scope.Clear = function(){
    $scope.submitted=false;
    $scope.formarray = JSON.parse(JSON.stringify($scope.config.fields));
    $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
    $scope.form_enabled = true;
    for (var key in $scope.thedata){
      $scope.form[key] = $scope.thedata[key];
    }
    $scope.FormData($scope.config.dboptions);
    
  };


  $scope.Reset = function(){
    $scope.submitted=false;
    $scope.formarray = JSON.parse(JSON.stringify($scope.config.fields));
    $scope.form = ResetForm($scope.form, $scope.formarray);
    $scope.form_enabled = true;
    
  };

  //watch outside variable to know when to clear form
  // $scope.$watch('formchange', function(newValue, oldValue) {
  //   if ($scope.formchange !== undefined){
  //     $scope.Clear();
  //   }
  // });


  //hide the form once it's submitted
  $scope.hidefn = function(){
    if ($scope.config.hide){
      $scope.hideform = true;
    }
  };


  $scope.submitted=false;

  $scope.isValid = function(form){
    $scope.submitted = true;
    var form_error = false;
    for (var i=0;i<$scope.formarray.length;i++){
      var row = $scope.formarray[i];
      if (row.required && !$scope.form[row.fieldname]){
        form_error = true;
        toastr.error('Please set ' + row.title.toLowerCase());
      }
      // only check for empty string is field is also required
      else if (row.required && $scope.form[row.fieldname] === ''){
        form_error = true;
        toastr.error('Please set ' + row.title.toLowerCase());
      }
      else if ($scope.theform[row.fieldname] && $scope.theform[row.fieldname].$error){
        var req_error = $scope.theform[row.fieldname].$error.required;
        var neg_error = $scope.theform[row.fieldname].$error.negative;
        if (neg_error === true){
          form_error = true;
          toastr.error('errors in form');
        }
      }
      else if (row.scale){
        if (!$scope.form[row.fieldname] || $scope.form[row.fieldname] === null){
          form_error = true;
        }
      }
    }
    if (form_error === true){
      $scope.form_enabled = true;
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

  $scope.DoSomething = function(something, row, index){
    $scope.el = document.getElementById(something);
    $scope.el.checked = true;
    delete $scope.el;
    $scope.form[row.fieldname] = row.value[index].val;
  };

  $scope.toggleRadioValue = function(frow){
      var fieldname = frow.fieldname;
      $scope.checkInput = document.getElementById('formswitch-'+fieldname);
      setTimeout(function () {
        $scope.$apply(function () {
          $scope.form[fieldname] = $scope.checkInput.checked ? frow.value[1].val : frow.value[0].val;
          delete $scope.checkInput;
        });
      }, 50);
  };

  $scope.searchset = function(value, row){
    $scope.form[row.fieldname] = value;
  };

})

.controller('editformCtrl', function($scope, $http, DatabaseServices, toastr, $document) {

})

//default controller with submit form functions
.controller('FormSubmitCtrl', function($scope, $http, DatabaseServices, toastr, $timeout) {
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
    $scope.thediv = document.getElementById('scaninput');
    if($scope.thediv){
     $timeout(function(){$scope.thediv.focus(); delete $scope.thediv;}, 0);
    }
  };




  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      responsefunction((response.data[0] ? response.data[0] : response.data));
      $scope.entry[table] = {};
    };

    var processor;
    if ($scope.options.diff_processor){
      processor = $scope.options.diff_processor;
    }
    else{
      processor = $scope.processor;
    }
    DatabaseServices.DatabaseEntryCreateCode(table, $scope.entry[table], processor, func); 
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){ 
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).format();

      if ($scope.station_info.collectiontable === 'box'){
        $scope.entry[table].station_code = $scope.station_code;
      }
      if ($scope.station_info.collectiontable === 'shipping_unit'){
        $scope.entry[table].station_code = $scope.station_code;
      }
      if ($scope.station_info.collectiontable === 'lot'){      
          CreateLotEntryPeriod(date, 'day', $scope);
          $scope.entry[table].station_code = $scope.station_code;
          $scope.entry[table].processor_code = $scope.processor;
      }
      if ($scope.options && $scope.options.receiveharvester){
        $scope.entry.harvester.processor_code = $scope.processor;
        $scope.entry.harvester.active = true;
      }
      if ($scope.options && $scope.options.patch_supplier){
        var obj = form.lotnum_in;
        $scope.entry.lot.supplier_code = obj.supplier_code;
        $scope.entry.lot.harvester_code = obj.harvester_code;
        $scope.entry.lot.lot_in = obj.lot_number;
      }

      MakeEntry(form, table, $scope);
      if ($scope.entry.lot && $scope.entry.lot['lotnum_in']){
          delete $scope.entry.lot['lotnum_in'];
      }
      $scope.ToDatabase(responsefunction);

    }, function errorCallback(response) {
    });
    
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

  $scope.SubmitCheckDuplicate = function(form){
    if (form){
      var query = '?fleet=eq.' + form.fleet + '&supplier_group=eq.' + form.supplier_group + '&supplier=eq.' + form.supplier + '&landing_location=eq.' + form.landing_location + '&ft_fa_code=eq.' + form.ft_fa_code + '&active=eq.true';
      var func = function(response){
        if (response.data.length > 0){
          toastr.error('error: duplicate');
        }
        else{
          $scope.Submit(form, AddtoList);
        }
      };
      DatabaseServices.GetEntries('harvester', func, query);
    }
  };


  $scope.SubmitEdit = function(form){
    var table = $scope.station_info.collectiontable;
    var pk = $scope.station_info.collectionid;
    var id = $scope.current.collectionid;
    var querystring = '?' + pk + '=eq.' + id;
    var patch = form;
    var func = function(response){
      for (var key in patch){
        if ($scope.current[table]){
          $scope.current[table][key] = response.data[0][key];
        }        
        $scope.current.edit_box = false;
        $scope.form = {};
      }
      $scope.formchange = !$scope.formchange;
      $scope.current.reload = !$scope.current.reload || false;
    };
    DatabaseServices.PatchEntry(table, patch, querystring, func);

  };

  $scope.$watch('current.select_change', function(newValue, oldValue) {
    if ($scope.current.select_change !== undefined){
      $scope.formchange=!$scope.formchange;      
    }
  });

})


.controller('OptionCtrl', function($scope){
    $scope.formatOption = function(cfg, item){
      var option = '';
      for (var i=0; i < cfg.fields.length; i++){
        var field = cfg.fields[i];
        var val = item[field];
        if ( field === 'timestamp'){
          if (val) {
            option += moment(new Date(val.substring(0,19))).format('MMM D');
          } else {
            option += '';
          }
        } else {
          option += val;
        } 
        if (i < cfg.fields.length - 1) {
          option += ' '+(cfg.delimeter? cfg.delimeter : '-')+' ';
        }
      }  

      return option;
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
      $scope.entry.product.best_before = (form.best_before ? moment.duration(form.best_before, 'months') : moment.duration(1, 'years'));
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
        //toastr.error('please select '+ $scope.config.fields[i].title);
      }
    }
    if (form_error === true){
      toastr.error('errors in form');
      return null;
    }
    else{
      $scope.submitted = false;
      $scope.choices = [{id: 'choice1'}];
      return choices;
    }    
  };

  $scope.reset = function(){

    $scope.submitted = false;
    $scope.choices = [{id: 'choice1'}];
  };
})

;
