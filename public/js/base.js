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
  'scanthisApp.ThisfishController',
  'ngSanitize', 
  'ngCsv',
  'toastr',
  'gridshore.c3js.chart',
  'ngMaterial',
  'ngAnimate',
  'ngScrollable'
])

/*
 *counfigure toastr
 */
.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        maxOpened: 4,
        positionClass: 'toast-top-full-width',
        preventOpenDuplicates: false,
        timeOut: 700
    });
})


.controller('MainCtrl', function($scope) {
  $scope.current_terminal = {
    id: -1,
    icon: 'menu',
    name: "Stations"
  };
  $scope.stations = stationlist;
  $scope.terminals = terminals;

  $scope.unFocus = function(){
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
      var active = document.activeElement;
      if (active.nodeName !== 'SELECT'){
        active.blur();
        var el = document.getElementById('to_focus');
        if (el){
          //alert('hmm');
          el.focus();
        }
      }
    }
  };
})

.controller('RoutingCtrl', function($scope, $routeParams, $rootScope) {

  $scope.terminal = {};
  $scope.terminal.showsection = "default";

  //$scope.stations = stationlist;
  //$scope.terminals = terminals;
  $scope.settings = plant_settings;

  if ($routeParams.terminal_id){
    var current_terminal = terminals.filter(function(s){return s.id == $routeParams.terminal_id})[0];
    if ($scope.$parent.current_terminal.id > -1 && $routeParams.terminal_id != $scope.$parent.current_terminal.id && 
        typeof($scope.$parent.current_terminal.subterminal_id) !== 'undefined' 
       ) {

        document.getElementById('submenu-'+$scope.$parent.current_terminal.id).style.display = 'none';
    }
    $scope.$parent.current_terminal = { id: current_terminal.id, icon: current_terminal.icon, name: current_terminal.name };

    if (!current_terminal.subterminals){
        $scope.terminal.both = current_terminal.both;

        var stations = current_terminal.stations;
        $scope.currentstations = [];

        for (var i = 0;i<stations.length;i++){
          var index = stations[i];
          $scope.currentstations[i] = {};
          $scope.currentstations[i].include = '/html/' + $scope.stations[index].type + '.html';//$routeParams.controller + '.' + $routeParams.action + '.html';
          $scope.currentstations[i].settings = $scope.stations[index].settings;
        }
        $scope.terminal.substation = 0;
        document.getElementById('menu').style.display = 'none';
    } else  {
        if($routeParams.subterminal_id){
            var subterminal = current_terminal.subterminals.filter(function(s){return s.id == $routeParams.subterminal_id})[0];
            
            $scope.$parent.current_terminal = { 
                id: current_terminal.id,
                subterminal_id: subterminal.id,
                icon: subterminal.icon, 
                name: subterminal.name 
            };

            var stations = subterminal.stations;
            $scope.currentstations = [];

            for (var i = 0;i<stations.length;i++){
              var index = stations[i];
              $scope.currentstations[i] = {};
              $scope.currentstations[i].include = '/html/' + $scope.stations[index].type + '.html';//$routeParams.controller + '.' + $routeParams.action + '.html';
              $scope.currentstations[i].settings = $scope.stations[index].settings;
            }

            $scope.terminal.substation = 0;
            document.getElementById('menu').style.display = 'none';
            //document.getElementById('submenu-'+$routeParams.terminal_id).style.display = 'none';
        } else {
          document.getElementById('submenu-'+$routeParams.terminal_id).style.display = 'inline-block';
          $scope.$parent.current_terminal.subterminal_id = 0;
        }
    }
  }
})

.controller('StationCtrl', function($scope, $http, $sce, DatabaseServices) {

  $scope.init = function(settings){
    $scope.station_code = settings.station_code;
    $scope.css_code = settings.css_code;
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
    if (settings.substationlink) {
        $scope.substationlink = settings.substationlink;
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
      var generatePrintLabel = function(stringFunc) {
        return function(codeString, fieldarray) {
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
            data: {data:stringFunc(codeString, fieldarray)}

          });
        };
      };
      // fall back to non fair trade label if fair trade not defined
      if (settings.printStringFairTrade) {
        $scope.printStringFairTrade = settings.printStringFairTrade;
      } else {
        $scope.printStringFairTrade = settings.printString;
      };

      $scope.printLabel = generatePrintLabel($scope.printString);
      $scope.printLabelFairTrade = generatePrintLabel($scope.printStringFairTrade);
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
    if ($scope.options && $scope.options.loadcurrentcollection) {
        $scope.loadCurrent();
    }

    var stn = settings.includes[0];
    
    if(stn === 'weighstation' || stn === 'packingstation' || stn === 'receiveshipment' || stn === 'receivingprintlabel' || stn === 'scaninventorystation' || stn === "viewinventory" || stn === 'receivingprintlabel' || stn === 'reprint_label'){
      $scope.ZoomRight(600, true);
    }
    if(stn === 'kanban' || stn === 'supplier_setup' || stn === 'shipmentdata'){
      window.document.webkitExitFullscreen();
      $scope.ZoomRight(600, false);
    }

    
  };


  $scope.loadCurrent = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).startOf('day').format();
      var query = '?in_progress_date=gte.'+ date + '&station_code=eq.' + $scope.station_code + '&in_progress=eq.true';
      var func = function(response){
        if (response.data.length > 0){
          $scope.current.collectionid = response.data[0].lot_number;
        }
      };
      DatabaseServices.GetEntries('lotlocations', func, query);      
    }, function errorCallback(response) {
    });
  };



  $scope.RefreshPage = function(){
    location.reload();
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

  $scope.overlay = function(id) {
    var el = document.getElementById(id);
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
  };

  $scope.enablekeypress = function(){
    var enabled = function(event) {
        return true;
    };
    document.onkeydown = enabled;
  };


  $scope.ZoomRight = function(width, fullscreen){

    

    function getViewportWidth() {
        if (window.innerWidth) {
            return window.innerWidth;
        }
        else if (document.body && document.body.offsetWidth) {
            return document.body.offsetWidth;
        }
        else {
            return 0;
        }
    }

    function getViewportHeight() {
        if (window.innerHeight) {
            return window.innerHeight;
        }
        else if (document.body && document.body.offsetHeight) {
            return document.body.offsetHeight;
        }
        else {
            return 0;
        }
    }

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
      document.querySelector('meta[name=viewport]').setAttribute('content', 'minimum-scale=1,maximum-scale=1,initial-scale=1');
        var actual_width = getViewportWidth();
        var min_width = width;
        var ratio = actual_width / min_width;
        //if (ratio < 1) {
          var percent = (ratio*100).toFixed(2);
          if (fullscreen === true){
            document.body.style.zoom = percent + "%";
              var el = window.document.documentElement
              ,rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
              rfs.call(el);
          }
          if (fullscreen === false){
            document.body.style.zoom = "100%";
            document.body.style.zoom = percent + "%";
            document.querySelector('meta[name=viewport]').setAttribute('content', 'initial-scale=1,minimum-scale=0,maximum-scale=10,user-scalable=yes');
          }
      //}
      $scope.the_width = width;
    }  
  };

})
;

