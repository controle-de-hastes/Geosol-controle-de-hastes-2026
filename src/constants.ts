import { Category } from './types';

export interface Product {
  codigo: string;
  produto: string;
  categoria: Category;
}

export const PRODUCTS: Product[] = [
  { codigo: '290200029', produto: 'HASTE HQ 1,50M - RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '290200028', produto: 'HASTE HQ 2,92M RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '290200001', produto: 'HASTE HQ 3,00M NOVA', categoria: 'Hastes Novas' },
  { codigo: '290200018', produto: 'HASTE HRQ 3,00 MT', categoria: 'Hastes Novas' },
  { codigo: '280200028', produto: 'HASTE NQ 1,50M - NOVA', categoria: 'Hastes Novas' },
  { codigo: '280200021', produto: 'HASTE NQ 1,50M - RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '280200027', produto: 'HASTE NQ 2,92M RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '280200004', produto: 'HASTE NQ 3,00M NOVA', categoria: 'Hastes Novas' },
  { codigo: '330200014', produto: 'HASTE PQ 1,50M', categoria: 'Hastes Novas' },
  { codigo: '330200026', produto: 'HASTE PQ 2,80M RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '330200010', produto: 'HASTE PQ 3,00M', categoria: 'Hastes Novas' },
  { codigo: '300200017', produto: 'HASTE BQ 3,00M', categoria: 'Hastes Novas' },
  { codigo: '290100009', produto: 'REVESTIMENTO HW  3,00M NOVO', categoria: 'Revestimentos HW' },
  { codigo: '290100001', produto: 'REVESTIMENTO HW 0,00M-0,74M', categoria: 'Revestimentos HW' },
  { codigo: '290100003', produto: 'REVESTIMENTO HW 1,25M-1,74M', categoria: 'Revestimentos HW' },
  { codigo: '290100004', produto: 'REVESTIMENTO HW 2,25M-3,00M RECUPERADO', categoria: 'Revestimentos HW' },
  { codigo: '280100009', produto: 'REVESTIMENTO NW 2,25M - 3,00M RECUPERADO', categoria: 'Revestimentos NW' },
  { codigo: '280100004', produto: 'REVESTIMENTO NW 3,00M -NOVO', categoria: 'Revestimentos NW' },
  { codigo: '280200015', produto: 'HASTE NQ 3,00M (USADA)', categoria: 'Hastes Usadas' },
  { codigo: '290200016', produto: 'HASTE HQ 3,00M (USADA)', categoria: 'Hastes Usadas' },
];

export interface SondaMapping {
  tag: string; // Equipamento
  descricao: string;
  modelo: string;
}

export const SONDAS: SondaMapping[] = [
  {
    "tag": "SAA921",
    "descricao": "SONDA PERCUSSORA",
    "modelo": "PERCUSSORA"
  },
  {
    "tag": "SAA924",
    "descricao": "SONDA PERCUSSORA MODELO HD-80S",
    "modelo": "HD-80S"
  },
  {
    "tag": "SAA925",
    "descricao": "SONDA PERCUSSORA MODELO HD-80S",
    "modelo": "HD-80S"
  },
  {
    "tag": "SAA926",
    "descricao": "SONDA ROT.DIAM.SUP.HID.SDH-400",
    "modelo": "SDH-400"
  },
  {
    "tag": "SAA927",
    "descricao": "SONDA ROT.DIAM.SUP.HID.LX6",
    "modelo": "LX6"
  },
  {
    "tag": "SAA928",
    "descricao": "SONDA ROT.DIAM.SUP.HID.LX6",
    "modelo": "LX6"
  },
  {
    "tag": "SAA929",
    "descricao": "SONDA ROT.DIAM.SUP.HID.LX6",
    "modelo": "LX6"
  },
  {
    "tag": "SAA930",
    "descricao": "SONDA ROT.DIAM.SUP.HID.LX6",
    "modelo": "LX6"
  },
  {
    "tag": "SAA938",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSH939",
    "descricao": "SONDA SUPERFICIE HIDR. BIOSONDA",
    "modelo": "BIO1500"
  },
  {
    "tag": "SAA943",
    "descricao": "SONDA SUPERFICIE HID BIOSONDA",
    "modelo": "BIO1500"
  },
  {
    "tag": "SSH946",
    "descricao": "SONDA SUPERFICIE HIDR. BIOSONDA",
    "modelo": "BIO1500"
  },
  {
    "tag": "SSH956",
    "descricao": "SONDA ROT. AUTOPROP. DG-1500",
    "modelo": "DG-1500"
  },
  {
    "tag": "SSA160",
    "descricao": "SONDA AIR CORE DIAMANTUL",
    "modelo": "AIR CORE"
  },
  {
    "tag": "SSA161",
    "descricao": "SONDA AIR CORE WIRTH B1A",
    "modelo": "AIR CORE"
  },
  {
    "tag": "SSA163",
    "descricao": "SONDA AIR CORE PROMINAS R1H",
    "modelo": "AIR CORE"
  },
  {
    "tag": "SSA164",
    "descricao": "SONDA AIR CORE PROMINAS R1H",
    "modelo": "AIR CORE"
  },
  {
    "tag": "SSA166",
    "descricao": "SONDA AIR CORE MACHGEO 7200E",
    "modelo": "AIR CORE"
  },
  {
    "tag": "SSM074",
    "descricao": "SONDA ROT.DIAM.SUP. BBS-56",
    "modelo": "BBS-56"
  },
  {
    "tag": "SSM095",
    "descricao": "SONDA ROT.DIAM.SUP. BBS-56",
    "modelo": "BBS-56"
  },
  {
    "tag": "SSM148",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM201",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM202",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM203",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM204",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM205",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM207",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM208",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM212",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM213",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM214",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM216",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM218",
    "descricao": "SONDA ROT.DIAM.SUP. LY44",
    "modelo": "LY44"
  },
  {
    "tag": "SSM219",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM220",
    "descricao": "SONDA ROT.DIAM.SUP. SS61",
    "modelo": "SS61"
  },
  {
    "tag": "SSM221",
    "descricao": "SONDA ROT.DIAM.SUP. BBS56",
    "modelo": "BBS-56"
  },
  {
    "tag": "SSM222",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM223",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM224",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM225",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM226",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM227",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM228",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM229",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM230",
    "descricao": "SONDA ROT.DIAM.SUP. MACH",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM232",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM233",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM234",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM236",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM237",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM238",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM239",
    "descricao": "SONDA ROT.DIAM.SUP. LY44",
    "modelo": "LY44"
  },
  {
    "tag": "SSM240",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM241",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM242",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM243",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM244",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM245",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM246",
    "descricao": "SONDA ROT.DIAM.SUP. LY38",
    "modelo": "LY38"
  },
  {
    "tag": "SSM247",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM248",
    "descricao": "SONDA ROT.DIAM.SUP. LY50",
    "modelo": "LY50"
  },
  {
    "tag": "SSM250",
    "descricao": "SONDA ROT.DIAM.SUP. BBS56",
    "modelo": "BBS-56"
  },
  {
    "tag": "SSM251",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM252",
    "descricao": "SONDA ROT.DIAM.SUP. BBS56",
    "modelo": "BBS-56"
  },
  {
    "tag": "SSM254",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM255",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM258",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM259",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM260",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM261",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM262",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM264",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320T",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM265",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM266",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM267",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM268",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM269",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM270",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM271",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM272",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM273",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM274",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM275",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM276",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM277",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM278",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM279",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM280",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM281",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM282",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM283",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM284",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM285",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM286",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM287",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM288",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM289",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM290",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM291",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM292",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM293",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM294",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM295",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM296",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM298",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM299",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM300",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM302",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM303",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM304",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM305",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM306",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM307",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM308",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM309",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM310",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM311",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM312",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM313",
    "descricao": "SONDA ROT.DIAM.SUP. MACH320",
    "modelo": "MACH320"
  },
  {
    "tag": "SSM316",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM317",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM318",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM319",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM320",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM321",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM323",
    "descricao": "SONDA ROT.DIAM.SUP. LY50",
    "modelo": "LY50"
  },
  {
    "tag": "SSM324",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM325",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM326",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM327",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM329",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM330",
    "descricao": "SONDA ROT.DIAM.SUP. LY50",
    "modelo": "LY50"
  },
  {
    "tag": "SSM331",
    "descricao": "SONDA ROT.DIAM.SUP. LY50",
    "modelo": "LY50"
  },
  {
    "tag": "SSM332",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM333",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM334",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM335",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM336",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM337",
    "descricao": "SONDA ROT.DIAM.SUP. MACH1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM910",
    "descricao": "SONDA ROT.DIAM.SUP. MACH 1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSM911",
    "descricao": "SONDA ROT.DIAM.SUP. MACH 1200",
    "modelo": "MACH1200"
  },
  {
    "tag": "SSH506",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH507",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH508",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH509",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH510",
    "descricao": "SONDA ROT.DIAM.SUP.HID.HYDRACORE",
    "modelo": "HIDRACORE"
  },
  {
    "tag": "SSH511",
    "descricao": "SONDA ROT.DIAM.SUP.HID.HYDRACORE",
    "modelo": "HIDRACORE"
  },
  {
    "tag": "SSH512",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH513",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH514",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH515",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH516",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS4002",
    "modelo": "CS4002"
  },
  {
    "tag": "SSH517",
    "descricao": "SONDA PERCUSSORA HID.CS",
    "modelo": "CS4002"
  },
  {
    "tag": "SSH518",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH519",
    "descricao": "SONDA ROT.DIAM.SUP. HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH521",
    "descricao": "SONDA ROT.DIAM.SUP.HID.LF",
    "modelo": "LF70"
  },
  {
    "tag": "SSH522",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "DISCOVERY"
  },
  {
    "tag": "SSH523",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LF70",
    "modelo": "LF70"
  },
  {
    "tag": "SSH524",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH525",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH526",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CT20",
    "modelo": "CT20"
  },
  {
    "tag": "SSH527",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH528",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH529",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH530",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH531",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH532",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH533",
    "descricao": "SONDA ROT.DIAM.SUP.HID.LF70",
    "modelo": "LF70"
  },
  {
    "tag": "SSH534",
    "descricao": "SONDA ROT.DIAM.SUP.HID.LF70",
    "modelo": "LF70"
  },
  {
    "tag": "SSH535",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LF230",
    "modelo": "LF230"
  },
  {
    "tag": "SSH536",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LF230",
    "modelo": "LF230"
  },
  {
    "tag": "SSH537",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH538",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH540",
    "descricao": "SONDA ROT.DIAM.SUP. HYDRACORE",
    "modelo": "HIDRACORE"
  },
  {
    "tag": "SSH544",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LF230",
    "modelo": "LF230"
  },
  {
    "tag": "SSH545",
    "descricao": "SONDA ROT.DIAM.SUP.HID. T4W",
    "modelo": "T4W CRANE"
  },
  {
    "tag": "SSH546",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH547",
    "descricao": "SONDA ROT.DIAM.SUP. LF70 EST.",
    "modelo": "LF70"
  },
  {
    "tag": "SSH548",
    "descricao": "SONDA ROT.DIAM.SUP. LF70 EST.",
    "modelo": "LF70"
  },
  {
    "tag": "SSH549",
    "descricao": "SONDA ROT.DIAM.SUP. LF70 EST.",
    "modelo": "LF70"
  },
  {
    "tag": "SSH550",
    "descricao": "SONDA HID. LF90 PLAT.",
    "modelo": "LF90"
  },
  {
    "tag": "SSH551",
    "descricao": "SONDA HID. LF90 PLAT.",
    "modelo": "LF90"
  },
  {
    "tag": "SSH553",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LF230",
    "modelo": "LF230"
  },
  {
    "tag": "SSH555",
    "descricao": "SONDA ROT.DIAM.SUP.HID.LF70",
    "modelo": "LF70"
  },
  {
    "tag": "SSH556",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH557",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH558",
    "descricao": "SONDA ROT.DIAM.SUP.HID.MED.PORTE",
    "modelo": "SHMP1500"
  },
  {
    "tag": "SSH559",
    "descricao": "SONDA ROT.DIAM.SUP.HID.MED.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH560",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH561",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH562",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH563",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH564",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH565",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH566",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH567",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH568",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14 ",
    "modelo": "CS14"
  },
  {
    "tag": "SSH569",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH570",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH571",
    "descricao": "SONDA ROT.DIAM.SUP.HID. S",
    "modelo": "S41"
  },
  {
    "tag": "SSH572",
    "descricao": "SONDA ROT.DIAM.SUP.HID. B",
    "modelo": "B20"
  },
  {
    "tag": "SSH573",
    "descricao": "SONDA ROT.DIAM.SUP.HID. JKS1500",
    "modelo": "JKS 1500"
  },
  {
    "tag": "SSH574",
    "descricao": "SONDA ROT.DIAM.SUP.HID. JKS1500",
    "modelo": "JKS 1500"
  },
  {
    "tag": "SSH575",
    "descricao": "SONDA ROT.DIAM.SUP.HID. JKS1500",
    "modelo": "JKS 1500"
  },
  {
    "tag": "SSH576",
    "descricao": "SONDA ROT.DIAM.SUP.HID. JKS1500",
    "modelo": "JKS 1500"
  },
  {
    "tag": "SSH577",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH578",
    "descricao": "SONDA ROT.DIAM.SUP.HID. JKS1500",
    "modelo": "JKS 1500"
  },
  {
    "tag": "SSH579",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH580",
    "descricao": "SONDA ROT.DIAM.SUP.HID. JKS1500",
    "modelo": "JKS 1500"
  },
  {
    "tag": "SSH581",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH582",
    "descricao": "SONDA ROT.DIAM.SUP.HID. JKS1500",
    "modelo": "JKS 1500"
  },
  {
    "tag": "SSH583",
    "descricao": "SONDA ROT.DIAM.SUP.HID. W300",
    "modelo": "W300"
  },
  {
    "tag": "SSH584",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH585",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ. P.",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH586",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH587",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH588",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH589",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH590",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH591",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH592",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH593",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH594",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH595",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH596",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH597",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH598",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH599",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH600",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH601",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH602",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH603",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "MP500"
  },
  {
    "tag": "SSH604",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "MP500"
  },
  {
    "tag": "SSH605",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH606",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH607",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH608",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH609",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH610",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH611",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH612",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH613",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH614",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH615",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH616",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH617",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH618",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH619",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH620",
    "descricao": "SONDA ROT.DIAM.SUP.HID.PEQ.PORTE",
    "modelo": "SHPP1500"
  },
  {
    "tag": "SSH621",
    "descricao": "SONDA DE PERFORMACE RC",
    "modelo": "EDM 95K-RC"
  },
  {
    "tag": "SSH622",
    "descricao": "SONDA DE PERFORMACE RC",
    "modelo": "EDM 95K-RC"
  },
  {
    "tag": "SSH623",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH624",
    "descricao": "SONDA ROT.DIAM.SUP.HID.CT14",
    "modelo": "CT14"
  },
  {
    "tag": "SSH625",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "MP500"
  },
  {
    "tag": "SSH626",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "MP500"
  },
  {
    "tag": "SSH627",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "MP500"
  },
  {
    "tag": "SSH628",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "MP500"
  },
  {
    "tag": "SSH629",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "MP500"
  },
  {
    "tag": "SSH630",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "MP500"
  },
  {
    "tag": "SSH631",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "CORE DRILL"
  },
  {
    "tag": "SSH632",
    "descricao": "SONDA ROT.DIAM.SUP.HID.DISCOVERY",
    "modelo": "CORE DRILL"
  },
  {
    "tag": "SSH633",
    "descricao": "SONDA ROT.DIAM.SUP.HID.RC PRD-OZ",
    "modelo": "PRD-OZ"
  },
  {
    "tag": "SSH904",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH906",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LF230",
    "modelo": "LF230"
  },
  {
    "tag": "SSH907",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LF230",
    "modelo": "LF230"
  },
  {
    "tag": "SSH908",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LF230",
    "modelo": "LF230"
  },
  {
    "tag": "SSH909",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14 ",
    "modelo": "CS14"
  },
  {
    "tag": "SSH913",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14 ",
    "modelo": "CS14"
  },
  {
    "tag": "SSH914",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14 ",
    "modelo": "CS14"
  },
  {
    "tag": "SSH915",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14 ",
    "modelo": "CS14"
  },
  {
    "tag": "SSH916",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LF230",
    "modelo": "LF230"
  },
  {
    "tag": "SSH917",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14 ",
    "modelo": "CS14"
  },
  {
    "tag": "SSH918",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS14",
    "modelo": "CS14"
  },
  {
    "tag": "SSH919",
    "descricao": "SONDA HID. LF90 PLAT.",
    "modelo": "LF90"
  },
  {
    "tag": "SSH920",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS4002",
    "modelo": "CS4002"
  },
  {
    "tag": "SSH921",
    "descricao": "SONDA ROT.DIAM.SUP.HID. CS4002",
    "modelo": "CS4002"
  },
  {
    "tag": "SSH922",
    "descricao": "SONDA ROT.DIAM.SUP.HID. LX6",
    "modelo": "LX6"
  },
  {
    "tag": "SSH1502",
    "descricao": "SONDA ROT.DIAM.SUP.HID. JKS1500",
    "modelo": "JKS 1500"
  },
  {
    "tag": "SBH400",
    "descricao": "SONDA ROT.DIAM.SUB. DIAMEC252",
    "modelo": "DIAMEC 252"
  },
  {
    "tag": "SBH401",
    "descricao": "SONDA ROT.DIAM.SUB. DIAMEC232",
    "modelo": "DIAMEC 232"
  },
  {
    "tag": "SBH402",
    "descricao": "SONDA ROT.DIAM.SUB BOYLES B15",
    "modelo": "B15"
  },
  {
    "tag": "SBH403",
    "descricao": "SONDA ROT.DIAM.SUB BOYLES B15",
    "modelo": "B15"
  },
  {
    "tag": "SBH404",
    "descricao": "SONDA ROT.DIAM.SUB. BOYLES B20",
    "modelo": "B20"
  },
  {
    "tag": "SBH405",
    "descricao": "SONDA ROT.DIAM.SUB. BOYLES B20",
    "modelo": "B20"
  },
  {
    "tag": "SBH406",
    "descricao": "SONDA ROT.DIAM.SUB. DIAMEC252",
    "modelo": "DIAMEC 252"
  },
  {
    "tag": "SBH407",
    "descricao": "SONDA ROT.DIAM.SUB. DMC232 GSL",
    "modelo": "DIAMEC 232"
  },
  {
    "tag": "SBH408",
    "descricao": "SONDA ROT.DIAM.SUB. DMC252 GSL",
    "modelo": "DIAMEC 252"
  },
  {
    "tag": "SBH409",
    "descricao": "SONDA ROT.DIAM.SUB. DMC232 GSL",
    "modelo": "DIAMEC 232"
  },
  {
    "tag": "SBH410",
    "descricao": "SONDA ROT.DIAM.SUB. DMC232 GSL",
    "modelo": "DIAMEC 232"
  },
  {
    "tag": "SBH411",
    "descricao": "SONDA ROT.DIAM.SUB. DMC U6",
    "modelo": "DIAMEC U6"
  },
  {
    "tag": "SBH412",
    "descricao": "SONDA ROT.DIAM.SUB BOYLES B10",
    "modelo": "B10"
  },
  {
    "tag": "SBH414",
    "descricao": "SONDA ROT.DIAM.SUB.DMC.U6",
    "modelo": "DIAMEC U6"
  },
  {
    "tag": "SBH415",
    "descricao": "SONDA ROT.DIAM.SUB.DE130",
    "modelo": "DE130"
  },
  {
    "tag": "SBH416",
    "descricao": "SONDA ROT.DIAM.SUB.U-4",
    "modelo": "U-4"
  },
  {
    "tag": "SBH417",
    "descricao": "SONDA ROT.DIAM.SUB.DG-1500 IP",
    "modelo": "DG-1500"
  },
  {
    "tag": "SBH418",
    "descricao": "SONDA ROT.DIAM.SUB.DG-1500 IP",
    "modelo": "DG-1500"
  }
];
