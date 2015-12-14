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
    headers: ["Lot Number", "Internal Lot Code", "Loin Number", "Grade", "Weight", ""], 
    fields: ["lot_number", "internal_lot_code", "loin_number", "weight_1", "grade"], 
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
  }

];