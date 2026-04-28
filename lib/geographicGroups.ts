import type { TpAirport } from './travelpayouts';
import type { TpCountry, AirportGroupResult } from './types';
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

export function buildGeographicGroups(
  query: string,
  airports: TpAirport[],
  countries: TpCountry[]
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
      .filter(a => region.countryCodes.includes(a.country_code))
      .map(a => ({ code: a.code, cityCode: a.city_code, countryCode: a.country_code }));

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

  // 2. Country matches (by name in any translation or ISO code)
  const matchedCountries = countries.filter(country => {
    const names = [
      country.name,
      country.code,
      ...Object.values(country.name_translations).filter(Boolean),
    ].map(n => (n as string).toLowerCase());
    return names.some(n => n.includes(q));
  });

  for (const country of matchedCountries.slice(0, 3)) {
    const groupCode = `GROUP_COUNTRY_${country.code}`;
    if (seen.has(groupCode)) continue;
    seen.add(groupCode);

    const countryAirports = airports
      .filter(a => a.country_code === country.code)
      .map(a => ({ code: a.code, cityCode: a.city_code, countryCode: a.country_code }));

    if (countryAirports.length > 0) {
      const flag = countryCodeToFlag(country.code);
      results.push({
        code: groupCode,
        name: `${flag} ${country.name} — All airports (${countryAirports.length})`,
        cityName: `${countryAirports.length} airports`,
        countryCode: country.code,
        isGroup: true,
        airports: countryAirports,
      });
    }
  }

  return results;
}
