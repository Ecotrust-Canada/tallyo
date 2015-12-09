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
  }


];
