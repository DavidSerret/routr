import type { CuratedAirport } from './staticData';
import type { AirportGroupResult } from './types';
import { countryCodeToFlag } from './airportUtils';

interface RegionDef {
  label: string;
  emoji: string;
  type: 'continent' | 'subregion';
  countryCodes: string[];
}

const REGIONS: Record<string, RegionDef> = {
  // Continents
  europe:            { label: 'Europe',        emoji: '🌍', type: 'continent',  countryCodes: ['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','XK','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','UA','GB','VA'] },
  europa:            { label: 'Europe',        emoji: '🌍', type: 'continent',  countryCodes: ['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','XK','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','UA','GB','VA'] },
  'north america':   { label: 'North America', emoji: '🌎', type: 'continent',  countryCodes: ['US','CA','MX','GT','BZ','HN','SV','NI','CR','PA'] },
  'america del norte': { label: 'North America', emoji: '🌎', type: 'continent', countryCodes: ['US','CA','MX','GT','BZ','HN','SV','NI','CR','PA'] },
  'south america':   { label: 'South America', emoji: '🌎', type: 'continent',  countryCodes: ['BR','AR','CL','CO','PE','VE','EC','BO','PY','UY','GY','SR','GF'] },
  'america del sur': { label: 'South America', emoji: '🌎', type: 'continent',  countryCodes: ['BR','AR','CL','CO','PE','VE','EC','BO','PY','UY','GY','SR','GF'] },
  'latin america':   { label: 'Latin America', emoji: '🌎', type: 'continent',  countryCodes: ['MX','GT','BZ','HN','SV','NI','CR','PA','CU','DO','PR','HT','JM','TT','BB','LC','VC','GD','AG','DM','KN','BS','BR','AR','CL','CO','PE','VE','EC','BO','PY','UY'] },
  latinoamerica:     { label: 'Latin America', emoji: '🌎', type: 'continent',  countryCodes: ['MX','GT','BZ','HN','SV','NI','CR','PA','CU','DO','PR','HT','JM','TT','BB','LC','VC','GD','AG','DM','KN','BS','BR','AR','CL','CO','PE','VE','EC','BO','PY','UY'] },
  asia:              { label: 'Asia',          emoji: '🌏', type: 'continent',  countryCodes: ['CN','JP','KR','IN','TH','VN','ID','MY','SG','PH','TW','HK','MO','BD','PK','LK','MM','KH','LA','BN','MN','NP','AF','KZ','UZ','TM','TJ','KG','AZ','AM','GE','TR','IL','JO','LB','SY','IQ','IR','SA','AE','OM','YE','KW','QA','BH'] },
  africa:            { label: 'Africa',        emoji: '🌍', type: 'continent',  countryCodes: ['MA','DZ','TN','LY','EG','SN','ML','BF','GN','CI','GH','NG','CM','CD','ET','KE','TZ','UG','RW','ZA','MZ','ZW','ZM','AO','NA','BW','MG','MU','SC','CV','MR','NE','TD','SD','SO','DJ','ER','SS','CF','CG','GA','GQ','ST','SL','LR','GM','GW','TG','BJ','BI','MW','LS','SZ'] },
  oceania:           { label: 'Oceania',       emoji: '🌏', type: 'continent',  countryCodes: ['AU','NZ','FJ','PG','SB','VU','WS','TO','KI','FM','MH','PW','NR','TV'] },
  // Sub-regions
  'southeast asia':      { label: 'Southeast Asia',    emoji: '🌏', type: 'subregion', countryCodes: ['TH','VN','ID','MY','SG','PH','MM','KH','LA','BN','TL'] },
  'sudeste asiatico':    { label: 'Southeast Asia',    emoji: '🌏', type: 'subregion', countryCodes: ['TH','VN','ID','MY','SG','PH','MM','KH','LA','BN','TL'] },
  'middle east':         { label: 'Middle East',       emoji: '🌍', type: 'subregion', countryCodes: ['AE','SA','QA','KW','BH','OM','YE','JO','IL','LB','SY','IQ','IR'] },
  'oriente medio':       { label: 'Middle East',       emoji: '🌍', type: 'subregion', countryCodes: ['AE','SA','QA','KW','BH','OM','YE','JO','IL','LB','SY','IQ','IR'] },
  caribbean:             { label: 'Caribbean',         emoji: '🏝️', type: 'subregion', countryCodes: ['CU','DO','PR','HT','JM','TT','BB','LC','VC','GD','AG','DM','KN','BS','AW','CW','BQ','SX','AI','VG','VI','KY','TC','MF','GP','MQ','BL'] },
  caribe:                { label: 'Caribbean',         emoji: '🏝️', type: 'subregion', countryCodes: ['CU','DO','PR','HT','JM','TT','BB','LC','VC','GD','AG','DM','KN','BS','AW','CW','BQ','SX','AI','VG','VI','KY','TC','MF','GP','MQ','BL'] },
  scandinavia:           { label: 'Scandinavia',       emoji: '🧊', type: 'subregion', countryCodes: ['DK','NO','SE','FI','IS'] },
  escandinavia:          { label: 'Scandinavia',       emoji: '🧊', type: 'subregion', countryCodes: ['DK','NO','SE','FI','IS'] },
  nordic:                { label: 'Nordic Countries',  emoji: '🧊', type: 'subregion', countryCodes: ['DK','NO','SE','FI','IS','EE','LV','LT'] },
  'iberian peninsula':   { label: 'Iberian Peninsula', emoji: '🌞', type: 'subregion', countryCodes: ['ES','PT','AD'] },
  'peninsula iberica':   { label: 'Iberian Peninsula', emoji: '🌞', type: 'subregion', countryCodes: ['ES','PT','AD'] },
  iberia:                { label: 'Iberian Peninsula', emoji: '🌞', type: 'subregion', countryCodes: ['ES','PT','AD'] },
  balkans:               { label: 'Balkans',           emoji: '⛰️', type: 'subregion', countryCodes: ['AL','BA','BG','HR','XK','MK','ME','RO','RS','SI'] },
  balcanes:              { label: 'Balkans',           emoji: '⛰️', type: 'subregion', countryCodes: ['AL','BA','BG','HR','XK','MK','ME','RO','RS','SI'] },
  'british isles':       { label: 'British Isles',    emoji: '🇬🇧', type: 'subregion', countryCodes: ['GB','IE'] },
  benelux:               { label: 'Benelux',          emoji: '🌷', type: 'subregion', countryCodes: ['BE','NL','LU'] },
  'baltic states':       { label: 'Baltic States',    emoji: '🌊', type: 'subregion', countryCodes: ['EE','LV','LT'] },
  'estados balticos':    { label: 'Baltic States',    emoji: '🌊', type: 'subregion', countryCodes: ['EE','LV','LT'] },
  maghreb:               { label: 'Maghreb',          emoji: '🏜️', type: 'subregion', countryCodes: ['MA','DZ','TN','LY','MR'] },
  'gulf countries':      { label: 'Gulf Countries',   emoji: '🕌', type: 'subregion', countryCodes: ['AE','SA','QA','KW','BH','OM'] },
  'paises del golfo':    { label: 'Gulf Countries',   emoji: '🕌', type: 'subregion', countryCodes: ['AE','SA','QA','KW','BH','OM'] },
};

// Priority airports per country (used for country and continent searches)
// For countries: up to 15 are used; for continents: top 3 per country
export const COUNTRY_TOP_AIRPORTS: Record<string, string[]> = {
  // Western Europe
  ES: ['MAD','BCN','AGP','PMI','ALC','VLC','SVQ','BIO','LPA','TFS','IBZ','MAH','GRO','VGO','SDR'],
  PT: ['LIS','OPO','FAO','FNC','PDL','TER','HOR','SMA'],
  DE: ['FRA','MUC','DUS','BER','HAM','STR','CGN','NUE','LEJ','HHN','DTM','FMO','ERF','SCN'],
  FR: ['CDG','ORY','NCE','LYS','MRS','BOD','NTE','TLS','LIL','MPL','BES','RNS','CFE','EGC'],
  IT: ['FCO','MXP','VCE','NAP','BLQ','CTA','PMO','BRI','TRN','BGY','PSA','FLR','AOI','BDS'],
  GB: ['LHR','LGW','MAN','STN','EDI','BHX','BRS','NCL','GLA','LPL','LBA','ABZ','BFS','EMA'],
  NL: ['AMS','EIN','RTM','MST','GRQ'],
  BE: ['BRU','CRL','LGG','ANR'],
  CH: ['ZRH','GVA','BSL','BRN'],
  AT: ['VIE','GRZ','INN','SZG','LNZ','KLU'],
  IE: ['DUB','ORK','SNN','NOC','KIR'],
  LU: ['LUX'],
  // Northern Europe
  DK: ['CPH','BLL','AAL','AAR','FAE'],
  SE: ['ARN','GOT','MMX','BMA','LLA','UME','OSD'],
  NO: ['OSL','BGO','TRD','SVG','TOS','BOO','LKL'],
  FI: ['HEL','TMP','TKU','OUL','RVN','JOE'],
  IS: ['KEF','AEY','EGS'],
  // Eastern Europe
  PL: ['WAW','KRK','GDN','KTW','WRO','POZ','LCJ','RZE'],
  CZ: ['PRG','BRQ','OSR'],
  HU: ['BUD','DEB'],
  RO: ['OTP','CLJ','TSR','IAS','SBZ','CRA'],
  BG: ['SOF','VAR','BOJ','PDV'],
  HR: ['ZAG','SPU','DBV','PUY'],
  RS: ['BEG','INI'],
  SK: ['BTS','KSC'],
  SI: ['LJU'],
  UA: ['KBP','LWO','ODS','HRK'],
  // Southern Europe
  GR: ['ATH','SKG','HER','RHO','CFU','KGS','CHQ','JTR','MJT','ZTH'],
  TR: ['IST','SAW','AYT','ADB','ESB','BJV','DLM','SZF','TZX','VAN'],
  // North America
  US: ['JFK','LAX','ORD','ATL','MIA','DFW','DEN','SFO','SEA','LAS','BOS','PHX','MCO','EWR','IAH'],
  CA: ['YYZ','YVR','YUL','YYC','YEG','YOW','YWG','YHZ','YQB','YXE'],
  MX: ['MEX','CUN','GDL','MTY','TIJ','SJD','OAX','VER','MID','HMO'],
  // Central America & Caribbean
  CR: ['SJO','LIR'],
  PA: ['PTY'],
  CU: ['HAV','VRA','HOG'],
  DO: ['SDQ','PUJ','STI'],
  // South America
  BR: ['GRU','GIG','BSB','SSA','FOR','CWB','BEL','MAO','REC','POA','MCZ','CGB','VCP'],
  AR: ['EZE','AEP','COR','MDZ','BRC','SLA','NQN','USH','IGR','CRD'],
  CL: ['SCL','PMC','CJC','IQQ','ANF','ZAL','MHC','CPO'],
  CO: ['BOG','MDE','CLO','CTG','BAQ','BGA','SMR'],
  PE: ['LIM','CUZ','AQP','TRU','PIU','IQT'],
  EC: ['UIO','GYE','CUE','MEC'],
  VE: ['CCS','MAR','VLN','BLA','PMV'],
  // Asia
  CN: ['PEK','PVG','CAN','SZX','CTU','KMG','XIY','CKG','WUH','NKG','HGH','CSX','TAO'],
  JP: ['NRT','HND','KIX','CTS','FUK','SDJ','HIJ','OKA','NGO','KMJ','OIT'],
  KR: ['ICN','GMP','PUS','CJU','TAE'],
  IN: ['DEL','BOM','BLR','MAA','CCU','HYD','AMD','COK','PNQ','GOI','IXC','BBI','JAI'],
  TH: ['BKK','DMK','HKT','CNX','USM','UTH','HDY','KKC','CEI'],
  ID: ['CGK','DPS','SUB','KNO','UPG','PLM','PNK','BPN','JOG','MDC'],
  MY: ['KUL','PEN','BKI','LGK','MYY','KBR'],
  SG: ['SIN'],
  PH: ['MNL','CEB','DVO','ILO','KLO'],
  VN: ['HAN','SGN','DAD','HPH','CXR','VCA'],
  TW: ['TPE','KHH','RMQ','TNN'],
  HK: ['HKG'],
  // Middle East
  AE: ['DXB','AUH','SHJ'],
  SA: ['RUH','JED','DMM','MED','GIZ','TUU'],
  QA: ['DOH'],
  KW: ['KWI'],
  BH: ['BAH'],
  OM: ['MCT','SLL','MSH'],
  IL: ['TLV','ETH'],
  JO: ['AMM','AQJ'],
  // Africa
  ZA: ['JNB','CPT','DUR','PLZ','BFN','ELS','GRJ'],
  EG: ['CAI','HRG','SSH','LXR','ASW','HMB','ALY'],
  MA: ['CMN','RAK','AGA','TNG','FEZ','OUD'],
  KE: ['NBO','MBA'],
  ET: ['ADD'],
  NG: ['LOS','ABV','PHC','KAN'],
  TN: ['TUN','SFA','MIR','TOE'],
  GH: ['ACC'],
  SN: ['DSS'],
  TZ: ['JRO','DAR','ZNZ'],
  CI: ['ABJ'],
  MU: ['MRU'],
  MG: ['TNR','MJN'],
  // Oceania
  AU: ['SYD','MEL','BNE','PER','ADL','CBR','OOL','HBA','DRW','CNS','TSV','MKY'],
  NZ: ['AKL','CHC','WLG','DUD','NSN','ZQN','ROT','HLZ'],
  FJ: ['NAN','SUV'],
  PG: ['POM','LAE','GKA'],
};

export function getTopAirportsForGroup(group: AirportGroupResult): string[] {
  const { airports, countryCode, groupType } = group;
  const allCodes = airports.map(a => a.code);

  if (groupType === 'subregion') {
    // Sub-regions are small (5–30 airports) — search all
    return allCodes;
  }

  if (groupType === 'country') {
    // Top 15 by national priority list
    const top = COUNTRY_TOP_AIRPORTS[countryCode] ?? [];
    const hits = top.filter(c => allCodes.includes(c)).slice(0, 15);
    return hits.length > 0 ? hits : allCodes.slice(0, 15);
  }

  // Continent: top 3 per country using COUNTRY_TOP_AIRPORTS priority
  // Countries not in the map get 1 representative airport
  const byCountry = new Map<string, string[]>();
  for (const a of airports) {
    const list = byCountry.get(a.countryCode) ?? [];
    list.push(a.code);
    byCountry.set(a.countryCode, list);
  }

  const result: string[] = [];
  for (const [cc, codes] of byCountry) {
    const top = COUNTRY_TOP_AIRPORTS[cc];
    if (top) {
      const hits = top.filter(c => codes.includes(c)).slice(0, 3);
      result.push(...(hits.length > 0 ? hits : codes.slice(0, 1)));
    } else {
      // Unknown/small country: take 1 airport as representative
      if (codes[0]) result.push(codes[0]);
    }
  }
  return result;
}

export function buildGeographicGroups(
  query: string,
  airports: CuratedAirport[]
): AirportGroupResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return [];

  const results: AirportGroupResult[] = [];
  const seen = new Set<string>();

  // 1. Region matches
  for (const [key, region] of Object.entries(REGIONS)) {
    if (!key.includes(q) && !q.includes(key)) continue;
    const regionKey = region.label;
    if (seen.has(regionKey)) continue;
    seen.add(regionKey);

    const regionAirports = airports
      .filter(a => region.countryCodes.includes(a.cc))
      .map(a => ({ code: a.code, cityCode: a.city, countryCode: a.cc }));

    if (regionAirports.length > 0) {
      results.push({
        code: `GROUP_REGION_${regionKey.toUpperCase().replace(/\s/g, '_')}`,
        name: `${region.emoji} ${region.label} — All airports (${regionAirports.length})`,
        cityName: `${regionAirports.length} airports`,
        countryCode: '',
        isGroup: true,
        groupType: region.type,
        airports: regionAirports,
      });
    }
  }

  // 2. Country matches (by country name EN/ES or ISO code)
  const matchedCcs = new Set<string>();
  for (const airport of airports) {
    const names = [airport.country, airport.country_es, airport.cc].map(n => n.toLowerCase());
    if (names.some(n => n.includes(q))) {
      matchedCcs.add(airport.cc);
    }
  }

  for (const cc of Array.from(matchedCcs).slice(0, 3)) {
    const groupCode = `GROUP_COUNTRY_${cc}`;
    if (seen.has(groupCode)) continue;
    seen.add(groupCode);

    const countryAirports = airports
      .filter(a => a.cc === cc)
      .map(a => ({ code: a.code, cityCode: a.city, countryCode: a.cc }));

    if (countryAirports.length > 0) {
      const sample = airports.find(a => a.cc === cc)!;
      const flag = countryCodeToFlag(cc);
      results.push({
        code: groupCode,
        name: `${flag} ${sample.country} — All airports (${countryAirports.length})`,
        cityName: `${countryAirports.length} airports`,
        countryCode: cc,
        isGroup: true,
        groupType: 'country',
        airports: countryAirports,
      });
    }
  }

  return results;
}
