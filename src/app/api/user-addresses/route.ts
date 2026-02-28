import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userAddresses } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { createError, ERROR_CODES } from '@/lib/errorCodes';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

interface AddressValidationResult {
  isValid: boolean;
  errors: { code: string; message: string; field: string }[];
  suggestedAddress?: {
    streetNumber: string;
    streetName: string;
    city: string;
    state: string;
    zipCode: string;
    fullAddress: string;
  };
}

function validateAddress(
  streetNumber: string,
  streetName: string,
  city: string,
  state: string,
  zipCode: string
): AddressValidationResult {
  const errors: { code: string; message: string; field: string }[] = [];

  if (!streetNumber || streetNumber.trim() === '') {
    errors.push({ code: 'L0001', message: 'Street number is required', field: 'streetNumber' });
  }

  if (!streetName || streetName.trim() === '') {
    errors.push({ code: 'L0002', message: 'Street name is required', field: 'streetName' });
  }

  if (!city || city.trim() === '') {
    errors.push({ code: 'L0003', message: 'City is required', field: 'city' });
  }

  if (!state || state.trim() === '') {
    errors.push({ code: 'L0004', message: 'State is required', field: 'state' });
  } else if (!US_STATES.includes(state.toUpperCase())) {
    errors.push({ code: 'L0010', message: 'Invalid state abbreviation', field: 'state' });
  }

  if (!zipCode || zipCode.trim() === '') {
    errors.push({ code: 'L0005', message: 'ZIP code is required', field: 'zipCode' });
  } else if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
    errors.push({ code: 'L0006', message: 'Invalid ZIP code format (must be 5 digits or 5+4)', field: 'zipCode' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function formatFullAddress(
  streetNumber: string,
  streetName: string,
  unit: string | null,
  city: string,
  state: string,
  zipCode: string
): string {
  const parts = [streetNumber.trim(), streetName.trim()];
  if (unit) parts.push(`#${unit.trim()}`);
  return `${parts.join(' ')}, ${city.trim()}, ${state.toUpperCase()} ${zipCode.trim()}`;
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createError('A0001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  try {
    const addresses = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, currentUser.id))
      .orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return NextResponse.json({ 
      ...createError('S0001'),
      error: 'Failed to fetch addresses' 
    }, { status: 500 });
  }
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
    const { label, streetNumber, streetName, unit, city, state, zipCode, notes, setAsDefault } = body;

    if (!label || label.trim() === '') {
      return NextResponse.json({ 
        ...createError('I0001', 'Address label is required'),
        error: 'Address label is required (e.g., "Home", "Work")' 
      }, { status: 400 });
    }

    const validation = validateAddress(streetNumber, streetName, city, state, zipCode);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Address validation failed',
        code: validation.errors[0]?.code || 'I0001',
        validationErrors: validation.errors
      }, { status: 400 });
    }

    const fullAddress = formatFullAddress(streetNumber, streetName, unit, city, state, zipCode);

    if (setAsDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, currentUser.id));
    }

    const newAddress = await db.insert(userAddresses).values({
      userId: currentUser.id,
      label: label.trim(),
      streetNumber: streetNumber.trim(),
      streetName: streetName.trim(),
      unit: unit?.trim() || null,
      city: city.trim(),
      state: state.toUpperCase().trim(),
      zipCode: zipCode.trim(),
      fullAddress,
      isVerified: false,
      isDefault: setAsDefault || false,
      notes: notes?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(newAddress[0]);
  } catch (error) {
    console.error('Error creating user address:', error);
    return NextResponse.json({ 
      ...createError('S0001'),
      error: 'Failed to create address' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createError('A0001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, label, streetNumber, streetName, unit, city, state, zipCode, notes, setAsDefault } = body;

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(userAddresses)
      .where(and(
        eq(userAddresses.id, id),
        eq(userAddresses.userId, currentUser.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        ...createError('R0001'),
        error: 'Address not found' 
      }, { status: 404 });
    }

    const newStreetNumber = streetNumber ?? existing[0].streetNumber;
    const newStreetName = streetName ?? existing[0].streetName;
    const newCity = city ?? existing[0].city;
    const newState = state ?? existing[0].state;
    const newZipCode = zipCode ?? existing[0].zipCode;

    const validation = validateAddress(newStreetNumber, newStreetName, newCity, newState, newZipCode);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Address validation failed',
        code: validation.errors[0]?.code || 'I0001',
        validationErrors: validation.errors
      }, { status: 400 });
    }

    const newUnit = unit !== undefined ? unit : existing[0].unit;
    const fullAddress = formatFullAddress(newStreetNumber, newStreetName, newUnit, newCity, newState, newZipCode);

    if (setAsDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, currentUser.id));
    }

    const updated = await db
      .update(userAddresses)
      .set({
        label: label?.trim() ?? existing[0].label,
        streetNumber: newStreetNumber.trim(),
        streetName: newStreetName.trim(),
        unit: newUnit?.trim() || null,
        city: newCity.trim(),
        state: newState.toUpperCase().trim(),
        zipCode: newZipCode.trim(),
        fullAddress,
        notes: notes !== undefined ? (notes?.trim() || null) : existing[0].notes,
        isDefault: setAsDefault ?? existing[0].isDefault,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userAddresses.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating user address:', error);
    return NextResponse.json({ 
      ...createError('S0001'),
      error: 'Failed to update address' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      ...createError('A0001'),
      error: 'Unauthorized' 
    }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(userAddresses)
      .where(and(
        eq(userAddresses.id, parseInt(id)),
        eq(userAddresses.userId, currentUser.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        ...createError('R0001'),
        error: 'Address not found' 
      }, { status: 404 });
    }

    await db
      .delete(userAddresses)
      .where(eq(userAddresses.id, parseInt(id)));

    return NextResponse.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    console.error('Error deleting user address:', error);
    return NextResponse.json({ 
      ...createError('S0001'),
      error: 'Failed to delete address' 
    }, { status: 500 });
  }
}
