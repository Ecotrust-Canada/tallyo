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
  'scanthisApp.createlotController',
  'scanthisApp.setsupplierController',
  'scanthisApp.AdminController',
  'monospaced.qrcode',
  'ngSanitize', 
  'ngCsv',
  'toastr'
])

/*
 *counfigure toastr
 */
.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        maxOpened: 3,
        positionClass: 'toast-top-full-width'
    });
})

/*
 *Controllers used on most pages to set station and stage
 */

.controller('SetStation', function($scope, $http, DatabaseServices) {

  $scope.GetStationInfo = function(station_code){
    var query = '?code=eq.' + station_code;
    var func = function(response){
      $scope.station_info = response.data[0].station_info;
    };
    DatabaseServices.GetEntries('station', func, query);
  };


  $scope.init = function(station_code){
    $scope.processor = station_code.substring(0, 3);
    $scope.station_code = station_code;    
    $scope.entry = {};
    $scope.list = {};
    $scope.qr = {};
    $scope.scan = {};
    $scope.form = {};
    $scope.current = {};
    $scope.GetStationInfo(station_code);
  };


 
})


.controller('PrintCtrl', function($scope, $http, DatabaseServices) {

  $scope.printDiv = function(qrString) {
    // var printContents = document.getElementById(divName).innerHTML;
    var thediv = '<qrcode version="4" error-correction-level="medium" size="100" data="' + qrString + '"></qrcode>' + '<br><div>' + qrString + '</div>';
    var popupWin = window.open('', '_blank', 'width=800,height=300');
    popupWin.document.open();
    popupWin.document.write("<!DOCTYPE html>");
    popupWin.document.write("<html data-ng-app=\"monospaced.qrcode\">");
    popupWin.document.write("<!-- License:  LGPL 2.1 or QZ INDUSTRIES SOURCE CODE LICENSE -->");
    popupWin.document.write("<head><title>QZ Print Plugin<\/title>");
    popupWin.document.write("<meta http-equiv=\"Content-Type\" content=\"text\/html; charset=UTF-8\" \/>");
    popupWin.document.write("<script type=\"text\/javascript\" src=\"bower_components\/angular\/angular.js\"><\/script>");
    popupWin.document.write("<script type=\"text\/javascript\" src=\"bower_components\/qrcode-generator\/js\/qrcode.js\"><\/script>");
    popupWin.document.write("<script type=\"text\/javascript\" src=\"bower_components\/angular-qrcode\/angular-qrcode.js\"><\/script>");
    popupWin.document.write("<script type=\"text\/javascript\" src=\"js\/qzdeps\/3rdparty\/jquery-1.10.2.js\"><\/script>");
    popupWin.document.write("<script type=\"text\/javascript\" src=\"js\/qzdeps\/qz-websocket.js\"><\/script>");
    popupWin.document.write("<script type=\"text\/javascript\">");
    popupWin.document.write("");
    popupWin.document.write("\/**");
    popupWin.document.write(" * Deploy tray version of QZ, or");
    popupWin.document.write(" * Optionally used to deploy multiple versions of the applet for mixed");
    popupWin.document.write(" * environments.  Oracle uses document.write(), which puts the applet at the");
    popupWin.document.write(" * top of the page, bumping all HTML content down.");
    popupWin.document.write(" *\/");
    popupWin.document.write("deployQZ();");
    popupWin.document.write("");
    popupWin.document.write("function getCertificate(callback) {");
    popupWin.document.write("    callback();");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("function signRequest(toSign, callback) {");
    popupWin.document.write("    callback();");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("");
    popupWin.document.write("\/**");
    popupWin.document.write(" * Automatically gets called when applet has loaded.");
    popupWin.document.write(" *\/");
    popupWin.document.write("function qzReady() {");
    popupWin.document.write("    \/* If the qz object hasn't been created, fallback on the <applet> tags *\/");
    popupWin.document.write("    if (!qz) {");
    popupWin.document.write("        window[\"qz\"] = document.getElementById('qz');");
    popupWin.document.write("    }");
    popupWin.document.write("    if (qz) {");
    popupWin.document.write("        try {");
    popupWin.document.write("            qz.getVersion();");
    popupWin.document.write("        } catch(err) {}");
    popupWin.document.write("    }");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("function qzSocketError(event) {");
    popupWin.document.write("    console.log('Error:');");
    popupWin.document.write("    console.log(event);");
    popupWin.document.write("");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("function qzSocketClose(event) {");
    popupWin.document.write("    console.log('Close:');");
    popupWin.document.write("    console.log(event);");
    popupWin.document.write("");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("function qzNoConnection() {");
    popupWin.document.write("    alert(\"Unable to connect to QZ, is it running?\");");
    popupWin.document.write("");
    popupWin.document.write("    var newElem = document.createElement('ins');");
    popupWin.document.write("    newElem.innerHTML = content;");
    popupWin.document.write("");
    popupWin.document.write("    document.write = oldWrite;");
    popupWin.document.write("    document.body.appendChild(newElem);");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("\/**");
    popupWin.document.write(" * Returns whether or not the applet is not ready to print.");
    popupWin.document.write(" * Displays an alert if not ready.");
    popupWin.document.write(" *\/");
    popupWin.document.write("function notReady() {");
    popupWin.document.write("    \/* If applet is not loaded, display an error *\/");
    popupWin.document.write("    if (!isLoaded()) {");
    popupWin.document.write("        return true;");
    popupWin.document.write("    }");
    popupWin.document.write("    \/* If a printer hasn't been selected, display a message. *\/");
    popupWin.document.write("    else if (!qz.getPrinter()) {");
    popupWin.document.write("        alert('Please select a printer first by using the \"Detect Printer\" button.');");
    popupWin.document.write("        return true;");
    popupWin.document.write("    }");
    popupWin.document.write("    return false;");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("\/**");
    popupWin.document.write(" * Returns is the applet is not loaded properly");
    popupWin.document.write(" *\/");
    popupWin.document.write("function isLoaded() {");
    popupWin.document.write("    if (!qz) {");
    popupWin.document.write("        return false;");
    popupWin.document.write("    } else {");
    popupWin.document.write("        try {");
    popupWin.document.write("            if (!qz.isActive()) {");
    popupWin.document.write("                return false;");
    popupWin.document.write("            }");
    popupWin.document.write("        } catch (err) {");
    popupWin.document.write("            return false;");
    popupWin.document.write("        }");
    popupWin.document.write("    }");
    popupWin.document.write("    return true;");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("\/**");
    popupWin.document.write(" * Automatically gets called when \"qz.print()\" is finished.");
    popupWin.document.write(" *\/");
    popupWin.document.write("function qzDonePrinting() {");
    popupWin.document.write("    \/* Alert error, if any *\/");
    popupWin.document.write("    if (qz.getException()) {");
    popupWin.document.write("        qz.clearException();");
    popupWin.document.write("        return;");
    popupWin.document.write("    }");
    popupWin.document.write("");
    popupWin.document.write("    \/* Alert success message *\/");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("");
    popupWin.document.write("");
    popupWin.document.write("\/***************************************************************************");
    popupWin.document.write(" * Prototype function for finding the closest match to a printer name.");
    popupWin.document.write(" * Usage:");
    popupWin.document.write(" *    qz.findPrinter('zebra');");
    popupWin.document.write(" *    window['qzDoneFinding'] = function() { alert(qz.getPrinter()); };");
    popupWin.document.write(" ***************************************************************************\/");
    popupWin.document.write("function findPrinter(name) {");
    popupWin.document.write("    \/* Get printer name from input box *\/");
    popupWin.document.write("    if (isLoaded()) {");
    popupWin.document.write("        \/* Searches for locally installed printer with specified name *\/");
    popupWin.document.write("        qz.findPrinter(name);");
    popupWin.document.write("");
    popupWin.document.write("        \/* Automatically gets called when \"qz.findPrinter()\" is finished. *\/");
    popupWin.document.write("        window['qzDoneFinding'] = function() {");
    popupWin.document.write("            var printer = qz.getPrinter();");
    popupWin.document.write("");
    popupWin.document.write("            \/* Alert the printer name to user *\/");
    popupWin.document.write("            alert(printer !== null ? 'Printer found: \"' + printer +");
    popupWin.document.write("            '\" after searching for \"' + name + '\"' : 'Printer \"' +");
    popupWin.document.write("            p.value + '\" not found.');");
    popupWin.document.write("");
    popupWin.document.write("            \/* Remove reference to this function *\/");
    popupWin.document.write("            window['qzDoneFinding'] = null;");
    popupWin.document.write("        };");
    popupWin.document.write("    }");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("");
    popupWin.document.write("");
    popupWin.document.write("");
    popupWin.document.write("\/***************************************************************************");
    popupWin.document.write(" * Prototype function for printing an HTML screenshot of the existing page");
    popupWin.document.write(" * Usage: (identical to appendImage(), but uses html2canvas for png rendering)");
    popupWin.document.write(" *    qz.setPaperSize(\"8.5in\", \"11.0in\"); ");
    popupWin.document.write(" *    qz.setAutoSize(true);");
    popupWin.document.write(" *    qz.appendImage($(\"canvas\")[0].toDataURL('image\/png'));");
    popupWin.document.write(" ***************************************************************************\/");
    popupWin.document.write("function printHTML5Page() {");
    popupWin.document.write("    $(\"#qz-status\").html2canvas({");
    popupWin.document.write("        canvas: hidden_screenshot,");
    popupWin.document.write("        onrendered: function() {");
    popupWin.document.write("            if (notReady()) { return; }");
    popupWin.document.write("            \/* Optional, set up custom page size.  These only work for PostScript printing. *\/");
    popupWin.document.write("            \/* setPaperSize() must be called before setAutoSize(), setOrientation(), etc. *\/");
    popupWin.document.write("            qz.setPaperSize(\"8.5in\", \"11.0in\");  \/* US Letter *\/");
    popupWin.document.write("            qz.setAutoSize(true);");
    popupWin.document.write("            qz.appendImage($(\"canvas\")[0].toDataURL('image\/png'));");
    popupWin.document.write("");
    popupWin.document.write("            \/* qz.setCopies(3); *\/");
    popupWin.document.write("            qz.setCopies(1);");
    popupWin.document.write("");
    popupWin.document.write("            \/* Automatically gets called when \"qz.appendFile()\" is finished. *\/");
    popupWin.document.write("            window['qzDoneAppending'] = function() {");
    popupWin.document.write("                \/* Tell the applet to print. *\/");
    popupWin.document.write("                qz.printPS();");
    popupWin.document.write("");
    popupWin.document.write("                \/* Remove reference to this function *\/");
    popupWin.document.write("                window['qzDoneAppending'] = null;");
    popupWin.document.write("            };");
    popupWin.document.write("        }");
    popupWin.document.write("    });");
    popupWin.document.write("}");
    popupWin.document.write("");
    popupWin.document.write("setTimeout(function(){findPrinter('PDF');},3000);");
    popupWin.document.write("setTimeout(function(){printHTML5Page();},4000);");
    popupWin.document.write("setTimeout(function(){window.close();},5000);");
    popupWin.document.write("");
    popupWin.document.write("<\/script>");
    popupWin.document.write("<script type=\"text\/javascript\" src=\"js\/qzdeps\/3rdparty\/html2canvas.js\"><\/script>");
    popupWin.document.write("<script type=\"text\/javascript\" src=\"js\/qzdeps\/3rdparty\/jquery.plugin.html2canvas.js\"><\/script>");
    popupWin.document.write("<\/head>");
    popupWin.document.write("");
    popupWin.document.write("<body id=\"qz-status\">");
    popupWin.document.write("");
    popupWin.document.write("<table>");
    popupWin.document.write("<tr>");
    popupWin.document.write("    <td>");
    popupWin.document.write("        <input type=\"button\" onClick=\"findPrinter('PDF')\" value=\"Detect Printer\">");
    popupWin.document.write("    <\/td>");
    popupWin.document.write("    <td>");
    popupWin.document.write("        <input type=\"button\" onClick=\"printHTML5Page()\" value=\"Print Current Page\" \/>");
    popupWin.document.write("    <\/td>");
    popupWin.document.write("<\/tr>");
    popupWin.document.write("<\/table>");
    popupWin.document.write("" + thediv);
    popupWin.document.write("");
    popupWin.document.write("<\/body>");
    popupWin.document.write("<canvas id=\"hidden_screenshot\" style=\"display:none;\"><\/canvas>");
    popupWin.document.write("");
    popupWin.document.write("<\/html>");
    popupWin.document.write("");
    popupWin.document.close();
  };

   
})

.controller('CSVCtrl', function($scope, $http, DatabaseServices) {

  $scope.csvcontent = [{a: 1, b:2}, {a:3, b:4}];


})
;

