create view reprint_table as 
SELECT loin.loin_number,
    max(scan."timestamp") AS "timestamp",
    scan.box_number,
    lot.lot_number,
    scan.station_code,
    loin.grade,
    loin.weight_1,
    lot.internal_lot_code,
    harvester.ft_fa_code
   FROM scan,
    loin, lot, harvester
  WHERE scan.loin_number::text = loin.loin_number::text 
  and lot.lot_number = loin.lot_number
  and harvester.harvester_code = lot.harvester_code
  GROUP BY loin.loin_number, scan.box_number, lot.lot_number, 
  loin.grade, loin.weight_1, scan.station_code, lot.internal_lot_code, harvester.ft_fa_code;

  alter view reprint_table owner to tuna_processor;
