'use strict';

// Declare app level module which depends on views, and components
angular.module('scanthisApp', [

  'scanthisApp.directives',
  'scanthisApp.routing',
  'scanthisApp.filters',
  'scanthisApp.factories',
  
  'scanthisApp.formController',
  'scanthisApp.itemController',
  'scanthisApp.packingController',
  'scanthisApp.receivingController',
  'scanthisApp.createlotController',
  'scanthisApp.setsupplierController',
  'scanthisApp.AdminController',
  'ngSanitize', 
  'ngCsv',
  'toastr',
  'gridshore.c3js.chart'
])

/*
 *counfigure toastr
 */
.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        maxOpened: 3,
        positionClass: 'toast-top-full-width',
        preventOpenDuplicates: true
    });
})


.controller('MainCtrl', function($scope) {
  $scope.current_terminal = {
    id: -1,
    icon: null,
    name: "Stations"
  };
  $scope.stations = stationlist;
  $scope.terminals = terminals;
})

.controller('RoutingCtrl', function($scope, $routeParams, $rootScope) {

  $scope.terminal = {};
  $scope.terminal.showsection = "default";

  //$scope.stations = stationlist;
  //$scope.terminals = terminals;
  $scope.settings = plant_settings;

  if ($routeParams.terminal_id){
    var current_terminal = terminals.filter(function(s){return s.id == $routeParams.terminal_id})[0];

    $scope.$parent.current_terminal = { id: current_terminal.id, icon: current_terminal.icon, name: current_terminal.name };

    var stations = current_terminal.stations;
    $scope.currentstations = [];

    for (var i = 0;i<stations.length;i++){
      var index = stations[i];
      $scope.currentstations[i] = {};
      $scope.currentstations[i].include = '/html/' + $scope.stations[index].type + '.html';//$routeParams.controller + '.' + $routeParams.action + '.html';
      $scope.currentstations[i].settings = $scope.stations[index].settings;
    }
    $scope.terminal.substation = 0;
  }
})

.controller('StationCtrl', function($scope, $http, $sce, DatabaseServices) {

  $scope.init = function(settings){
    $scope.station_code = settings.station_code;
    $scope.processor = $scope.station_code.substring(0, 3);
    $scope.title = settings.title;
    $scope.station_info = settings.station_info;


    if(settings.onLabel){
      $scope.onLabel = settings.onLabel;
    }
    if(settings.sumStations){
      $scope.sumStations = settings.sumStations;
    }
    if(settings.setstation){
      $scope.setstation = settings.setstation;
    }
    if(settings.prevStation){
      $scope.prevStation = settings.prevStation;
    }
    if(settings.formedit){
      $scope.formedit = settings.formedit;
    }
    if(settings.tableinform){
      $scope.tableinform = settings.tableinform;
    }
    if(settings.valuesarray){
      $scope.valuesarray = settings.valuesarray;
    }
    if(settings.options){
      $scope.options = settings.options;
    }
    if(settings.visibility){
      $scope.visibility = settings.visibility;
    }

    if(settings.scaleURL){
      $scope.scaleURL = settings.scaleURL;
    }

    if(settings.printString && settings.printurl){
      $scope.printurl = settings.printurl;
      $scope.printString = settings.printString;
      $scope.printLabel = function(codeString, fieldarray) {
        $http({
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          url: $scope.printurl + 'print',
          transformRequest: function(obj) {
            var str = [];
            for(var p in obj) {
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
            return str.join("&");
          },
          data: {data:$scope.printString(codeString, fieldarray)}

        });
      };
    }
    
    if(settings.packingconfig){
      $scope.packingconfig = packingconfigs[settings.packingconfig.id];    
    }
            
    $scope.entry = {};
    $scope.list = {};
    $scope.current = {};
    $scope.current.lotlistchange = true;

    if (settings.forms){
      $scope.scanform = formconfigs[settings.forms.scanform];
      $scope.collectionform = formconfigs[settings.forms.collectionform];
      $scope.addform = formconfigs[settings.forms.addform];
      $scope.addform2 = formconfigs[settings.forms.addform2];
    }

    if (settings.dropdowns){
      $scope.collectiondropdown = dropdownconfigs[settings.dropdowns.collectiondropdown];
      $scope.adddropdown = dropdownconfigs[settings.dropdowns.adddropdown];
    }
    
    if(settings.lists){
      $scope.itemlistconfig = listconfigs[settings.lists.items];
      $scope.totallistconfig = listconfigs[settings.lists.totals];
      $scope.item2listconfig = listconfigs[settings.lists.additem];
    }

    if(settings.displays){
      $scope.collectiondisplay = displayconfigs[settings.displays.collectiondisplay];
      $scope.collection2display = displayconfigs[settings.displays.collection2display];
      $scope.adddisplay = displayconfigs[settings.displays.adddisplay];
    }

    $scope.includes = [];
    for (var i=0;i<settings.includes.length;i++){ 
      $scope.includes[i] = 'htmlcomponents/' + settings.includes[i]+ '.html';
    }

    //$scope.showsection = "before";
    if ($scope.options.loadcurrentcollection) {
        $scope.loadCurrent();
    }
  };

  $scope.loadCurrent = function(){
    var func = function(response){
      var station = response.data[0];
      var today = moment(new Date()).startOf('day').format();
      if(station){
        if (moment(station.in_progress_date).startOf('day').format() === today){
          $scope.current.collectionid = station.lot_number;
        }
      }
    };
    var query = '?station_code=eq.' + $scope.station_code + '&in_progress=eq.true';
    DatabaseServices.GetEntries('lotlocations', func, query);
  };

  $scope.switchSubstation = function(index) {
    var substation = $scope.currentstations[index].settings; 
    $scope.terminal.substation = index;
    $scope.$parent.current_terminal.name = substation.title;
  };

  $scope.formatOption = function(item, fields, delim){
      var option = '', index=0, field_name;
      for (index = 0; index < fields.length; ++index) {
          field_name = fields[index];
          option += item[fieldname];
          option += (index < fields.length -1 ? ' ' + delim + ' ' : '');
      }
      return option;
  };

})
;

