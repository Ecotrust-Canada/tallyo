'use strict';


angular.module('scanthisApp.directives', [])


/*select lot from dropdown*/
.directive('selectlot', function() { return { templateUrl: 'htmlpartials/selectlot.html' }; })

/*table with suppliers with button to set as current*/
.directive('supplierlist', function() { return { templateUrl: 'htmlpartials/supplierlist.html' }; })

.directive('currentlot', function() { return { templateUrl: 'htmlpartials/currentlot.html' }; })

.directive('formoptionedit', function() { return { templateUrl: 'htmlpartials/formoptionedit.html' }; })

.directive('boxinfo', function() { return { 
  scope: { box: '=' },
  templateUrl: 'htmlpartials/boxinfo.html' }; })

.directive('list', function() { return { 
  scope: { itemlist: '=',  
           config: '=' , 
           filterstring: '=', 
           istotal: '=', 
           updateFn: '&'},
  templateUrl: 'htmlpartials/list.html' }; })

.directive('dropdown', function() { return { 
  scope: { itemlist: '=',  
           cfg: '=', 
           selectedoption: '=', 
           changeFn: '&' },
  templateUrl: 'htmlpartials/dropdown.html' }; })

.directive('entryform', function() { return { 
  scope: {table: '=',  
          config: '=', 
          form: '=',  
          formchange: '=',
          list1: '=', 
          list2: '=', 
          submitFn: '&'},
  controller: 'entryformCtrl', 
  templateUrl: 'htmlpartials/entryform.html' }; })

.directive('shipinfo', function() { return { 
  scope: { ship: '=' },
  templateUrl: 'htmlpartials/shipinfo.html' }; })

;
