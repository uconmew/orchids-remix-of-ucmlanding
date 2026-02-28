/**
 * UCON Ministries Error Code System
 * 
 * Error codes are 5 characters: 1 letter prefix + 4 digits
 * The letter indicates the error category:
 * 
 * A - Authentication/Authorization errors
 * B - Booking/Reservation errors  
 * C - Configuration/Settings errors
 * D - Database/Data errors
 * E - External Service errors
 * F - Fetch/Network errors
 * I - Input/Validation errors
 * L - Location/Address errors
 * O - Override/Permission errors
 * P - Payment/Donation errors
 * R - Resource/Availability errors
 * S - System/Server errors
 * T - Time/Schedule errors
 * U - User/Profile errors
 * W - Workshop/Event errors
 */

export interface ErrorCode {
  code: string;
  message: string;
  description: string;
  category: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userFriendlyMessage: string;
  suggestedAction?: string;
}

export const ERROR_CODES: Record<string, ErrorCode> = {
  // Authentication/Authorization (A)
  A1001: {
    code: 'A1001',
    message: 'User not authenticated',
    description: 'No valid session found for the current request',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Please log in to continue.',
    suggestedAction: 'Redirect to login page'
  },
  A1002: {
    code: 'A1002',
    message: 'Session expired',
    description: 'User session has timed out and requires re-authentication',
    category: 'Authentication',
    severity: 'warning',
    userFriendlyMessage: 'Your session has expired. Please log in again.',
    suggestedAction: 'Redirect to login page with return URL'
  },
  A1003: {
    code: 'A1003',
    message: 'Insufficient permissions',
    description: 'User does not have required role or clearance for this action',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'You do not have permission to perform this action.',
    suggestedAction: 'Contact admin for access'
  },
  A1004: {
    code: 'A1004',
    message: 'Invalid credentials',
    description: 'Email or password does not match any account',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Invalid email or password. Please check your credentials and try again.',
    suggestedAction: 'Verify email and password are correct'
  },
  A1005: {
    code: 'A1005',
    message: 'Account locked',
    description: 'Account has been locked due to multiple failed attempts',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Your account has been temporarily locked due to too many failed login attempts. Please try again in 15 minutes or contact support.',
    suggestedAction: 'Wait 15 minutes or contact support'
  },
  A1006: {
    code: 'A1006',
    message: 'Staff-only access required',
    description: 'This resource requires staff-level authentication',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'This area is restricted to staff members.',
    suggestedAction: 'Use staff login portal'
  },
  A1007: {
    code: 'A1007',
    message: 'Duty clearance required',
    description: 'User lacks required duty clearance bits for this operation',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'You need additional clearance to perform this action.',
    suggestedAction: 'Request clearance from administrator'
  },
  A1008: {
    code: 'A1008',
    message: 'Email not found',
    description: 'No account exists with the provided email address',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'No account found with this email address. Please check the email or register for a new account.',
    suggestedAction: 'Verify email or create new account'
  },
  A1009: {
    code: 'A1009',
    message: 'Incorrect password',
    description: 'Password does not match the account',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Incorrect password. Please try again or use "Forgot Password" to reset it.',
    suggestedAction: 'Re-enter password or reset password'
  },
  A1010: {
    code: 'A1010',
    message: 'Account not verified',
    description: 'Email address has not been verified',
    category: 'Authentication',
    severity: 'warning',
    userFriendlyMessage: 'Your email address has not been verified. Please check your inbox for the verification email.',
    suggestedAction: 'Check email for verification link'
  },
  A1011: {
    code: 'A1011',
    message: 'Account suspended',
    description: 'Account has been suspended by administrator',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Your account has been suspended. Please contact support for assistance.',
    suggestedAction: 'Contact support'
  },
  A1012: {
    code: 'A1012',
    message: 'Account deactivated',
    description: 'Account has been deactivated',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'This account has been deactivated. Please contact support to reactivate.',
    suggestedAction: 'Contact support to reactivate'
  },
  A1013: {
    code: 'A1013',
    message: 'Password expired',
    description: 'Password has expired and must be changed',
    category: 'Authentication',
    severity: 'warning',
    userFriendlyMessage: 'Your password has expired. Please reset your password to continue.',
    suggestedAction: 'Reset password'
  },
  A1014: {
    code: 'A1014',
    message: 'Authentication failed',
    description: 'General authentication failure',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Authentication failed. Please try again.',
    suggestedAction: 'Retry login'
  },
  A1015: {
    code: 'A1015',
    message: 'No staff role found',
    description: 'User does not have any staff or admin role assigned',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'Access denied. You do not have staff privileges. Please contact an administrator if you believe this is an error.',
    suggestedAction: 'Contact administrator for role assignment'
  },
  A1016: {
    code: 'A1016',
    message: 'Missing staff tag',
    description: 'User has role level but missing required Staff tag',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'Access denied. Your account is missing the Staff tag required for this access level. Please contact an administrator.',
    suggestedAction: 'Contact administrator for tag assignment'
  },
  A1017: {
    code: 'A1017',
    message: 'Missing admin tag',
    description: 'User has admin role level but missing Admin tag',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'Access denied. Your account is missing the Admin tag required for admin access. Please contact an administrator.',
    suggestedAction: 'Contact administrator for tag assignment'
  },
  A1018: {
    code: 'A1018',
    message: 'Convict-only account',
    description: 'Account only has Convict tag without Staff or Admin privileges',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'Access denied. Convict accounts must use the regular login. Staff login requires Staff or Admin role.',
    suggestedAction: 'Use regular login at /login'
  },
  A1019: {
    code: 'A1019',
    message: 'Role verification failed',
    description: 'Unable to verify user role from database',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'Error verifying your role. Please try again or contact support.',
    suggestedAction: 'Retry or contact support'
  },
  A1020: {
    code: 'A1020',
    message: 'Invalid role level',
    description: 'User role level does not meet minimum requirements',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'Access denied. Your role level does not have sufficient access for this area.',
    suggestedAction: 'Contact administrator for role upgrade'
  },
  A1021: {
    code: 'A1021',
    message: 'Missing email field',
    description: 'Email field is required but was not provided',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Please enter your email address.',
    suggestedAction: 'Enter email address'
  },
  A1022: {
    code: 'A1022',
    message: 'Missing password field',
    description: 'Password field is required but was not provided',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Please enter your password.',
    suggestedAction: 'Enter password'
  },
  A1023: {
    code: 'A1023',
    message: 'Invalid email format',
    description: 'Email address format is invalid',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Please enter a valid email address.',
    suggestedAction: 'Check email format'
  },
  A1024: {
    code: 'A1024',
    message: 'Password too short',
    description: 'Password does not meet minimum length requirements',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Password must be at least 8 characters long.',
    suggestedAction: 'Use a longer password'
  },
  A1025: {
    code: 'A1025',
    message: 'Admin access required',
    description: 'This action requires administrator privileges',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'This action requires administrator privileges. Please contact an admin if you need access.',
    suggestedAction: 'Contact administrator'
  },
  A1026: {
    code: 'A1026',
    message: 'Session cookie missing',
    description: 'Required session cookie is not present',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Your session is missing. Please log in again through the staff portal.',
    suggestedAction: 'Log in via staff portal'
  },
  A1027: {
    code: 'A1027',
    message: 'Staff session cookie missing',
    description: 'Staff session cookie required but not present',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'Staff session required. Please log in through the staff portal.',
    suggestedAction: 'Log in via staff portal'
  },
  A1028: {
    code: 'A1028',
    message: 'Admin session cookie missing',
    description: 'Admin session cookie required but not present',
    category: 'Authorization',
    severity: 'error',
    userFriendlyMessage: 'Admin session required. Please log in through the staff portal with admin credentials.',
    suggestedAction: 'Log in via staff portal with admin credentials'
  },
  A1029: {
    code: 'A1029',
    message: 'User ID missing',
    description: 'User ID not found in session after authentication',
    category: 'Authentication',
    severity: 'error',
    userFriendlyMessage: 'Authentication incomplete. Please try logging in again.',
    suggestedAction: 'Retry login'
  },
  A1030: {
    code: 'A1030',
    message: 'Rate limit exceeded',
    description: 'Too many login attempts in short period',
    category: 'Authentication',
    severity: 'warning',
    userFriendlyMessage: 'Too many login attempts. Please wait a few minutes before trying again.',
    suggestedAction: 'Wait 5 minutes before retrying'
  },

  // Booking/Reservation (B)
  B1001: {
    code: 'B1001',
    message: 'Booking not found',
    description: 'The requested booking ID does not exist in the system',
    category: 'Booking',
    severity: 'error',
    userFriendlyMessage: 'This booking could not be found.',
    suggestedAction: 'Verify booking ID'
  },
  B1002: {
    code: 'B1002',
    message: 'Booking already cancelled',
    description: 'Attempting to modify a booking that has been cancelled',
    category: 'Booking',
    severity: 'warning',
    userFriendlyMessage: 'This booking has already been cancelled.',
    suggestedAction: 'Create a new booking if needed'
  },
  B1003: {
    code: 'B1003',
    message: 'Duplicate booking detected',
    description: 'User already has a pending booking for this time/service',
    category: 'Booking',
    severity: 'warning',
    userFriendlyMessage: 'You already have a pending request for this time.',
    suggestedAction: 'Check your existing bookings'
  },
  B1004: {
    code: 'B1004',
    message: 'Booking capacity exceeded',
    description: 'Maximum number of bookings reached for this time slot',
    category: 'Booking',
    severity: 'error',
    userFriendlyMessage: 'This time slot is fully booked.',
    suggestedAction: 'Choose a different time'
  },
  B1005: {
    code: 'B1005',
    message: 'Past booking attempt',
    description: 'Attempting to book for a time that has already passed',
    category: 'Booking',
    severity: 'error',
    userFriendlyMessage: 'Cannot book for a past date/time.',
    suggestedAction: 'Select a future date and time'
  },

  // Configuration (C)
  C1001: {
    code: 'C1001',
    message: 'Missing configuration',
    description: 'Required environment variable or setting is not defined',
    category: 'Configuration',
    severity: 'critical',
    userFriendlyMessage: 'System configuration error. Please contact support.',
    suggestedAction: 'Check environment variables'
  },
  C1002: {
    code: 'C1002',
    message: 'Invalid configuration value',
    description: 'Configuration value does not match expected format or range',
    category: 'Configuration',
    severity: 'error',
    userFriendlyMessage: 'System configuration error. Please contact support.',
    suggestedAction: 'Validate configuration values'
  },

  // Database/Data (D)
  D1001: {
    code: 'D1001',
    message: 'Database connection failed',
    description: 'Unable to establish connection to the database',
    category: 'Database',
    severity: 'critical',
    userFriendlyMessage: 'We are experiencing technical difficulties. Please try again later.',
    suggestedAction: 'Check database connection string and availability'
  },
  D1002: {
    code: 'D1002',
    message: 'Record not found',
    description: 'The requested record does not exist in the database',
    category: 'Database',
    severity: 'error',
    userFriendlyMessage: 'The requested information could not be found.',
    suggestedAction: 'Verify the ID or search criteria'
  },
  D1003: {
    code: 'D1003',
    message: 'Duplicate entry',
    description: 'Attempting to create a record that already exists',
    category: 'Database',
    severity: 'error',
    userFriendlyMessage: 'This record already exists.',
    suggestedAction: 'Use update instead of create'
  },
  D1004: {
    code: 'D1004',
    message: 'Foreign key constraint violation',
    description: 'Referenced record does not exist or cannot be deleted',
    category: 'Database',
    severity: 'error',
    userFriendlyMessage: 'This record is linked to other data and cannot be modified.',
    suggestedAction: 'Remove dependent records first'
  },
  D1005: {
    code: 'D1005',
    message: 'Query timeout',
    description: 'Database query exceeded time limit',
    category: 'Database',
    severity: 'error',
    userFriendlyMessage: 'Request took too long. Please try again.',
    suggestedAction: 'Optimize query or increase timeout'
  },

  // External Service (E)
  E1001: {
    code: 'E1001',
    message: 'External service unavailable',
    description: 'Third-party service is not responding',
    category: 'External',
    severity: 'error',
    userFriendlyMessage: 'A required service is temporarily unavailable. Please try again.',
    suggestedAction: 'Check service status and retry'
  },
  E1002: {
    code: 'E1002',
    message: 'API rate limit exceeded',
    description: 'Too many requests to external API',
    category: 'External',
    severity: 'warning',
    userFriendlyMessage: 'Too many requests. Please wait a moment and try again.',
    suggestedAction: 'Implement rate limiting'
  },
  E1003: {
    code: 'E1003',
    message: 'Email delivery failed',
    description: 'Unable to send email notification',
    category: 'External',
    severity: 'warning',
    userFriendlyMessage: 'We could not send the email confirmation.',
    suggestedAction: 'Check email service configuration'
  },

  // Fetch/Network (F)
  F1001: {
    code: 'F1001',
    message: 'Network request failed',
    description: 'Unable to complete HTTP request',
    category: 'Network',
    severity: 'error',
    userFriendlyMessage: 'Connection error. Please check your internet and try again.',
    suggestedAction: 'Verify network connectivity'
  },
  F1002: {
    code: 'F1002',
    message: 'Request timeout',
    description: 'HTTP request exceeded time limit',
    category: 'Network',
    severity: 'error',
    userFriendlyMessage: 'The request took too long. Please try again.',
    suggestedAction: 'Retry with exponential backoff'
  },
  F1003: {
    code: 'F1003',
    message: 'Invalid response format',
    description: 'Response from server was not in expected format',
    category: 'Network',
    severity: 'error',
    userFriendlyMessage: 'Unexpected response from server.',
    suggestedAction: 'Check API response structure'
  },

  // Input/Validation (I)
  I1001: {
    code: 'I1001',
    message: 'Required field missing',
    description: 'A required input field was not provided',
    category: 'Validation',
    severity: 'error',
    userFriendlyMessage: 'Please fill in all required fields.',
    suggestedAction: 'Check for missing required inputs'
  },
  I1002: {
    code: 'I1002',
    message: 'Invalid email format',
    description: 'Email address does not match valid format',
    category: 'Validation',
    severity: 'error',
    userFriendlyMessage: 'Please enter a valid email address.',
    suggestedAction: 'Correct email format'
  },
  I1003: {
    code: 'I1003',
    message: 'Invalid phone format',
    description: 'Phone number does not match valid format',
    category: 'Validation',
    severity: 'error',
    userFriendlyMessage: 'Please enter a valid phone number.',
    suggestedAction: 'Use format: (XXX) XXX-XXXX'
  },
  I1004: {
    code: 'I1004',
    message: 'Value out of range',
    description: 'Input value exceeds acceptable limits',
    category: 'Validation',
    severity: 'error',
    userFriendlyMessage: 'The value entered is outside the acceptable range.',
    suggestedAction: 'Check minimum and maximum values'
  },
  I1005: {
    code: 'I1005',
    message: 'Invalid date format',
    description: 'Date does not match expected format',
    category: 'Validation',
    severity: 'error',
    userFriendlyMessage: 'Please enter a valid date.',
    suggestedAction: 'Use the date picker or format YYYY-MM-DD'
  },
  I1006: {
    code: 'I1006',
    message: 'Terms not accepted',
    description: 'User has not accepted required terms and conditions',
    category: 'Validation',
    severity: 'error',
    userFriendlyMessage: 'You must accept the terms and conditions to continue.',
    suggestedAction: 'Check the terms acceptance checkbox'
  },

  // Location/Address (L)
  L1001: {
    code: 'L1001',
    message: 'Missing street number',
    description: 'Address is missing the street number component',
    category: 'Address',
    severity: 'warning',
    userFriendlyMessage: 'Please include a street number in the address.',
    suggestedAction: 'Add street number (e.g., "123 Main St")'
  },
  L1002: {
    code: 'L1002',
    message: 'Missing street name',
    description: 'Address is missing the street name component',
    category: 'Address',
    severity: 'error',
    userFriendlyMessage: 'Please include a street name in the address.',
    suggestedAction: 'Add street name'
  },
  L1003: {
    code: 'L1003',
    message: 'Missing city',
    description: 'Address is missing the city component',
    category: 'Address',
    severity: 'error',
    userFriendlyMessage: 'Please include the city in the address.',
    suggestedAction: 'Add city name'
  },
  L1004: {
    code: 'L1004',
    message: 'Missing state',
    description: 'Address is missing the state component',
    category: 'Address',
    severity: 'error',
    userFriendlyMessage: 'Please include the state in the address.',
    suggestedAction: 'Add state (e.g., "CO" for Colorado)'
  },
  L1005: {
    code: 'L1005',
    message: 'Missing ZIP code',
    description: 'Address is missing the ZIP code component',
    category: 'Address',
    severity: 'warning',
    userFriendlyMessage: 'Please include a ZIP code for better accuracy.',
    suggestedAction: 'Add 5-digit ZIP code'
  },
  L1006: {
    code: 'L1006',
    message: 'Invalid ZIP format',
    description: 'ZIP code does not match valid format',
    category: 'Address',
    severity: 'error',
    userFriendlyMessage: 'Please enter a valid 5-digit ZIP code.',
    suggestedAction: 'Use format: XXXXX or XXXXX-XXXX'
  },
  L1007: {
    code: 'L1007',
    message: 'Address not found',
    description: 'Address could not be verified or geocoded',
    category: 'Address',
    severity: 'warning',
    userFriendlyMessage: 'We could not verify this address. Please double-check it.',
    suggestedAction: 'Verify address accuracy'
  },
  L1008: {
    code: 'L1008',
    message: 'Multiple address matches',
    description: 'Address matches multiple locations',
    category: 'Address',
    severity: 'info',
    userFriendlyMessage: 'Please be more specific with the address.',
    suggestedAction: 'Add unit number or be more specific'
  },
  L1009: {
    code: 'L1009',
    message: 'Outside service area',
    description: 'Address is outside the supported service area',
    category: 'Address',
    severity: 'error',
    userFriendlyMessage: 'This address is outside our service area.',
    suggestedAction: 'Service limited to Denver Metro area'
  },

  // Override/Permission (O)
  O1001: {
    code: 'O1001',
    message: 'Override code required',
    description: 'This action requires a valid override code',
    category: 'Override',
    severity: 'warning',
    userFriendlyMessage: 'This action requires an override code from staff.',
    suggestedAction: 'Contact staff for an override code'
  },
  O1002: {
    code: 'O1002',
    message: 'Invalid override code',
    description: 'The provided override code is not valid',
    category: 'Override',
    severity: 'error',
    userFriendlyMessage: 'The override code is invalid.',
    suggestedAction: 'Check the code and try again'
  },
  O1003: {
    code: 'O1003',
    message: 'Override code expired',
    description: 'The override code has passed its expiration time',
    category: 'Override',
    severity: 'error',
    userFriendlyMessage: 'This override code has expired.',
    suggestedAction: 'Request a new code from staff'
  },
  O1004: {
    code: 'O1004',
    message: 'Override code already used',
    description: 'This override code has already been consumed',
    category: 'Override',
    severity: 'error',
    userFriendlyMessage: 'This override code has already been used.',
    suggestedAction: 'Request a new code from staff'
  },
  O1005: {
    code: 'O1005',
    message: 'Override generation denied',
    description: 'User does not have permission to generate override codes',
    category: 'Override',
    severity: 'error',
    userFriendlyMessage: 'You are not authorized to generate override codes.',
    suggestedAction: 'Contact an administrator'
  },
  O1006: {
    code: 'O1006',
    message: 'Override code generation failed',
    description: 'Failed to generate a unique override code',
    category: 'Override',
    severity: 'error',
    userFriendlyMessage: 'Unable to generate override code. Please try again.',
    suggestedAction: 'Retry or contact support'
  },
  O1007: {
    code: 'O1007',
    message: 'Override code collision',
    description: 'Could not generate unique code after multiple attempts',
    category: 'Override',
    severity: 'error',
    userFriendlyMessage: 'System busy. Please try again in a moment.',
    suggestedAction: 'Wait and try again'
  },

  // Payment/Donation (P)
  P1001: {
    code: 'P1001',
    message: 'Payment processing failed',
    description: 'Unable to process payment through payment provider',
    category: 'Payment',
    severity: 'error',
    userFriendlyMessage: 'Payment could not be processed. Please try again.',
    suggestedAction: 'Check payment details and retry'
  },
  P1002: {
    code: 'P1002',
    message: 'Invalid payment method',
    description: 'Payment method is not supported or invalid',
    category: 'Payment',
    severity: 'error',
    userFriendlyMessage: 'This payment method is not accepted.',
    suggestedAction: 'Use a different payment method'
  },
  P1003: {
    code: 'P1003',
    message: 'Insufficient funds',
    description: 'Payment declined due to insufficient funds',
    category: 'Payment',
    severity: 'error',
    userFriendlyMessage: 'Payment declined. Please check your balance.',
    suggestedAction: 'Use a different payment method'
  },
  P1004: {
    code: 'P1004',
    message: 'Payment already completed',
    description: 'This transaction has already been processed',
    category: 'Payment',
    severity: 'warning',
    userFriendlyMessage: 'This payment has already been processed.',
    suggestedAction: 'Check your transaction history'
  },

  // Resource/Availability (R)
  R1001: {
    code: 'R1001',
    message: 'Service unavailable',
    description: 'The requested service is not currently active',
    category: 'Resource',
    severity: 'error',
    userFriendlyMessage: 'This service is currently unavailable.',
    suggestedAction: 'Check back later or contact staff'
  },
  R1002: {
    code: 'R1002',
    message: 'Outside operating hours',
    description: 'Request is outside the service operating hours',
    category: 'Resource',
    severity: 'error',
    userFriendlyMessage: 'This service is not available at the requested time.',
    suggestedAction: 'Select a time within operating hours'
  },
  R1003: {
    code: 'R1003',
    message: 'No availability',
    description: 'No available slots for the requested time',
    category: 'Resource',
    severity: 'error',
    userFriendlyMessage: 'No availability at the requested time.',
    suggestedAction: 'Try a different date or time'
  },
  R1004: {
    code: 'R1004',
    message: 'Driver unavailable',
    description: 'No drivers available for this transit request',
    category: 'Resource',
    severity: 'warning',
    userFriendlyMessage: 'No drivers are currently available.',
    suggestedAction: 'Request will be assigned when a driver is available'
  },
  R1005: {
    code: 'R1005',
    message: 'Resource at capacity',
    description: 'Maximum capacity reached for this resource',
    category: 'Resource',
    severity: 'error',
    userFriendlyMessage: 'This time slot has reached capacity.',
    suggestedAction: 'Select a different time'
  },

  // System/Server (S)
  S1001: {
    code: 'S1001',
    message: 'Internal server error',
    description: 'An unexpected error occurred on the server',
    category: 'System',
    severity: 'critical',
    userFriendlyMessage: 'Something went wrong. Please try again later.',
    suggestedAction: 'Contact support if the problem persists'
  },
  S1002: {
    code: 'S1002',
    message: 'Service maintenance',
    description: 'Service is temporarily down for maintenance',
    category: 'System',
    severity: 'info',
    userFriendlyMessage: 'We are performing maintenance. Please try again soon.',
    suggestedAction: 'Check back in a few minutes'
  },
  S1003: {
    code: 'S1003',
    message: 'Feature not implemented',
    description: 'This feature is not yet available',
    category: 'System',
    severity: 'info',
    userFriendlyMessage: 'This feature is coming soon.',
    suggestedAction: 'Check back later'
  },

  // Time/Schedule (T)
  T1001: {
    code: 'T1001',
    message: '24-hour advance notice required',
    description: 'Booking must be made at least 24 hours in advance',
    category: 'Time',
    severity: 'error',
    userFriendlyMessage: 'Rides must be requested at least 24 hours in advance.',
    suggestedAction: 'Enter an override code or select a later time'
  },
  T1002: {
    code: 'T1002',
    message: 'Too far in advance',
    description: 'Booking cannot be made more than 30 days in advance',
    category: 'Time',
    severity: 'error',
    userFriendlyMessage: 'Bookings can only be made up to 30 days in advance.',
    suggestedAction: 'Select a date within 30 days'
  },
  T1003: {
    code: 'T1003',
    message: 'Invalid time slot',
    description: 'The selected time slot is not valid',
    category: 'Time',
    severity: 'error',
    userFriendlyMessage: 'Please select a valid time slot.',
    suggestedAction: 'Choose from available time slots'
  },
  T1004: {
    code: 'T1004',
    message: 'Scheduling conflict',
    description: 'This time conflicts with another booking',
    category: 'Time',
    severity: 'error',
    userFriendlyMessage: 'This time conflicts with another appointment.',
    suggestedAction: 'Select a different time'
  },
  T1005: {
    code: 'T1005',
    message: 'Past time selected',
    description: 'Selected time is in the past',
    category: 'Time',
    severity: 'error',
    userFriendlyMessage: 'Please select a future date and time.',
    suggestedAction: 'Select a time in the future'
  },

  // User/Profile (U)
  U1001: {
    code: 'U1001',
    message: 'User not found',
    description: 'No user exists with the provided identifier',
    category: 'User',
    severity: 'error',
    userFriendlyMessage: 'User not found.',
    suggestedAction: 'Verify user ID or email'
  },
  U1002: {
    code: 'U1002',
    message: 'Profile incomplete',
    description: 'User profile is missing required information',
    category: 'User',
    severity: 'warning',
    userFriendlyMessage: 'Please complete your profile to continue.',
    suggestedAction: 'Update profile with required information'
  },
  U1003: {
    code: 'U1003',
    message: 'Email already registered',
    description: 'An account already exists with this email',
    category: 'User',
    severity: 'error',
    userFriendlyMessage: 'An account with this email already exists.',
    suggestedAction: 'Log in or use a different email'
  },
  U1004: {
    code: 'U1004',
    message: 'Account inactive',
    description: 'User account has been deactivated',
    category: 'User',
    severity: 'error',
    userFriendlyMessage: 'Your account is currently inactive.',
    suggestedAction: 'Contact support to reactivate'
  },
  U1005: {
    code: 'U1005',
    message: 'Convict profile required',
    description: 'This action requires a convict profile',
    category: 'User',
    severity: 'error',
    userFriendlyMessage: 'You need a Convict profile to access this service.',
    suggestedAction: 'Complete Convict intake process'
  },

  // Workshop/Event (W)
  W1001: {
    code: 'W1001',
    message: 'Workshop not found',
    description: 'The requested workshop does not exist',
    category: 'Workshop',
    severity: 'error',
    userFriendlyMessage: 'This workshop could not be found.',
    suggestedAction: 'Check workshop ID or browse available workshops'
  },
  W1002: {
    code: 'W1002',
    message: 'Workshop full',
    description: 'Workshop has reached maximum capacity',
    category: 'Workshop',
    severity: 'error',
    userFriendlyMessage: 'This workshop is fully booked.',
    suggestedAction: 'Join waitlist or choose another workshop'
  },
  W1003: {
    code: 'W1003',
    message: 'Workshop cancelled',
    description: 'This workshop has been cancelled',
    category: 'Workshop',
    severity: 'warning',
    userFriendlyMessage: 'This workshop has been cancelled.',
    suggestedAction: 'Browse other available workshops'
  },
  W1004: {
    code: 'W1004',
    message: 'Registration closed',
    description: 'Registration for this workshop has closed',
    category: 'Workshop',
    severity: 'warning',
    userFriendlyMessage: 'Registration for this workshop has closed.',
    suggestedAction: 'Check for future workshop dates'
  },
  W1005: {
    code: 'W1005',
    message: 'Already registered',
    description: 'User is already registered for this workshop',
    category: 'Workshop',
    severity: 'info',
    userFriendlyMessage: 'You are already registered for this workshop.',
    suggestedAction: 'Check your registrations'
  },
};

/**
 * Get error details by code
 */
export function getErrorByCode(code: string): ErrorCode | undefined {
  return ERROR_CODES[code];
}

/**
 * Get user-friendly message for an error code
 */
export function getUserMessage(code: string): string {
  const error = ERROR_CODES[code];
  return error?.userFriendlyMessage || 'An unexpected error occurred.';
}

/**
 * Get all errors in a category
 */
export function getErrorsByCategory(category: string): ErrorCode[] {
  return Object.values(ERROR_CODES).filter(e => e.category === category);
}

/**
 * Format error for logging
 */
export function formatErrorLog(code: string, context?: Record<string, unknown>): string {
  const error = ERROR_CODES[code];
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    timestamp,
    code,
    message: error?.message || 'Unknown error',
    severity: error?.severity || 'error',
    context
  });
}

/**
 * Create an API error response
 */
export function createErrorResponse(code: string, details?: string) {
  const error = ERROR_CODES[code];
  return {
    error: true,
    code,
    message: error?.message || 'Unknown error',
    userMessage: error?.userFriendlyMessage || 'An unexpected error occurred.',
    details,
    severity: error?.severity || 'error'
  };
}

/**
 * Type guard to check if a string is a valid error code
 */
export function isValidErrorCode(code: string): code is keyof typeof ERROR_CODES {
  return code in ERROR_CODES;
}

/**
 * Get all error categories
 */
export function getErrorCategories(): string[] {
  const categories = new Set(Object.values(ERROR_CODES).map(e => e.category));
  return Array.from(categories).sort();
}

/**
 * Search errors by message or description
 */
export function searchErrors(query: string): ErrorCode[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(ERROR_CODES).filter(
    e => e.message.toLowerCase().includes(lowerQuery) ||
         e.description.toLowerCase().includes(lowerQuery) ||
         e.code.toLowerCase().includes(lowerQuery)
  );
}
