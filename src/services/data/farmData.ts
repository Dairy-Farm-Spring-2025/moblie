export interface Pen {
  id: string;
  number: string; // e.g., "P1", "P2"
  status: 'occupied' | 'empty' | 'needs_attention';
  cowId?: string; // Optional, if occupied
  width: number; // in meters
  height: number; // in meters
  x?: number; // Optional x-position in meters within the area (default calculated)
  y?: number; // Optional y-position in meters within the area (default calculated)
}

export interface Area {
  id: string;
  name: string;
  width: number; // in meters
  height: number; // in meters
  pens: Pen[];
}
export const farmData: Area[] = [
  {
    id: '1',
    name: 'Milking Area',
    width: 20, // 20m wide
    height: 10, // 10m high
    pens: [
      { id: 'p1', number: 'P1', status: 'occupied', cowId: 'C001', width: 2, height: 2 },
      { id: 'p2', number: 'P2', status: 'empty', width: 2, height: 2 },
      { id: 'p3', number: 'P3', status: 'needs_attention', width: 2, height: 2 },
      { id: 'p4', number: 'P4', status: 'occupied', cowId: 'C002', width: 2, height: 2 },
      { id: 'p5', number: 'P5', status: 'occupied', cowId: 'C005', width: 2, height: 2 },
      { id: 'p6', number: 'P6', status: 'empty', width: 2, height: 2 },
      { id: 'p7', number: 'P7', status: 'needs_attention', width: 2, height: 2 },
      { id: 'p8', number: 'P8', status: 'occupied', cowId: 'C006', width: 2, height: 2 },
      { id: 'p9', number: 'P9', status: 'empty', width: 2, height: 2 },
      { id: 'p10', number: 'P10', status: 'occupied', cowId: 'C007', width: 2, height: 2 },
      { id: 'p11', number: 'P11', status: 'needs_attention', width: 2, height: 2 },
      { id: 'p12', number: 'P12', status: 'empty', width: 2, height: 2 },
      { id: 'p13', number: 'P13', status: 'occupied', cowId: 'C008', width: 2, height: 2 },
      { id: 'p14', number: 'P14', status: 'occupied', cowId: 'C009', width: 2, height: 2 },
      { id: 'p15', number: 'P15', status: 'empty', width: 2, height: 2 },
      { id: 'p16', number: 'P16', status: 'needs_attention', width: 2, height: 2 },
    ],
  },
  {
    id: '2',
    name: 'Resting Area',
    width: 12, // 12m wide
    height: 8, // 8m high
    pens: [
      { id: 'p17', number: 'P17', status: 'occupied', cowId: 'C003', width: 2, height: 2 },
      { id: 'p18', number: 'P18', status: 'empty', width: 2, height: 2 },
      { id: 'p19', number: 'P19', status: 'empty', width: 2, height: 2 },
      { id: 'p20', number: 'P20', status: 'occupied', cowId: 'C010', width: 2, height: 2 },
      { id: 'p21', number: 'P21', status: 'needs_attention', width: 2, height: 2 },
      { id: 'p22', number: 'P22', status: 'occupied', cowId: 'C011', width: 2, height: 2 },
      { id: 'p23', number: 'P23', status: 'empty', width: 2, height: 2 },
      { id: 'p24', number: 'P24', status: 'occupied', cowId: 'C012', width: 2, height: 2 },
      { id: 'p25', number: 'P25', status: 'empty', width: 2, height: 2 },
      { id: 'p26', number: 'P26', status: 'needs_attention', width: 2, height: 2 },
      { id: 'p27', number: 'P27', status: 'occupied', cowId: 'C013', width: 2, height: 2 },
      { id: 'p28', number: 'P28', status: 'empty', width: 2, height: 2 },
    ],
  },
  {
    id: '3',
    name: 'Feeding Area',
    width: 10, // 10m wide
    height: 10, // 10m high
    pens: [
      { id: 'p29', number: 'P29', status: 'occupied', cowId: 'C004', width: 2, height: 2 },
      { id: 'p30', number: 'P30', status: 'needs_attention', width: 2, height: 2 },
      { id: 'p31', number: 'P31', status: 'empty', width: 2, height: 2 },
      { id: 'p32', number: 'P32', status: 'occupied', cowId: 'C014', width: 2, height: 2 },
      { id: 'p33', number: 'P33', status: 'occupied', cowId: 'C015', width: 2, height: 2 },
      { id: 'p34', number: 'P34', status: 'empty', width: 2, height: 2 },
      { id: 'p35', number: 'P35', status: 'needs_attention', width: 2, height: 2 },
      { id: 'p36', number: 'P36', status: 'occupied', cowId: 'C016', width: 2, height: 2 },
      { id: 'p37', number: 'P37', status: 'empty', width: 2, height: 2 },
      { id: 'p38', number: 'P38', status: 'occupied', cowId: 'C017', width: 2, height: 2 },
      { id: 'p39', number: 'P39', status: 'needs_attention', width: 2, height: 2 },
      { id: 'p40', number: 'P40', status: 'empty', width: 2, height: 2 },
    ],
  },
];
