'use strict';
var globalurl = 'http://10.10.40.30:3000/';


var terminals = [
  { name: 'Admin - view lots', id: 0, stations: [0] },
  { name: 'Admin - set receiving lots', id: 1, stations: [9,1] },
  { name: 'Weigh, Trim', id: 2, stations: [7,6] },
  { name: 'Retouching', id: 3, stations: [8] },
  { name: 'Reprint Labels', id: 4, stations: [2] },
  { name: 'Packing', id: 5, stations: [4] },
  { name: 'Shipping', id: 6, stations: [5] },
  { name: 'Add Shipping info', id: 7, stations: [3] },
  { name: 'Data Analytics', id: 8, stations: [10]}
];


var stationlist = [

  {
    id:0, type:'template_less',
    settings: { title: 'Manage Lots', station_code: 'HS0-ADM',
      css: {station: 'stationframewide'},
      station_info: {},
      includes:['admin_manage_lots'], 
      sumStations: [
        {'name': 'Receiving', 'code': 'HS0-001', 'csv':'scan'},
        {'name': 'Trimming', 'code': 'HS0-002', 'completelot': ['HS0-001', 'HS0-002'], 'csv': 'scan'},
        {'name': 'Retouching', 'code': 'HS0-003', 'completelot': ['HS0-003'], 'csv': 'loin_scan'},
        {'name': 'Boxing', 'code': 'HS0-004', 'csv': 'box_scan'},
        {'name': 'Shipping', 'code': 'HS0-005', 'csv': 'box_scan'}
      ]
    },    
  },
  {
    id:1, type:'template_less',
    settings: { title: 'Manage Sources', station_code: 'HS0-ADM',
      css: {station: 'step'},
      station_info: {},
      includes:['receiving_lots'],
      forms: {collectionform: 2}
    },    
  },
  { id:2, type:'template_less',
    settings: { title: 'Reprint Label', station_code: 'HS0-003',
      css: {station: 'stationframe'},
      station_info: {collectiontable: "harvester_lot", collectionid: "lot_number", itemtotals:"scan_total", itemtable: "loin_scan", itemquery: "lot_number"},
      includes:['reprint_label'], 
      lists: {items: 7},
      onLabel: ['loin_number'],
      printurl: 'http://10.10.40.31:3000/',
      printString: (codeString, fieldData) => 
        `^XA~TA000~JSN^LT0^MNW^MTD^PON^PMN^LH0,0^JMA^PR4,4~SD15^LRN^CI0
        ^MMP
        ^PW812
        ^LL0406
        ^LS0
        ^BY208,208^FT765,153^BXI,4,200,52,52,1,~
        ^FH\^FD${codeString}^FS
        ^FT519,120^A0I,28,28^FH\^FD${fieldData[4]}^FS
        ^FT519,178^A0I,28,28^FH\^FD${fieldData[3]}^FS
        ^FT519,236^A0I,28,28^FH\^FD${fieldData[2]}^FS
        ^FT519,294^A0I,28,28^FH\^FD${fieldData[1]}^FS
        ^FT519,352^A0I,28,28^FH\^FD${fieldData[0]}^FS
        ^FT770,90^A0I,28,28^FH\^FD${codeString}^FS
        ^PQ1,0,1,Y^XZ`
    },    
  },
  {
    id:3, type:'template_less',
    settings: { title: 'Shipping - Add info', station_code: 'HS0-005',
      css: {station: 'stationframe'},
      station_info: {collectiontable: "shipping_unit", collectionid: "shipping_unit_number", itemtable: "box_scan", patchtable: "box", itemid:"box_number"},
      includes:['editentries'], 
    },    
  },

  {
    id:4, type:'template',
    settings: { title: 'Boxing', station_code: 'HS0-004',
      css: {station: 'stationframevertical'},
      station_info: {collectiontable: "box", collectionid: "box_number", itemtable: "loin_scan", patchtable: "loin", itemid:"loin_number"},
      includes: ['packingstation'],
      lists: {items: 5},
      forms: {collectionform: 0}, 
      dropdowns: {collectiondropdown: 0},
      onLabel: ["box_number", "size", "grade", "pieces", "weight", "case_number", "lot_number", "harvester_code"], 
      packingconfig: {id: 0},
      printurl: 'http://10.10.40.31:3000/',
      printString: (codeString, fieldData) => 
        `^XA~TA000~JSN^LT0^MNW^MTD^PON^PMN^LH0,0^JMA^PR4,4~SD15^LRN^CI0
        ^MMP
        ^PW812
        ^LL0406
        ^LS0
        ^BY208,208^FT765,153^BXI,4,200,52,52,1,~
        ^FH\^FD${codeString}^FS
        ^FT519,120^A0I,28,28^FH\^FD${'int. lot code: ' + fieldData[4]}^FS
        ^FT519,178^A0I,28,28^FH\^FD${'Pieces: ' + fieldData[3]}^FS
        ^FT519,236^A0I,28,28^FH\^FD${'Weight: ' + fieldData[2] + 'kg'}^FS
        ^FT519,294^A0I,28,28^FH\^FD${'Size: ' + fieldData[1]}^FS
        ^FT519,352^A0I,28,28^FH\^FD${'Case #: ' + fieldData[0]}^FS
        ^FT770,90^A0I,28,28^FH\^FD${codeString}^FS
        ^PQ1,0,1,Y^XZ`
    },    
  },
  {
    id:5, type:'template',
    settings: { title: 'Shipping', station_code: 'HS0-005',
      css: {station: 'stationframevertical'},
      station_info: {collectiontable: "shipping_unit", collectionid: "shipping_unit_number", itemtable: "box_scan", patchtable: "box", itemid:"box_number"},
      includes:['packingstation'],
      lists: {items: 6},
      forms: {collectionform: 4},
      dropdowns: {collectiondropdown: 1},
      packingconfig: {id: 1}
    },    
  },
  {
    id:6, type:'template',
    settings: { title: 'Trimming', station_code: 'HS0-002',
      css: {station: 'stationframevertical'},
      station_info: {collectiontable: "harvester_lot", collectionid: "lot_number", itemtotals:"scan_total", itemtable: "scan", itemquery: "lot_number"},
      includes:['loadcurrent', 'weighstation'],
      lists: {items: 1, totals: 4},
      forms: {scanform: 8}
    },    
  },
  {
    id:7, type:'template',
    settings: { title: 'Receiving', station_code: 'HS0-001',
      css: {station: 'stationframevertical'},
      station_info: {collectiontable: "harvester_lot", collectionid: "lot_number", itemtotals:"scan_total", itemtable: "scan", itemquery: "lot_number"},
      includes:['loadcurrent', 'weighstation'], 
      lists: {items: 0, totals: 3},
      forms: {scanform: 7}
    },    
  },
  {
    id:8, type:'template',
    settings: { title: 'Retouching', station_code: 'HS0-003',
      css: {station: 'stationframevertical'},
      station_info: {collectiontable: "harvester_lot", collectionid: "lot_number", itemtotals:"scan_total", itemtable: "loin_scan", itemquery: "lot_number"},
      includes:['selectcollection', 'weighstation'],
      lists: {items: 2, totals: 4},
      forms: {scanform: 8}, 
      prevStation: 'HS0-002', 
      onLabel: ['loin_number'],
      printurl: 'http://10.10.40.31:3000/',
      printString: (codeString, fieldData) => 
        `^XA~TA000~JSN^LT0^MNW^MTD^PON^PMN^LH0,0^JMA^PR4,4~SD15^LRN^CI0
        ^MMP
        ^PW812
        ^LL0406
        ^LS0
        ^BY208,208^FT765,153^BXI,4,200,52,52,1,~
        ^FH\^FD${codeString}^FS
        ^FT519,120^A0I,28,28^FH\^FD${fieldData[4]}^FS
        ^FT519,178^A0I,28,28^FH\^FD${fieldData[3]}^FS
        ^FT519,236^A0I,28,28^FH\^FD${fieldData[2]}^FS
        ^FT519,294^A0I,28,28^FH\^FD${fieldData[1]}^FS
        ^FT519,352^A0I,28,28^FH\^FD${fieldData[0]}^FS
        ^FT770,90^A0I,28,28^FH\^FD${codeString}^FS
        ^PQ1,0,1,Y^XZ`
    },    
  },
  {
    id:9, type:'template_less',
    settings: { title: 'Receiving', station_code: 'HS0-001',
      css: {station: 'step'},
      station_info: {collectiontable: "harvester_lot", collectionid: "lot_number", itemtotals:"scan_total", itemtable: "scan", itemquery: "lot_number"},
      includes:['currentcollectionedit']
    },    
  },
  {
    id:0, type:'template_less',
    settings: { title: 'Data Analytics', station_code: 'HS0-DATA',
      css: {station: 'stationframewide'},
      station_info: {},
      includes:['analytics']
    },    
  }
];
