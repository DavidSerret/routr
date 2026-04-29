import type { CuratedAirport } from './staticData';
import type { AirportGroupResult } from './types';
import { countryCodeToFlag } from './airportUtils';

interface RegionDef {
  label: string;
  emoji: string;
  countryCodes: string[];
}

const REGIONS: Record<string, RegionDef> = {
  europe: { label: 'Europe', emoji: '🌍', countryCodes: ['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','XK','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','UA','GB','VA'] },
  europa: { label: 'Europe', emoji: '🌍', countryCodes: ['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','XK','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','UA','GB','VA'] },
  'north america': { label: 'North America', emoji: '🌎', countryCodes: ['US','CA','MX','GT','BZ','HN','SV','NI','CR','PA'] },
  'america del norte': { label: 'North America', emoji: '🌎', countryCodes: ['US','CA','MX','GT','BZ','HN','SV','NI','CR','PA'] },
  'south america': { label: 'South America', emoji: '🌎', countryCodes: ['BR','AR','CL','CO','PE','VE','EC','BO','PY','UY','GY','SR','GF'] },
  'america del sur': { label: 'South America', emoji: '🌎', countryCodes: ['BR','AR','CL','CO','PE','VE','EC','BO','PY','UY','GY','SR','GF'] },
  'latin america': { label: 'Latin America', emoji: '🌎', countryCodes: ['MX','GT','BZ','HN','SV','NI','CR','PA','CU','DO','PR','HT','JM','TT','BB','LC','VC','GD','AG','DM','KN','BS','BR','AR','CL','CO','PE','VE','EC','BO','PY','UY'] },
  'latinoamerica': { label: 'Latin America', emoji: '🌎', countryCodes: ['MX','GT','BZ','HN','SV','NI','CR','PA','CU','DO','PR','HT','JM','TT','BB','LC','VC','GD','AG','DM','KN','BS','BR','AR','CL','CO','PE','VE','EC','BO','PY','UY'] },
  asia: { label: 'Asia', emoji: '🌏', countryCodes: ['CN','JP','KR','IN','TH','VN','ID','MY','SG','PH','TW','HK','MO','BD','PK','LK','MM','KH','LA','BN','MN','NP','AF','KZ','UZ','TM','TJ','KG','AZ','AM','GE','TR','IL','JO','LB','SY','IQ','IR','SA','AE','OM','YE','KW','QA','BH'] },
  'southeast asia': { label: 'Southeast Asia', emoji: '🌏', countryCodes: ['TH','VN','ID','MY','SG','PH','MM','KH','LA','BN','TL'] },
  'sudeste asiatico': { label: 'Southeast Asia', emoji: '🌏', countryCodes: ['TH','VN','ID','MY','SG','PH','MM','KH','LA','BN','TL'] },
  'middle east': { label: 'Middle East', emoji: '🌍', countryCodes: ['AE','SA','QA','KW','BH','OM','YE','JO','IL','LB','SY','IQ','IR'] },
  'oriente medio': { label: 'Middle East', emoji: '🌍', countryCodes: ['AE','SA','QA','KW','BH','OM','YE','JO','IL','LB','SY','IQ','IR'] },
  africa: { label: 'Africa', emoji: '🌍', countryCodes: ['MA','DZ','TN','LY','EG','SN','ML','BF','GN','CI','GH','NG','CM','CD','ET','KE','TZ','UG','RW','ZA','MZ','ZW','ZM','AO','NA','BW','MG','MU','SC','CV','MR','NE','TD','SD','SO','DJ','ER','SS','CF','CG','GA','GQ','ST','SL','LR','GM','GW','TG','BJ','BI','MW','LS','SZ'] },
  oceania: { label: 'Oceania', emoji: '🌏', countryCodes: ['AU','NZ','FJ','PG','SB','VU','WS','TO','KI','FM','MH','PW','NR','TV'] },
  caribbean: { label: 'Caribbean', emoji: '🏝️', countryCodes: ['CU','DO','PR','HT','JM','TT','BB','LC','VC','GD','AG','DM','KN','BS','AW','CW','BQ','SX','AI','VG','VI','KY','TC','MF','GP','MQ','BL'] },
  caribe: { label: 'Caribbean', emoji: '🏝️', countryCodes: ['CU','DO','PR','HT','JM','TT','BB','LC','VC','GD','AG','DM','KN','BS','AW','CW','BQ','SX','AI','VG','VI','KY','TC','MF','GP','MQ','BL'] },
  scandinavia: { label: 'Scandinavia', emoji: '🧊', countryCodes: ['DK','NO','SE','FI','IS'] },
  escandinavia: { label: 'Scandinavia', emoji: '🧊', countryCodes: ['DK','NO','SE','FI','IS'] },
  nordic: { label: 'Nordic Countries', emoji: '🧊', countryCodes: ['DK','NO','SE','FI','IS','EE','LV','LT'] },
  'iberian peninsula': { label: 'Iberian Peninsula', emoji: '🌞', countryCodes: ['ES','PT','AD'] },
  'peninsula iberica': { label: 'Iberian Peninsula', emoji: '🌞', countryCodes: ['ES','PT','AD'] },
  iberia: { label: 'Iberian Peninsula', emoji: '🌞', countryCodes: ['ES','PT','AD'] },
  balkans: { label: 'Balkans', emoji: '⛰️', countryCodes: ['AL','BA','BG','HR','XK','MK','ME','RO','RS','SI'] },
  balcanes: { label: 'Balkans', emoji: '⛰️', countryCodes: ['AL','BA','BG','HR','XK','MK','ME','RO','RS','SI'] },
  'british isles': { label: 'British Isles', emoji: '🇬🇧', countryCodes: ['GB','IE'] },
  benelux: { label: 'Benelux', emoji: '🌷', countryCodes: ['BE','NL','LU'] },
  'baltic states': { label: 'Baltic States', emoji: '🌊', countryCodes: ['EE','LV','LT'] },
  'estados balticos': { label: 'Baltic States', emoji: '🌊', countryCodes: ['EE','LV','LT'] },
  maghreb: { label: 'Maghreb', emoji: '🏜️', countryCodes: ['MA','DZ','TN','LY','MR'] },
  'gulf countries': { label: 'Gulf Countries', emoji: '🕌', countryCodes: ['AE','SA','QA','KW','BH','OM'] },
  'paises del golfo': { label: 'Gulf Countries', emoji: '🕌', countryCodes: ['AE','SA','QA','KW','BH','OM'] },
};

export const COUNTRY_TOP_AIRPORTS: Record<string, string[]> = {
  ES: ['MAD','BCN','AGP','PMI','ALC'],
  PT: ['LIS','OPO','FAO'],
  DE: ['FRA','MUC','DUS','BER','HAM'],
  FR: ['CDG','ORY','NCE','LYS','MRS'],
  IT: ['FCO','MXP','VCE','NAP','BLQ'],
  GB: ['LHR','LGW','MAN','STN','EDI'],
  DK: ['CPH','BLL','AAL'],
  SE: ['ARN','GOT','MMX'],
  NO: ['OSL','BGO','TRD'],
  FI: ['HEL','TMP','TKU'],
  NL: ['AMS','EIN','RTM'],
  BE: ['BRU','CRL','LGG'],
  CH: ['ZRH','GVA','BSL'],
  AT: ['VIE','GRZ','INN'],
  PL: ['WAW','KRK','GDN'],
  GR: ['ATH','SKG','HER','RHO','CFU'],
  TR: ['IST','SAW','AYT','ADB','ESB'],
  US: ['JFK','LAX','ORD','ATL','MIA'],
  CA: ['YYZ','YVR','YUL','YYC','YEG'],
  MX: ['MEX','CUN','GDL','MTY','TIJ'],
  BR: ['GRU','GIG','BSB','SSA','FOR'],
  AR: ['EZE','AEP','COR','MDZ','BRC'],
  AU: ['SYD','MEL','BNE','PER','ADL'],
  JP: ['NRT','HND','KIX','CTS','FUK'],
  CN: ['PEK','PVG','CAN','SZX','CTU'],
  IN: ['DEL','BOM','BLR','MAA','CCU'],
  TH: ['BKK','DMK','HKT','CNX','USM'],
  ID: ['CGK','DPS','SUB','KNO','UPG'],
  AE: ['DXB','AUH','SHJ'],
  SA: ['RUH','JED','DMM'],
  ZA: ['JNB','CPT','DUR'],
  MA: ['CMN','RAK','AGA'],
  EG: ['CAI','HRG','SSH','LXR'],
};

export function getTopAirportsForGroup(airportCodes: string[], countryCode: string): string[] {
  const top = COUNTRY_TOP_AIRPORTS[countryCode];
  if (top) {
    const hits = top.filter(c => airportCodes.includes(c));
    if (hits.length > 0) return hits.slice(0, 5);
  }
  return airportCodes.slice(0, 5);
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
        airports: countryAirports,
      });
    }
  }

  return results;
}
