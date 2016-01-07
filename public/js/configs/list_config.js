'use strict';

var listconfigs = [
  { id: 0,    
    cssclass: "fill", 
    headers: ["Number", "Weight 1", "Weight 2", "Timestamp", ""], 
    fields: ["numindex", "weight_1", "weight_2", "timestamp"], 
    limit: "10000",
    order: "-timestamp", 
    arg: "serial_id", 
    button: "Remove"
  },
  { id: 1,    
    cssclass: "fill", 
    headers: ["Number", "Weight", "Grade", "Timestamp", ""], 
    fields: ["numindex", "weight_1", "grade", "timestamp"], 
    limit: "10000",
    order: "-timestamp", 
    arg: "serial_id", 
    button: "Remove"
  },
  { id: 2,    
    cssclass: "fill", 
    headers: ["Number", "Weight", "Grade", "Timestamp", ""], 
    fields: ["numindex", "weight_1", "grade", "timestamp"], 
    limit: "10000",
    order: "-timestamp", 
    arg: "loin_number", 
    button: "Remove"
  },
  { id: 3,    
    cssclass: "fill",  
    fields: ["state", "weight1", "weight2", "pieces"], 
    limit: "10000",
    order: "", 
  },
  { id: 4,    
    cssclass: "fill",  
    fields: ["grade", "weight1", "pieces"], 
    limit: "10000",
    order: "grade", 
  },
  { id: 5,    
    cssclass: "fill small", 
    headers: ["Internal Lot Code", "Loin Number", "Grade", "Weight", ""], 
    fields: ["internal_lot_code", "loin_number", "weight_1", "grade"], 
    limit: "20",
    order: "-timestamp", 
    arg: "loin_number", 
    button: "Remove"
  },
  { id: 6,    
    cssclass: "fill small", 
    headers: ["Box Number", "Weight", "Lot Number", "Case Number", ""], 
    fields: ["box_number", "weight", "lot_number", "case_number"], 
    limit: "10000",
    order: "-timestamp", 
    arg: "box_number", 
    button: "Remove"
  },
  { id: 7,    
    cssclass: "fill small", 
    headers: ["Loin Number", "Weight", "Grade", "Lot Number", "Internal Lot Code", "Supplier Group","Supplier", "Fleet", ""], 
    fields: ["loin_number", "weight_1", "grade", "lot_number", "internal_lot_code", "supplier_group", "supplier", "fleet_vessel"], 
    limit: "10000",
    order: "-timestamp", 
    arg: "loin_number", 
    arg2: "internal_lot_code", 
    button: "Reprint"
  },
  { id: 8,    
    cssclass: "fill small", 
    headers: ["Box Number", "Harvester Code"], 
    fields: ["box_number", "harvester_code"], 
    limit: "10000",
    order: "-timestamp", 
    arg: "box_number",  
    button: "Remove"
  },
  { id: 9,    
    cssclass: "fill small", 
    headers: ["Box Number", "Product Code", "Trade Unit"], 
    fields: ["box_number", "product_code", "trade_unit"], 
    limit: "10000",
    order: "-timestamp", 
    arg: "box_number",  
    button: "Remove"
  }


];


var dropdownconfigs = [
  { id: 0, 
    title: "Recent Cases", 
    limit: "5",
    order: "-timestamp", 
    arg: "box_number", 
    fields: ["case_number"]
  },
  { id: 1, 
    title: "Recent Shipments", 
    limit: "5",
    order: "-timestamp", 
    arg: "shipping_unit_number", 
    fields: ["po_number"]
  },
  { id: 2, 
    title: "Recent Lots", 
    limit: "5",
    order: "-timestamp", 
    arg: "lot_number", 
    fields: ["internal_lot_code"]
  }

];


var displayconfigs = [
  { id: 0, 
    layout: [[{'name':'P.O. Number', 'val':'po_number'}, {'name':'Customer', 'val':'customer'}], 
      [{'name':'Container Number', 'val':'container_number'}]]
  },
  { id: 1, 
    layout: [[{'name':'P.O. Number', 'val':'po_number'}, {'name':'Received From', 'val':'received_from'}], 
      [{'name':'Vessel Name', 'val':'vessel_name'}]]
  },
  { id: 2, 
    layout: [[{'name':'Case Number', 'val':'case_number'}], 
      [{'name':'', 'val':'size'}, {'name':'', 'val':'grade'}, {'name':'', 'val':'weight'}, {'name':'', 'val':'pieces'}],
      [{'name':'Best Before', 'val':'best_before_date'}],
      [{'name':'Internal Lot Number', 'val':'internal_lot_code'}, {'name':'Timestamp', 'val':'timestamp'}]]
  },
  { id: 3, 
    layout: [[{'name':'Lot', 'val':'internal_lot_code'}]]
  }
];

