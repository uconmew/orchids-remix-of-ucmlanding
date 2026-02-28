import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createError } from '@/lib/errorCodes';

const US_STATES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
};

const STATE_NAME_TO_ABBR: Record<string, string> = Object.entries(US_STATES).reduce(
  (acc, [abbr, name]) => ({ ...acc, [name.toLowerCase()]: abbr }),
  {} as Record<string, string>
);

const COLORADO_CITIES: string[] = [
  'Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton',
  'Arvada', 'Westminster', 'Pueblo', 'Centennial', 'Boulder', 'Greeley', 'Longmont',
  'Loveland', 'Broomfield', 'Grand Junction', 'Castle Rock', 'Commerce City',
  'Parker', 'Littleton', 'Northglenn', 'Brighton', 'Englewood', 'Wheat Ridge',
  'Golden', 'Highlands Ranch', 'Erie', 'Superior', 'Louisville', 'Lafayette',
  'Westminster', 'Sheridan', 'Glendale', 'Federal Heights', 'Edgewater',
  'Cherry Hills Village', 'Greenwood Village', 'Lone Tree', 'Columbine Valley'
];

const COMMON_TYPOS: Record<string, string> = {
  'denve': 'Denver', 'denvr': 'Denver', 'denver,': 'Denver',
  'colarado': 'Colorado', 'colordo': 'Colorado', 'colorad': 'Colorado',
  'aurura': 'Aurora', 'auora': 'Aurora',
  'boulder': 'Boulder', 'bolder': 'Boulder',
  'lakewod': 'Lakewood', 'lakewoo': 'Lakewood',
  'arvda': 'Arvada', 'aravda': 'Arvada',
  'westminister': 'Westminster', 'westmnster': 'Westminster',
  'thronton': 'Thornton', 'thorton': 'Thornton',
  'englwood': 'Englewood', 'englewod': 'Englewood',
  'litleton': 'Littleton', 'litleon': 'Littleton',
  'steet': 'Street', 'strt': 'Street', 'st.': 'St',
  'avnue': 'Avenue', 'aveue': 'Avenue', 'ave.': 'Ave',
  'blvd.': 'Blvd', 'bouelvard': 'Boulevard',
  'drve': 'Drive', 'dr.': 'Dr',
  'road': 'Rd', 'rd.': 'Rd',
  'lane': 'Ln', 'ln.': 'Ln',
  'court': 'Ct', 'ct.': 'Ct',
  'circle': 'Cir', 'cir.': 'Cir',
  'parkway': 'Pkwy', 'pkwy.': 'Pkwy',
  'highway': 'Hwy', 'hwy.': 'Hwy',
  'north': 'N', 'south': 'S', 'east': 'E', 'west': 'W',
  'northeast': 'NE', 'northwest': 'NW', 'southeast': 'SE', 'southwest': 'SW',
};

const STREET_TYPE_ABBR: Record<string, string> = {
  'avenue': 'Ave', 'ave': 'Ave',
  'boulevard': 'Blvd', 'blvd': 'Blvd',
  'circle': 'Cir', 'cir': 'Cir',
  'court': 'Ct', 'ct': 'Ct',
  'drive': 'Dr', 'dr': 'Dr',
  'highway': 'Hwy', 'hwy': 'Hwy',
  'lane': 'Ln', 'ln': 'Ln',
  'parkway': 'Pkwy', 'pkwy': 'Pkwy',
  'place': 'Pl', 'pl': 'Pl',
  'road': 'Rd', 'rd': 'Rd',
  'street': 'St', 'st': 'St',
  'terrace': 'Ter', 'ter': 'Ter',
  'trail': 'Trl', 'trl': 'Trl',
  'way': 'Way',
};

const DIRECTION_ABBR: Record<string, string> = {
  'north': 'N', 'south': 'S', 'east': 'E', 'west': 'W',
  'northeast': 'NE', 'northwest': 'NW', 'southeast': 'SE', 'southwest': 'SW',
  'n': 'N', 's': 'S', 'e': 'E', 'w': 'W',
  'ne': 'NE', 'nw': 'NW', 'se': 'SE', 'sw': 'SW'
};

interface ParsedAddress {
  streetNumber: string;
  streetName: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
}

interface VerificationResult {
  isValid: boolean;
  isComplete: boolean;
  errors: { code: string; message: string; field: string }[];
  original: string;
  parsed?: ParsedAddress;
  suggested?: ParsedAddress;
  formattedAddress?: string;
}

function parseAddress(address: string): ParsedAddress | null {
  let cleaned = address.trim();
  
  // First, fix common typos in the address
  const words = cleaned.split(/\s+/);
  const correctedWords = words.map(word => {
    const lower = word.toLowerCase().replace(/[.,]$/, '');
    if (COMMON_TYPOS[lower]) {
      return COMMON_TYPOS[lower];
    }
    return word;
  });
  cleaned = correctedWords.join(' ');
  
  const zipMatch = cleaned.match(/\b(\d{5})(-\d{4})?\b/);
  const zipCode = zipMatch ? zipMatch[1] + (zipMatch[2] || '') : '';
  
  // Try to find state - first by abbreviation, then by full name
  let state = '';
  const statePattern = new RegExp(`\\b(${Object.keys(US_STATES).join('|')})\\b`, 'i');
  const stateMatch = cleaned.match(statePattern);
  if (stateMatch) {
    state = stateMatch[1].toUpperCase();
  } else {
    // Try full state names
    for (const [abbr, name] of Object.entries(US_STATES)) {
      if (cleaned.toLowerCase().includes(name.toLowerCase())) {
        state = abbr;
        cleaned = cleaned.replace(new RegExp(name, 'i'), abbr);
        break;
      }
    }
  }
  
  const streetNumberMatch = cleaned.match(/^(\d+)/);
  const streetNumber = streetNumberMatch ? streetNumberMatch[1] : '';
  
  let remaining = cleaned;
  if (streetNumber) remaining = remaining.replace(/^\d+\s*/, '');
  if (zipCode) remaining = remaining.replace(new RegExp(`\\b${zipCode.replace('-', '\\-?')}\\b`), '');
  if (state) remaining = remaining.replace(new RegExp(`\\b${state}\\b`, 'i'), '');
  
  const unitMatch = remaining.match(/(?:apt\.?|suite\.?|unit\.?|#|ste\.?)\s*(\w+)/i);
  const unit = unitMatch ? unitMatch[1] : undefined;
  if (unitMatch) remaining = remaining.replace(unitMatch[0], '');
  
  const parts = remaining.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  let streetName = '';
  let city = '';
  
  if (parts.length >= 2) {
    streetName = parts[0];
    city = parts.slice(1).join(', ').replace(/[,\s]+$/, '').trim();
  } else if (parts.length === 1) {
    const words = parts[0].split(/\s+/);
    if (words.length > 2) {
      city = words.pop() || '';
      streetName = words.join(' ');
    } else {
      streetName = parts[0];
    }
  }
  
  city = city.replace(/[,.\s]+$/, '');
  
  // Try to correct/match the city name to known Colorado cities
  if (city) {
    const correctedCity = findBestCityMatch(city);
    if (correctedCity) {
      city = correctedCity;
    }
  }
  
  if (!streetNumber || !streetName || !city || !state || !zipCode) {
    return null;
  }
  
  return { streetNumber, streetName, unit, city, state, zipCode };
}

// Find the best matching city name using fuzzy matching
function findBestCityMatch(input: string): string | null {
  const inputLower = input.toLowerCase().trim();
  
  // First check for exact match
  for (const city of COLORADO_CITIES) {
    if (city.toLowerCase() === inputLower) {
      return city;
    }
  }
  
  // Check common typos
  if (COMMON_TYPOS[inputLower]) {
    const corrected = COMMON_TYPOS[inputLower];
    if (COLORADO_CITIES.includes(corrected)) {
      return corrected;
    }
  }
  
  // Fuzzy match: find closest city with Levenshtein distance
  let bestMatch: string | null = null;
  let bestDistance = Infinity;
  
  for (const city of COLORADO_CITIES) {
    const distance = levenshteinDistance(inputLower, city.toLowerCase());
    // Only suggest if distance is reasonable (less than 3 for short names, less than 4 for longer)
    const maxDistance = city.length <= 6 ? 2 : 3;
    if (distance < bestDistance && distance <= maxDistance) {
      bestDistance = distance;
      bestMatch = city;
    }
  }
  
  return bestMatch;
}

// Simple Levenshtein distance implementation
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function normalizeStreetName(name: string): string {
  let normalized = name.trim();
  
  const words = normalized.split(/\s+/);
  const normalizedWords = words.map(word => {
    const lower = word.toLowerCase();
    if (DIRECTION_ABBR[lower]) return DIRECTION_ABBR[lower];
    if (STREET_TYPE_ABBR[lower]) return STREET_TYPE_ABBR[lower];
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return normalizedWords.join(' ');
}

function formatAddress(parsed: ParsedAddress): string {
  const parts = [parsed.streetNumber, parsed.streetName];
  if (parsed.unit) parts.push(`#${parsed.unit}`);
  return `${parts.join(' ')}, ${parsed.city}, ${parsed.state} ${parsed.zipCode}`;
}

function validateComponents(parsed: ParsedAddress): { code: string; message: string; field: string }[] {
  const errors: { code: string; message: string; field: string }[] = [];
  
  if (!parsed.streetNumber) {
    errors.push({ code: 'L0001', message: 'Missing street number', field: 'streetNumber' });
  } else if (!/^\d+\w*$/.test(parsed.streetNumber)) {
    errors.push({ code: 'L0001', message: 'Invalid street number format', field: 'streetNumber' });
  }
  
  if (!parsed.streetName) {
    errors.push({ code: 'L0002', message: 'Missing street name', field: 'streetName' });
  }
  
  if (!parsed.city) {
    errors.push({ code: 'L0003', message: 'Missing city', field: 'city' });
  }
  
  if (!parsed.state) {
    errors.push({ code: 'L0004', message: 'Missing state', field: 'state' });
  } else if (!US_STATES[parsed.state.toUpperCase()]) {
    errors.push({ code: 'L0010', message: 'Invalid state abbreviation', field: 'state' });
  }
  
  if (!parsed.zipCode) {
    errors.push({ code: 'L0005', message: 'Missing ZIP code', field: 'zipCode' });
  } else if (!/^\d{5}(-\d{4})?$/.test(parsed.zipCode)) {
    errors.push({ code: 'L0006', message: 'Invalid ZIP code format', field: 'zipCode' });
  }
  
  return errors;
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createError('A0001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { address, streetNumber, streetName, unit, city, state, zipCode } = body;
    
    let result: VerificationResult;
    
    if (address) {
      const parsed = parseAddress(address);
      
      if (!parsed) {
        // Try to provide partial suggestions even when full parse fails
        const partialSuggestion = attemptPartialParse(address);
        result = {
          isValid: false,
          isComplete: false,
          errors: [{ 
            code: 'L1007', 
            message: 'Could not fully parse address. Please ensure it includes: street number, street name, city, state, and ZIP code.', 
            field: 'address' 
          }],
          original: address,
          ...(partialSuggestion && { 
            formattedAddress: partialSuggestion,
            suggested: { streetNumber: '', streetName: '', city: '', state: 'CO', zipCode: '' }
          })
        };
      } else {
        const errors = validateComponents(parsed);
        // Use the fuzzy-matched city for suggestion
        const suggestedCity = findBestCityMatch(parsed.city) || titleCase(parsed.city);
        const suggested: ParsedAddress = {
          ...parsed,
          streetName: normalizeStreetName(parsed.streetName),
          state: parsed.state.toUpperCase(),
          city: suggestedCity,
        };
        
        result = {
          isValid: errors.length === 0,
          isComplete: true,
          errors,
          original: address,
          parsed,
          suggested,
          formattedAddress: formatAddress(suggested),
        };
      }
    } else {
      const parsed: ParsedAddress = {
        streetNumber: streetNumber || '',
        streetName: streetName || '',
        unit: unit || undefined,
        city: city || '',
        state: (state || '').toUpperCase(),
        zipCode: zipCode || '',
      };
      
      const errors = validateComponents(parsed);
      const suggestedCity = city ? (findBestCityMatch(city) || titleCase(city)) : '';
      const suggested: ParsedAddress = {
        ...parsed,
        streetName: normalizeStreetName(parsed.streetName),
        state: parsed.state.toUpperCase(),
        city: suggestedCity,
      };
      
      const fullAddr = `${streetNumber} ${streetName}${unit ? ` #${unit}` : ''}, ${city}, ${state} ${zipCode}`;
      
      result = {
        isValid: errors.length === 0,
        isComplete: !!streetNumber && !!streetName && !!city && !!state && !!zipCode,
        errors,
        original: fullAddr,
        parsed,
        suggested,
        formattedAddress: errors.length === 0 ? formatAddress(suggested) : undefined,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error verifying address:', error);
    return NextResponse.json({ 
      ...createError('S0001'),
      error: 'Failed to verify address' 
    }, { status: 500 });
  }
}

// Title case helper
function titleCase(str: string): string {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Attempt to extract and suggest parts even when full parse fails
function attemptPartialParse(address: string): string | null {
  let cleaned = address.trim();
  
  // Fix common typos first
  const words = cleaned.split(/\s+/);
  const correctedWords = words.map(word => {
    const lower = word.toLowerCase().replace(/[.,]$/, '');
    return COMMON_TYPOS[lower] || word;
  });
  cleaned = correctedWords.join(' ');
  
  // Try to extract ZIP
  const zipMatch = cleaned.match(/\b(\d{5})(-\d{4})?\b/);
  const zip = zipMatch ? zipMatch[0] : '8020X';
  
  // Try to find state
  let state = 'CO';
  const statePattern = new RegExp(`\\b(${Object.keys(US_STATES).join('|')})\\b`, 'i');
  const stateMatch = cleaned.match(statePattern);
  if (stateMatch) {
    state = stateMatch[1].toUpperCase();
  }
  
  // Try to find city
  let city = 'Denver';
  for (const knownCity of COLORADO_CITIES) {
    if (cleaned.toLowerCase().includes(knownCity.toLowerCase())) {
      city = knownCity;
      break;
    }
  }
  
  // Try to get street number
  const streetNumMatch = cleaned.match(/^(\d+)/);
  const streetNum = streetNumMatch ? streetNumMatch[1] : 'XXXX';
  
  // Extract potential street name
  let streetName = 'Street Name';
  const streetMatch = cleaned.match(/^\d+\s+([A-Za-z\s]+?)(?:,|\s+(?:Denver|Aurora|Boulder|Lakewood))/i);
  if (streetMatch) {
    streetName = normalizeStreetName(streetMatch[1].trim());
  }
  
  return `${streetNum} ${streetName}, ${city}, ${state} ${zip}`;
}
