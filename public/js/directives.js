'use strict';


angular.module('scanthisApp.directives', [])


/*select lot from dropdown*/
.directive('selectlot', function() { return { templateUrl: 'htmlpartials/selectlot.html' }; })

/*form with submit button*/
.directive('createform', function() { return { templateUrl: 'htmlpartials/createform.html' }; })

/*table with suppliers with button to set as current*/
.directive('supplierlist', function() { return { templateUrl: 'htmlpartials/supplierlist.html' }; })

.directive('loinlist', function() { return { templateUrl: 'htmlpartials/loinlist.html' }; })

.directive('boxsummary', function() { return { templateUrl: 'htmlpartials/boxsummary.html' }; })

.directive('currentlot', function() { return { templateUrl: 'htmlpartials/currentlot.html' }; })

.directive('clearsubmit', function() { return { templateUrl: 'htmlpartials/clearsubmit.html' }; })

.directive('boxinfo', function() { return { 
  scope: { box: '=' },
  templateUrl: 'htmlpartials/boxinfo.html' }; })

.directive('list', function() { return { 
  scope: { itemlist: '=',  
           config: '=' ,
           updateFn: '&'},
  templateUrl: 'htmlpartials/list.html' }; })

.directive('entryform', function() { return { 
  scope: {table: '=',  
          config: '=', 
          form: '=',  
          formchange: '=',
          submitFn: '&'},
  controller: 'entryformCtrl', 
  templateUrl: 'htmlpartials/entryform.html' }; })

.directive('shipinfo', function() { return { 
  scope: { ship: '=' },
  templateUrl: 'htmlpartials/shipinfo.html' }; })

;
