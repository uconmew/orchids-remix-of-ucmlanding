export const PROGRAM_TAG_IDS = {
  TRANSIT: 'web:transit',
  NOURISH: 'web:nourish',
  HAVEN: 'web:haven',
  VOICE: 'web:voice',
  NEIGHBORS: 'web:neighbors',
  STEPS: 'web:steps',
  AWAKEN: 'web:awaken',
  SHEPHERD: 'web:shepherd',
  EQUIP: 'web:equip',
  BRIDGE: 'web:bridge',
} as const;

export const INPERSON_TAG_IDS = {
  TRANSIT: 'inperson:transit',
  NOURISH: 'inperson:nourish',
  HAVEN: 'inperson:haven',
  VOICE: 'inperson:voice',
  NEIGHBORS: 'inperson:neighbors',
  STEPS: 'inperson:steps',
  AWAKEN: 'inperson:awaken',
  SHEPHERD: 'inperson:shepherd',
  EQUIP: 'inperson:equip',
  BRIDGE: 'inperson:bridge',
} as const;

export type ProgramTagId = typeof PROGRAM_TAG_IDS[keyof typeof PROGRAM_TAG_IDS];
export type InPersonTagId = typeof INPERSON_TAG_IDS[keyof typeof INPERSON_TAG_IDS];

export const BASE_ROLES = {
  CONVICT: 'convict',
  VOLUNTEER: 'volunteer',
  STAFF: 'staff',
  MENTOR: 'mentor',
} as const;

export type BaseRole = typeof BASE_ROLES[keyof typeof BASE_ROLES];

export const POSITION_TAGS = {
  DRIVER: 'driver',
  FACILITATOR: 'facilitator',
  GREETER: 'greeter',
  PRAYER_PARTNER: 'prayer_partner',
  SMALL_GROUP_LEADER: 'small_group_leader',
  SPONSOR: 'sponsor',
  COORDINATOR: 'coordinator',
  COUNSELOR: 'counselor',
  CHAPLAIN: 'chaplain',
  DIRECTOR: 'director',
  ADMIN: 'admin',
  DISPATCHER: 'dispatcher',
  DISTRIBUTION_VOLUNTEER: 'distribution_volunteer',
  FOOD_PACKER: 'food_packer',
  PANTRY_STOCKER: 'pantry_stocker',
  PANTRY_MANAGER: 'pantry_manager',
  DISTRIBUTION_LEAD: 'distribution_lead',
  INVENTORY_COORDINATOR: 'inventory_coordinator',
  HOUSING_COORDINATOR: 'housing_coordinator',
  SHELTER_SUPERVISOR: 'shelter_supervisor',
  CASE_MANAGER: 'case_manager',
  INTAKE_ASSISTANT: 'intake_assistant',
  FACILITY_HELPER: 'facility_helper',
  ADVOCATE: 'advocate',
  CAMPAIGN_COORDINATOR: 'campaign_coordinator',
  POLICY_ANALYST: 'policy_analyst',
  COURT_COMPANION: 'court_companion',
  CASE_DOCUMENTER: 'case_documenter',
  OUTREACH_VOLUNTEER: 'outreach_volunteer',
  TEAM_LEAD: 'team_lead',
  EVENT_COORDINATOR: 'event_coordinator',
  COMMUNITY_CONNECTOR: 'community_connector',
  COMMUNITY_COORDINATOR: 'community_coordinator',
  PARTNERSHIP_MANAGER: 'partnership_manager',
  MEETING_LEADER: 'meeting_leader',
  RECOVERY_COORDINATOR: 'recovery_coordinator',
  CRISIS_RESPONDER: 'crisis_responder',
  TREATMENT_LIAISON: 'treatment_liaison',
  TWELFTH_STEP_VOLUNTEER: '12th_step_volunteer',
  BIBLE_STUDY_COORDINATOR: 'bible_study_coordinator',
  CURRICULUM_WRITER: 'curriculum_writer',
  GROUP_OVERSEER: 'group_overseer',
  DISCUSSION_FACILITATOR: 'discussion_facilitator',
  PASTORAL_COUNSELOR: 'pastoral_counselor',
  DEVOTIONAL_LEADER: 'devotional_leader',
  VISITATION_VOLUNTEER: 'visitation_volunteer',
  WORKSHOP_ASSISTANT: 'workshop_assistant',
  ATTENDANCE_TAKER: 'attendance_taker',
  TECH_HELPER: 'tech_helper',
  WORKSHOP_COORDINATOR: 'workshop_coordinator',
  CURRICULUM_DEVELOPER: 'curriculum_developer',
  MENTOR: 'mentor',
  PEER_FACILITATOR: 'peer_facilitator',
  ACCOUNTABILITY_PARTNER: 'accountability_partner',
  MATCH_SPECIALIST: 'match_specialist',
  MENTOR_COORDINATOR: 'mentor_coordinator',
  PEER_PROGRAM_MANAGER: 'peer_program_manager',
  TRANSIT_COORDINATOR: 'transit_coordinator',
} as const;

export type PositionTag = typeof POSITION_TAGS[keyof typeof POSITION_TAGS];

export interface ProgramTagDefinition {
  id: string;
  name: string;
  track: 'outreach' | 'open_services';
  description: string;
  icon: string;
}

export const PROGRAM_TAGS: Record<string, ProgramTagDefinition> = {
  [PROGRAM_TAG_IDS.TRANSIT]: {
    id: PROGRAM_TAG_IDS.TRANSIT,
    name: 'UCON TRANSIT',
    track: 'outreach',
    description: 'Digital ride requests, booking management',
    icon: 'Truck',
  },
  [PROGRAM_TAG_IDS.NOURISH]: {
    id: PROGRAM_TAG_IDS.NOURISH,
    name: 'UCON NOURISH',
    track: 'outreach',
    description: 'Food assistance requests, pantry registration',
    icon: 'Utensils',
  },
  [PROGRAM_TAG_IDS.HAVEN]: {
    id: PROGRAM_TAG_IDS.HAVEN,
    name: 'UCON HAVEN',
    track: 'outreach',
    description: 'Housing applications, waitlist management',
    icon: 'Home',
  },
  [PROGRAM_TAG_IDS.VOICE]: {
    id: PROGRAM_TAG_IDS.VOICE,
    name: 'UCON VOICE',
    track: 'outreach',
    description: 'Advocacy case submissions, campaign participation',
    icon: 'MessageSquare',
  },
  [PROGRAM_TAG_IDS.NEIGHBORS]: {
    id: PROGRAM_TAG_IDS.NEIGHBORS,
    name: 'UCON NEIGHBORS',
    track: 'outreach',
    description: 'Event registration, project suggestions',
    icon: 'Users',
  },
  [PROGRAM_TAG_IDS.STEPS]: {
    id: PROGRAM_TAG_IDS.STEPS,
    name: 'UCON STEPS',
    track: 'outreach',
    description: 'Meeting schedules, sponsor requests, step tracking',
    icon: 'Stethoscope',
  },
  [PROGRAM_TAG_IDS.AWAKEN]: {
    id: PROGRAM_TAG_IDS.AWAKEN,
    name: 'UCON AWAKEN',
    track: 'open_services',
    description: 'Bible study registration, material access',
    icon: 'BookOpen',
  },
  [PROGRAM_TAG_IDS.SHEPHERD]: {
    id: PROGRAM_TAG_IDS.SHEPHERD,
    name: 'UCON SHEPHERD',
    track: 'open_services',
    description: 'Counseling requests, devotional access',
    icon: 'Heart',
  },
  [PROGRAM_TAG_IDS.EQUIP]: {
    id: PROGRAM_TAG_IDS.EQUIP,
    name: 'UCON EQUIP',
    track: 'open_services',
    description: 'Workshop registration, certificate tracking',
    icon: 'GraduationCap',
  },
  [PROGRAM_TAG_IDS.BRIDGE]: {
    id: PROGRAM_TAG_IDS.BRIDGE,
    name: 'UCON BRIDGE',
    track: 'open_services',
    description: 'Mentor matching, progress submissions',
    icon: 'HandHeart',
  },
};

export interface ProgramPermission {
  key: string;
  displayName: string;
  description: string;
  baseRole: BaseRole;
  minClearance: number;
  requiredDuty?: PositionTag;
  apiEndpoint?: string;
}

export const TRANSIT_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'transit:request_ride', displayName: 'Request Ride', description: 'Submit new ride requests', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/transit/book' },
    { key: 'transit:view_own_bookings', displayName: 'View Own Bookings', description: 'View personal booking history', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/outreach/transit?userId={self}' },
    { key: 'transit:cancel_own_request', displayName: 'Cancel Own Request', description: 'Cancel pending ride requests', baseRole: 'convict', minClearance: 0, apiEndpoint: 'DELETE /api/outreach/transit/{id}' },
    { key: 'transit:rate_driver', displayName: 'Rate Driver', description: 'Submit driver feedback', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/transit/{id}/rating' },
    { key: 'transit:update_pickup_location', displayName: 'Update Pickup Location', description: 'Modify pickup details', baseRole: 'convict', minClearance: 0, apiEndpoint: 'PATCH /api/outreach/transit/{id}/location' },
    { key: 'transit:view_ride_status', displayName: 'View Ride Status', description: 'Real-time ride tracking', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/outreach/transit/{id}/status' },
  ],
  volunteer: [
    { key: 'transit:view_approved_rides', displayName: 'View Approved Rides', description: 'See assigned/available rides', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'driver', apiEndpoint: 'GET /api/admin/outreach/transit?status=approved' },
    { key: 'transit:self_assign_driver', displayName: 'Self Assign', description: 'Claim available rides', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'driver', apiEndpoint: 'PATCH /api/admin/outreach/transit/{id}/assign' },
    { key: 'transit:complete_ride', displayName: 'Complete Ride', description: 'Mark ride as completed', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'driver', apiEndpoint: 'PATCH /api/admin/outreach/transit/{id}/complete' },
    { key: 'transit:log_mileage', displayName: 'Log Mileage', description: 'Record trip mileage', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'driver', apiEndpoint: 'POST /api/admin/outreach/transit/{id}/mileage' },
    { key: 'transit:submit_expense', displayName: 'Submit Expense', description: 'Submit fuel/parking expenses', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'driver', apiEndpoint: 'POST /api/admin/outreach/transit/expenses' },
    { key: 'transit:report_incident', displayName: 'Report Incident', description: 'Log safety incidents', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'driver', apiEndpoint: 'POST /api/admin/outreach/transit/{id}/incident' },
    { key: 'transit:update_availability', displayName: 'Update Availability', description: 'Set driving schedule', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'driver', apiEndpoint: 'POST /api/admin/outreach/transit/availability' },
  ],
  staff: [
    { key: 'transit:approve_requests', displayName: 'Approve Requests', description: 'Approve pending ride requests', baseRole: 'staff', minClearance: 40, requiredDuty: 'dispatcher', apiEndpoint: 'PATCH /api/admin/outreach/transit/{id}/approve' },
    { key: 'transit:deny_requests', displayName: 'Deny Requests', description: 'Deny requests with reason', baseRole: 'staff', minClearance: 40, requiredDuty: 'dispatcher', apiEndpoint: 'PATCH /api/admin/outreach/transit/{id}/deny' },
    { key: 'transit:assign_drivers', displayName: 'Assign Drivers', description: 'Assign drivers to rides', baseRole: 'staff', minClearance: 40, requiredDuty: 'dispatcher', apiEndpoint: 'PATCH /api/admin/outreach/transit/{id}/assign' },
    { key: 'transit:manage_schedule', displayName: 'Manage Schedule', description: 'Master schedule management', baseRole: 'staff', minClearance: 40, requiredDuty: 'transit_coordinator', apiEndpoint: 'GET/POST /api/admin/outreach/transit/schedule' },
    { key: 'transit:view_all_bookings', displayName: 'View All Bookings', description: 'Access all booking data', baseRole: 'staff', minClearance: 40, requiredDuty: 'dispatcher', apiEndpoint: 'GET /api/admin/outreach/transit' },
    { key: 'transit:edit_booking', displayName: 'Edit Booking', description: 'Modify any booking', baseRole: 'staff', minClearance: 40, requiredDuty: 'dispatcher', apiEndpoint: 'PATCH /api/admin/outreach/transit/{id}' },
    { key: 'transit:emergency_dispatch', displayName: 'Emergency Dispatch', description: 'Priority dispatch override', baseRole: 'staff', minClearance: 40, requiredDuty: 'transit_coordinator', apiEndpoint: 'POST /api/admin/outreach/transit/emergency' },
    { key: 'transit:manage_fleet', displayName: 'Manage Fleet', description: 'Vehicle management', baseRole: 'staff', minClearance: 40, requiredDuty: 'transit_coordinator', apiEndpoint: 'GET/POST /api/admin/outreach/transit/fleet' },
    { key: 'transit:generate_reports', displayName: 'Generate Reports', description: 'Analytics and reports', baseRole: 'staff', minClearance: 40, requiredDuty: 'transit_coordinator', apiEndpoint: 'GET /api/admin/outreach/transit/reports' },
    { key: 'transit:approve_expenses', displayName: 'Approve Expenses', description: 'Approve expense claims', baseRole: 'staff', minClearance: 40, requiredDuty: 'transit_coordinator', apiEndpoint: 'PATCH /api/admin/outreach/transit/expenses/{id}/approve' },
  ],
};

export const NOURISH_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'nourish:request_food_assistance', displayName: 'Request Food Assistance', description: 'Submit food assistance request', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/nourish/request' },
    { key: 'nourish:view_pantry_hours', displayName: 'View Pantry Hours', description: 'View pantry schedule', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/outreach/nourish/hours' },
    { key: 'nourish:register_distribution_event', displayName: 'Register for Distribution', description: 'Sign up for food distribution', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/nourish/events/{id}/register' },
    { key: 'nourish:track_assistance_history', displayName: 'Track History', description: 'View personal assistance history', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/outreach/nourish/history?userId={self}' },
    { key: 'nourish:specify_dietary_needs', displayName: 'Specify Dietary Needs', description: 'Set dietary restrictions', baseRole: 'convict', minClearance: 0, apiEndpoint: 'PATCH /api/outreach/nourish/preferences' },
  ],
  volunteer: [
    { key: 'nourish:check_in_recipients', displayName: 'Check In Recipients', description: 'Check in recipients at events', baseRole: 'volunteer', minClearance: 10, requiredDuty: 'distribution_volunteer', apiEndpoint: 'POST /api/admin/outreach/nourish/checkin' },
    { key: 'nourish:distribute_food', displayName: 'Distribute Food', description: 'Record food distributed', baseRole: 'volunteer', minClearance: 10, requiredDuty: 'distribution_volunteer', apiEndpoint: 'POST /api/admin/outreach/nourish/distribute' },
    { key: 'nourish:log_distribution', displayName: 'Log Distribution', description: 'Log distribution metrics', baseRole: 'volunteer', minClearance: 10, requiredDuty: 'distribution_volunteer', apiEndpoint: 'POST /api/admin/outreach/nourish/log' },
    { key: 'nourish:pack_boxes', displayName: 'Pack Boxes', description: 'Record boxes packed', baseRole: 'volunteer', minClearance: 10, requiredDuty: 'food_packer', apiEndpoint: 'POST /api/admin/outreach/nourish/packing' },
    { key: 'nourish:stock_pantry', displayName: 'Stock Pantry', description: 'Update inventory from donations', baseRole: 'volunteer', minClearance: 10, requiredDuty: 'pantry_stocker', apiEndpoint: 'POST /api/admin/outreach/nourish/stock' },
    { key: 'nourish:quality_check', displayName: 'Quality Check', description: 'Check food expiration/quality', baseRole: 'volunteer', minClearance: 10, requiredDuty: 'pantry_stocker', apiEndpoint: 'POST /api/admin/outreach/nourish/quality' },
  ],
  staff: [
    { key: 'nourish:manage_inventory', displayName: 'Manage Inventory', description: 'Full inventory management', baseRole: 'staff', minClearance: 35, requiredDuty: 'pantry_manager', apiEndpoint: 'GET/POST/PATCH /api/admin/outreach/nourish/inventory' },
    { key: 'nourish:approve_special_requests', displayName: 'Approve Special Requests', description: 'Approve special dietary requests', baseRole: 'staff', minClearance: 35, requiredDuty: 'pantry_manager', apiEndpoint: 'PATCH /api/admin/outreach/nourish/requests/{id}/approve' },
    { key: 'nourish:coordinate_food_drives', displayName: 'Coordinate Food Drives', description: 'Plan and manage food drives', baseRole: 'staff', minClearance: 35, requiredDuty: 'distribution_lead', apiEndpoint: 'GET/POST /api/admin/outreach/nourish/drives' },
    { key: 'nourish:create_events', displayName: 'Create Events', description: 'Create distribution events', baseRole: 'staff', minClearance: 35, requiredDuty: 'distribution_lead', apiEndpoint: 'POST /api/admin/outreach/nourish/events' },
    { key: 'nourish:generate_reports', displayName: 'Generate Reports', description: 'Generate distribution reports', baseRole: 'staff', minClearance: 35, requiredDuty: 'inventory_coordinator', apiEndpoint: 'GET /api/admin/outreach/nourish/reports' },
  ],
};

export const HAVEN_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'haven:request_housing_assistance', displayName: 'Request Housing', description: 'Submit housing assistance request', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/haven/request' },
    { key: 'haven:view_housing_resources', displayName: 'View Resources', description: 'Access housing resource directory', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/outreach/haven/resources' },
    { key: 'haven:submit_housing_application', displayName: 'Submit Application', description: 'Apply for housing programs', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/haven/apply' },
    { key: 'haven:check_application_status', displayName: 'Check Status', description: 'View application status', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/outreach/haven/applications?userId={self}' },
    { key: 'haven:emergency_shelter_request', displayName: 'Emergency Shelter', description: 'Request emergency shelter', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/haven/emergency' },
  ],
  volunteer: [
    { key: 'haven:assist_intake', displayName: 'Assist Intake', description: 'Help with intake paperwork', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'intake_assistant', apiEndpoint: 'POST /api/admin/outreach/haven/intake/assist' },
    { key: 'haven:prepare_units', displayName: 'Prepare Units', description: 'Record unit preparation', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'facility_helper', apiEndpoint: 'POST /api/admin/outreach/haven/units/prepare' },
    { key: 'haven:welcome_residents', displayName: 'Welcome Residents', description: 'Check in new residents', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'intake_assistant', apiEndpoint: 'POST /api/admin/outreach/haven/checkin' },
    { key: 'haven:maintenance_reporting', displayName: 'Report Maintenance', description: 'Report maintenance issues', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'facility_helper', apiEndpoint: 'POST /api/admin/outreach/haven/maintenance' },
  ],
  staff: [
    { key: 'haven:process_applications', displayName: 'Process Applications', description: 'Review and process applications', baseRole: 'staff', minClearance: 50, requiredDuty: 'housing_coordinator', apiEndpoint: 'PATCH /api/admin/outreach/haven/applications/{id}' },
    { key: 'haven:assign_housing', displayName: 'Assign Housing', description: 'Assign housing units', baseRole: 'staff', minClearance: 50, requiredDuty: 'housing_coordinator', apiEndpoint: 'POST /api/admin/outreach/haven/assign' },
    { key: 'haven:manage_waitlist', displayName: 'Manage Waitlist', description: 'Manage housing waitlist', baseRole: 'staff', minClearance: 50, requiredDuty: 'housing_coordinator', apiEndpoint: 'GET/POST/PATCH /api/admin/outreach/haven/waitlist' },
    { key: 'haven:coordinate_emergency_shelter', displayName: 'Coordinate Emergency', description: 'Emergency shelter operations', baseRole: 'staff', minClearance: 50, requiredDuty: 'shelter_supervisor', apiEndpoint: 'GET/POST /api/admin/outreach/haven/emergency' },
    { key: 'haven:case_management', displayName: 'Case Management', description: 'Full case management', baseRole: 'staff', minClearance: 50, requiredDuty: 'case_manager', apiEndpoint: 'GET/POST/PATCH /api/admin/outreach/haven/cases' },
    { key: 'haven:generate_reports', displayName: 'Generate Reports', description: 'Generate housing reports', baseRole: 'staff', minClearance: 50, requiredDuty: 'housing_coordinator', apiEndpoint: 'GET /api/admin/outreach/haven/reports' },
  ],
};

export const VOICE_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'voice:request_advocacy', displayName: 'Request Advocacy', description: 'Request advocacy assistance', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/voice/request' },
    { key: 'voice:submit_testimony', displayName: 'Submit Testimony', description: 'Submit personal testimony', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/voice/testimony' },
    { key: 'voice:join_advocacy_campaign', displayName: 'Join Campaign', description: 'Join advocacy campaigns', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/voice/campaigns/{id}/join' },
    { key: 'voice:sign_petitions', displayName: 'Sign Petitions', description: 'Sign advocacy petitions', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/voice/petitions/{id}/sign' },
    { key: 'voice:request_court_support', displayName: 'Court Support', description: 'Request court accompaniment', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/voice/court-support' },
  ],
  volunteer: [
    { key: 'voice:accompany_to_hearings', displayName: 'Court Accompaniment', description: 'Court accompaniment', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'court_companion', apiEndpoint: 'POST /api/admin/outreach/voice/accompaniment' },
    { key: 'voice:document_cases', displayName: 'Document Cases', description: 'Document case details', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'case_documenter', apiEndpoint: 'POST /api/admin/outreach/voice/cases/{id}/notes' },
    { key: 'voice:community_outreach', displayName: 'Community Outreach', description: 'Conduct community outreach', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'outreach_volunteer', apiEndpoint: 'POST /api/admin/outreach/voice/outreach' },
    { key: 'voice:petition_collection', displayName: 'Collect Signatures', description: 'Collect petition signatures', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'outreach_volunteer', apiEndpoint: 'POST /api/admin/outreach/voice/petitions/{id}/signatures' },
  ],
  staff: [
    { key: 'voice:represent_at_hearings', displayName: 'Represent at Hearings', description: 'Legal representation support', baseRole: 'staff', minClearance: 60, requiredDuty: 'advocate', apiEndpoint: 'POST /api/admin/outreach/voice/representation' },
    { key: 'voice:file_complaints', displayName: 'File Complaints', description: 'File official complaints', baseRole: 'staff', minClearance: 60, requiredDuty: 'advocate', apiEndpoint: 'POST /api/admin/outreach/voice/complaints' },
    { key: 'voice:coordinate_campaigns', displayName: 'Coordinate Campaigns', description: 'Manage advocacy campaigns', baseRole: 'staff', minClearance: 60, requiredDuty: 'campaign_coordinator', apiEndpoint: 'GET/POST/PATCH /api/admin/outreach/voice/campaigns' },
    { key: 'voice:policy_research', displayName: 'Policy Research', description: 'Conduct policy research', baseRole: 'staff', minClearance: 60, requiredDuty: 'policy_analyst', apiEndpoint: 'GET/POST /api/admin/outreach/voice/research' },
    { key: 'voice:case_management', displayName: 'Case Management', description: 'Full case management', baseRole: 'staff', minClearance: 60, requiredDuty: 'advocate', apiEndpoint: 'GET/POST/PATCH /api/admin/outreach/voice/cases' },
    { key: 'voice:generate_reports', displayName: 'Generate Reports', description: 'Generate advocacy reports', baseRole: 'staff', minClearance: 60, requiredDuty: 'campaign_coordinator', apiEndpoint: 'GET /api/admin/outreach/voice/reports' },
  ],
};

export const NEIGHBORS_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'neighbors:join_community_events', displayName: 'Join Events', description: 'Register for community events', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/events/{id}/register' },
    { key: 'neighbors:suggest_projects', displayName: 'Suggest Projects', description: 'Suggest community projects', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/neighbors/suggestions' },
    { key: 'neighbors:view_events', displayName: 'View Events', description: 'Browse community events', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/outreach/neighbors/events' },
    { key: 'neighbors:provide_feedback', displayName: 'Provide Feedback', description: 'Submit event feedback', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/neighbors/events/{id}/feedback' },
  ],
  volunteer: [
    { key: 'neighbors:lead_cleanup_teams', displayName: 'Lead Cleanups', description: 'Lead community cleanups', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'team_lead', apiEndpoint: 'POST /api/admin/outreach/neighbors/cleanups/{id}/lead' },
    { key: 'neighbors:organize_block_parties', displayName: 'Organize Events', description: 'Organize neighborhood events', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'event_coordinator', apiEndpoint: 'POST /api/admin/outreach/neighbors/events' },
    { key: 'neighbors:community_liaison', displayName: 'Community Liaison', description: 'Liaison with neighborhood groups', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'community_connector', apiEndpoint: 'POST /api/admin/outreach/neighbors/liaison' },
    { key: 'neighbors:photography', displayName: 'Event Photography', description: 'Event photography', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'event_coordinator', apiEndpoint: 'POST /api/admin/outreach/neighbors/events/{id}/photos' },
  ],
  staff: [
    { key: 'neighbors:approve_projects', displayName: 'Approve Projects', description: 'Approve community projects', baseRole: 'staff', minClearance: 40, requiredDuty: 'community_coordinator', apiEndpoint: 'PATCH /api/admin/outreach/neighbors/projects/{id}/approve' },
    { key: 'neighbors:manage_partnerships', displayName: 'Manage Partnerships', description: 'Manage community partnerships', baseRole: 'staff', minClearance: 40, requiredDuty: 'partnership_manager', apiEndpoint: 'GET/POST/PATCH /api/admin/outreach/neighbors/partnerships' },
    { key: 'neighbors:budget_events', displayName: 'Budget Events', description: 'Manage event budgets', baseRole: 'staff', minClearance: 40, requiredDuty: 'community_coordinator', apiEndpoint: 'GET/POST/PATCH /api/admin/outreach/neighbors/budgets' },
    { key: 'neighbors:generate_reports', displayName: 'Generate Reports', description: 'Generate engagement reports', baseRole: 'staff', minClearance: 40, requiredDuty: 'community_coordinator', apiEndpoint: 'GET /api/admin/outreach/neighbors/reports' },
  ],
};

export const STEPS_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'steps:join_recovery_meeting', displayName: 'Join Meeting', description: 'Register for meetings', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/steps/meetings/{id}/join' },
    { key: 'steps:request_sponsor', displayName: 'Request Sponsor', description: 'Request a sponsor', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/steps/sponsor-request' },
    { key: 'steps:submit_step_work', displayName: 'Submit Step Work', description: 'Submit step work assignments', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/steps/stepwork' },
    { key: 'steps:access_recovery_resources', displayName: 'Access Resources', description: 'Access recovery materials', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/outreach/steps/resources' },
    { key: 'steps:crisis_call', displayName: 'Crisis Call', description: 'Request crisis support', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/steps/crisis' },
    { key: 'steps:track_sobriety', displayName: 'Track Sobriety', description: 'Track sobriety milestones', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET/POST /api/outreach/steps/sobriety' },
    { key: 'steps:request_chip', displayName: 'Request Chip', description: 'Request sobriety chip', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/outreach/steps/chips' },
  ],
  volunteer: [
    { key: 'steps:share_at_meetings', displayName: 'Lead Sharing', description: 'Lead sharing at meetings', baseRole: 'volunteer', minClearance: 30, requiredDuty: 'meeting_leader', apiEndpoint: 'POST /api/admin/outreach/steps/meetings/{id}/share' },
    { key: 'steps:sponsor_individuals', displayName: 'Sponsor Individuals', description: 'Accept sponsees', baseRole: 'volunteer', minClearance: 30, requiredDuty: 'sponsor', apiEndpoint: 'PATCH /api/admin/outreach/steps/sponsorship/{id}/accept' },
    { key: 'steps:lead_meeting', displayName: 'Lead Meeting', description: 'Lead recovery meetings', baseRole: 'volunteer', minClearance: 30, requiredDuty: 'meeting_leader', apiEndpoint: 'POST /api/admin/outreach/steps/meetings/{id}/lead' },
    { key: 'steps:12th_step_call', displayName: '12th Step Call', description: 'Respond to 12th step calls', baseRole: 'volunteer', minClearance: 30, requiredDuty: '12th_step_volunteer', apiEndpoint: 'POST /api/admin/outreach/steps/12th-step' },
    { key: 'steps:review_step_work', displayName: 'Review Step Work', description: 'Review sponsee step work', baseRole: 'volunteer', minClearance: 30, requiredDuty: 'sponsor', apiEndpoint: 'GET/PATCH /api/admin/outreach/steps/stepwork/{id}' },
  ],
  staff: [
    { key: 'steps:coordinate_meetings', displayName: 'Coordinate Meetings', description: 'Coordinate all meetings', baseRole: 'staff', minClearance: 50, requiredDuty: 'recovery_coordinator', apiEndpoint: 'GET/POST/PATCH /api/admin/outreach/steps/meetings' },
    { key: 'steps:approve_sponsors', displayName: 'Approve Sponsors', description: 'Approve sponsor applications', baseRole: 'staff', minClearance: 50, requiredDuty: 'recovery_coordinator', apiEndpoint: 'PATCH /api/admin/outreach/steps/sponsors/{id}/approve' },
    { key: 'steps:crisis_response', displayName: 'Crisis Response', description: 'Manage crisis responses', baseRole: 'staff', minClearance: 50, requiredDuty: 'crisis_responder', apiEndpoint: 'GET/POST /api/admin/outreach/steps/crisis' },
    { key: 'steps:clinical_integration', displayName: 'Clinical Integration', description: 'Integrate with clinical services', baseRole: 'staff', minClearance: 50, requiredDuty: 'treatment_liaison', apiEndpoint: 'GET/POST /api/admin/outreach/steps/clinical' },
    { key: 'steps:treatment_referral', displayName: 'Treatment Referral', description: 'Refer to treatment programs', baseRole: 'staff', minClearance: 50, requiredDuty: 'treatment_liaison', apiEndpoint: 'POST /api/admin/outreach/steps/referrals' },
    { key: 'steps:generate_reports', displayName: 'Generate Reports', description: 'Generate recovery reports', baseRole: 'staff', minClearance: 50, requiredDuty: 'recovery_coordinator', apiEndpoint: 'GET /api/admin/outreach/steps/reports' },
  ],
};

export const AWAKEN_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'awaken:attend_study', displayName: 'Attend Study', description: 'Register for Bible studies', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/awaken-studies/{id}/register' },
    { key: 'awaken:view_materials', displayName: 'View Materials', description: 'Access full study materials', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/awaken-studies/{id}/materials' },
    { key: 'awaken:submit_reflections', displayName: 'Submit Reflections', description: 'Submit study reflections', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/awaken-studies/{id}/reflections' },
    { key: 'awaken:join_accountability_group', displayName: 'Join Accountability', description: 'Join accountability groups', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/awaken-studies/accountability/{id}/join' },
    { key: 'awaken:track_progress', displayName: 'Track Progress', description: 'Track study progress', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/awaken-studies/progress?userId={self}' },
    { key: 'awaken:prayer_requests', displayName: 'Prayer Requests', description: 'Submit study prayer requests', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/awaken-studies/{id}/prayer-requests' },
  ],
  volunteer: [
    { key: 'awaken:lead_small_group', displayName: 'Lead Small Group', description: 'Lead small group discussions', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'small_group_leader', apiEndpoint: 'POST /api/admin/awaken-studies/{id}/small-groups/{gid}/lead' },
    { key: 'awaken:facilitate_discussion', displayName: 'Facilitate Discussion', description: 'Facilitate main discussions', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'discussion_facilitator', apiEndpoint: 'POST /api/admin/awaken-studies/{id}/facilitate' },
    { key: 'awaken:prayer_leader', displayName: 'Prayer Leader', description: 'Lead group prayer', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'small_group_leader', apiEndpoint: 'POST /api/admin/awaken-studies/{id}/prayer/lead' },
    { key: 'awaken:welcome_attendees', displayName: 'Welcome Attendees', description: 'Welcome and orient new attendees', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'greeter', apiEndpoint: 'POST /api/admin/awaken-studies/{id}/welcome' },
    { key: 'awaken:track_attendance', displayName: 'Track Attendance', description: 'Record attendance', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'greeter', apiEndpoint: 'POST /api/admin/awaken-studies/{id}/attendance' },
  ],
  staff: [
    { key: 'awaken:create_study_series', displayName: 'Create Study Series', description: 'Create study series', baseRole: 'staff', minClearance: 45, requiredDuty: 'bible_study_coordinator', apiEndpoint: 'POST /api/admin/awaken-studies' },
    { key: 'awaken:develop_curriculum', displayName: 'Develop Curriculum', description: 'Develop study curriculum', baseRole: 'staff', minClearance: 45, requiredDuty: 'curriculum_writer', apiEndpoint: 'GET/POST/PATCH /api/admin/awaken-studies/curriculum' },
    { key: 'awaken:train_leaders', displayName: 'Train Leaders', description: 'Train study leaders', baseRole: 'staff', minClearance: 45, requiredDuty: 'bible_study_coordinator', apiEndpoint: 'POST /api/admin/awaken-studies/training' },
    { key: 'awaken:oversee_groups', displayName: 'Oversee Groups', description: 'Oversee all study groups', baseRole: 'staff', minClearance: 45, requiredDuty: 'group_overseer', apiEndpoint: 'GET /api/admin/awaken-studies/groups' },
    { key: 'awaken:theological_guidance', displayName: 'Theological Guidance', description: 'Provide theological guidance', baseRole: 'staff', minClearance: 45, requiredDuty: 'group_overseer', apiEndpoint: 'POST /api/admin/awaken-studies/{id}/guidance' },
    { key: 'awaken:generate_reports', displayName: 'Generate Reports', description: 'Generate study reports', baseRole: 'staff', minClearance: 45, requiredDuty: 'bible_study_coordinator', apiEndpoint: 'GET /api/admin/awaken-studies/reports' },
  ],
};

export const SHEPHERD_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'shepherd:request_pastoral_counseling', displayName: 'Request Counseling', description: 'Request pastoral counseling', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/shepherd/counseling-request' },
    { key: 'shepherd:schedule_counseling', displayName: 'Schedule Counseling', description: 'Schedule counseling sessions', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/shepherd/appointments' },
    { key: 'shepherd:access_devotionals', displayName: 'Access Devotionals', description: 'Access devotional materials', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/services/shepherd/devotionals' },
    { key: 'shepherd:request_crisis_support', displayName: 'Request Crisis Support', description: 'Request crisis pastoral support', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/shepherd/crisis' },
    { key: 'shepherd:submit_prayer_request', displayName: 'Submit Prayer Request', description: 'Submit pastoral prayer request', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/shepherd/prayer-requests' },
    { key: 'shepherd:spiritual_assessment', displayName: 'Spiritual Assessment', description: 'Complete spiritual assessments', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/shepherd/assessments' },
  ],
  volunteer: [
    { key: 'shepherd:pray_with_others', displayName: 'Pray With Others', description: 'Lead prayer with individuals', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'prayer_partner', apiEndpoint: 'POST /api/admin/services/shepherd/prayer-sessions' },
    { key: 'shepherd:devotional_companion', displayName: 'Devotional Companion', description: 'Accompany in devotional practice', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'devotional_leader', apiEndpoint: 'POST /api/admin/services/shepherd/devotional-companion' },
    { key: 'shepherd:visitation_support', displayName: 'Visitation Support', description: 'Hospital/home visitation', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'visitation_volunteer', apiEndpoint: 'POST /api/admin/services/shepherd/visitation' },
    { key: 'shepherd:crisis_prayer_chain', displayName: 'Crisis Prayer Chain', description: 'Participate in crisis prayer', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'prayer_partner', apiEndpoint: 'POST /api/admin/services/shepherd/prayer-chain' },
    { key: 'shepherd:grief_support', displayName: 'Grief Support', description: 'Provide grief companionship', baseRole: 'volunteer', minClearance: 20, requiredDuty: 'visitation_volunteer', apiEndpoint: 'POST /api/admin/services/shepherd/grief-support' },
  ],
  staff: [
    { key: 'shepherd:provide_pastoral_counseling', displayName: 'Provide Counseling', description: 'Provide pastoral counseling', baseRole: 'staff', minClearance: 55, requiredDuty: 'pastoral_counselor', apiEndpoint: 'GET/POST /api/admin/services/shepherd/counseling' },
    { key: 'shepherd:crisis_intervention', displayName: 'Crisis Intervention', description: 'Crisis intervention', baseRole: 'staff', minClearance: 55, requiredDuty: 'crisis_responder', apiEndpoint: 'GET/POST /api/admin/services/shepherd/crisis' },
    { key: 'shepherd:spiritual_guidance', displayName: 'Spiritual Guidance', description: 'Provide spiritual direction', baseRole: 'staff', minClearance: 55, requiredDuty: 'pastoral_counselor', apiEndpoint: 'GET/POST /api/admin/services/shepherd/direction' },
    { key: 'shepherd:officiate_ceremonies', displayName: 'Officiate Ceremonies', description: 'Officiate ceremonies', baseRole: 'staff', minClearance: 55, requiredDuty: 'chaplain', apiEndpoint: 'POST /api/admin/services/shepherd/ceremonies' },
    { key: 'shepherd:confidential_case_notes', displayName: 'Case Notes', description: 'Manage confidential case notes', baseRole: 'staff', minClearance: 55, requiredDuty: 'pastoral_counselor', apiEndpoint: 'GET/POST /api/admin/services/shepherd/case-notes' },
    { key: 'shepherd:sacramental_services', displayName: 'Sacramental Services', description: 'Provide sacramental services', baseRole: 'staff', minClearance: 55, requiredDuty: 'chaplain', apiEndpoint: 'POST /api/admin/services/shepherd/sacraments' },
    { key: 'shepherd:generate_reports', displayName: 'Generate Reports', description: 'Generate pastoral reports', baseRole: 'staff', minClearance: 55, requiredDuty: 'chaplain', apiEndpoint: 'GET /api/admin/services/shepherd/reports' },
  ],
};

export const EQUIP_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'equip:register_workshop', displayName: 'Register Workshop', description: 'Register for workshops', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/workshops/{id}/register' },
    { key: 'equip:view_materials', displayName: 'View Materials', description: 'Access workshop materials', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/workshops/{id}/files' },
    { key: 'equip:submit_assignments', displayName: 'Submit Assignments', description: 'Submit workshop assignments', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/workshops/{id}/assignments' },
    { key: 'equip:request_certificate', displayName: 'Request Certificate', description: 'Request completion certificate', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/workshops/{id}/certificate' },
    { key: 'equip:evaluate_workshop', displayName: 'Evaluate Workshop', description: 'Submit workshop evaluation', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/workshops/{id}/evaluation' },
    { key: 'equip:track_completion', displayName: 'Track Completion', description: 'Track workshop completion', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/workshops/registrations/my' },
    { key: 'equip:ask_questions', displayName: 'Ask Questions', description: 'Submit questions during workshop', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/workshops/{id}/questions' },
    { key: 'equip:participate_polls', displayName: 'Participate in Polls', description: 'Participate in workshop polls', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/workshops/{id}/polls/{pid}/vote' },
  ],
  volunteer: [
    { key: 'equip:assist_facilitator', displayName: 'Assist Facilitator', description: 'Assist workshop facilitator', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'workshop_assistant', apiEndpoint: 'POST /api/admin/workshops/{id}/assist' },
    { key: 'equip:take_attendance', displayName: 'Take Attendance', description: 'Record attendance', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'attendance_taker', apiEndpoint: 'POST /api/workshops/{id}/participants' },
    { key: 'equip:setup_materials', displayName: 'Setup Materials', description: 'Prepare workshop materials', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'workshop_assistant', apiEndpoint: 'POST /api/admin/workshops/{id}/setup' },
    { key: 'equip:tech_support', displayName: 'Tech Support', description: 'Provide technical support', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'tech_helper', apiEndpoint: 'POST /api/admin/workshops/{id}/tech-support' },
    { key: 'equip:moderate_chat', displayName: 'Moderate Chat', description: 'Moderate workshop chat', baseRole: 'volunteer', minClearance: 15, requiredDuty: 'tech_helper', apiEndpoint: 'DELETE /api/workshops/{id}/chat/{mid}' },
  ],
  staff: [
    { key: 'equip:create_workshop', displayName: 'Create Workshop', description: 'Create new workshops', baseRole: 'staff', minClearance: 40, requiredDuty: 'facilitator', apiEndpoint: 'POST /api/workshops' },
    { key: 'equip:facilitate_workshop', displayName: 'Facilitate Workshop', description: 'Facilitate workshops', baseRole: 'staff', minClearance: 40, requiredDuty: 'facilitator', apiEndpoint: 'PATCH /api/workshops/{id}/status' },
    { key: 'equip:develop_curriculum', displayName: 'Develop Curriculum', description: 'Develop workshop curriculum', baseRole: 'staff', minClearance: 40, requiredDuty: 'curriculum_developer', apiEndpoint: 'GET/POST/PATCH /api/admin/workshops/curriculum' },
    { key: 'equip:grade_assignments', displayName: 'Grade Assignments', description: 'Grade all assignments', baseRole: 'staff', minClearance: 40, requiredDuty: 'facilitator', apiEndpoint: 'GET/PATCH /api/admin/workshops/{id}/assignments' },
    { key: 'equip:issue_certificates', displayName: 'Issue Certificates', description: 'Issue completion certificates', baseRole: 'staff', minClearance: 40, requiredDuty: 'workshop_coordinator', apiEndpoint: 'POST /api/admin/workshops/{id}/certificates' },
    { key: 'equip:manage_schedule', displayName: 'Manage Schedule', description: 'Manage workshop schedule', baseRole: 'staff', minClearance: 40, requiredDuty: 'workshop_coordinator', apiEndpoint: 'GET/POST/PATCH /api/workshops/time-slots' },
    { key: 'equip:generate_reports', displayName: 'Generate Reports', description: 'Generate workshop reports', baseRole: 'staff', minClearance: 40, requiredDuty: 'workshop_coordinator', apiEndpoint: 'GET /api/admin/workshops/reports' },
    { key: 'equip:manage_breakout_rooms', displayName: 'Manage Breakout Rooms', description: 'Manage breakout rooms', baseRole: 'staff', minClearance: 40, requiredDuty: 'facilitator', apiEndpoint: 'GET/POST/PATCH/DELETE /api/workshops/{id}/breakout-rooms' },
    { key: 'equip:analytics', displayName: 'View Analytics', description: 'View workshop analytics', baseRole: 'staff', minClearance: 40, requiredDuty: 'workshop_coordinator', apiEndpoint: 'GET /api/admin/workshops/analytics' },
  ],
};

export const BRIDGE_PERMISSIONS: Record<string, ProgramPermission[]> = {
  convict: [
    { key: 'bridge:request_mentor', displayName: 'Request Mentor', description: 'Request a mentor', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/bridge/mentor-request' },
    { key: 'bridge:view_assigned_mentor', displayName: 'View Mentor', description: 'View assigned mentor info', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/services/bridge/mentor?userId={self}' },
    { key: 'bridge:schedule_meeting', displayName: 'Schedule Meeting', description: 'Schedule mentor meetings', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/bridge/meetings' },
    { key: 'bridge:submit_progress', displayName: 'Submit Progress', description: 'Submit progress updates', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/bridge/progress' },
    { key: 'bridge:participate_group', displayName: 'Participate in Group', description: 'Participate in peer groups', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/bridge/groups/{id}/join' },
    { key: 'bridge:view_resources', displayName: 'View Resources', description: 'Access mentorship resources', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET /api/services/bridge/resources' },
    { key: 'bridge:goal_tracking', displayName: 'Track Goals', description: 'Track mentorship goals', baseRole: 'convict', minClearance: 0, apiEndpoint: 'GET/POST /api/services/bridge/goals' },
    { key: 'bridge:feedback_submission', displayName: 'Submit Feedback', description: 'Submit mentor feedback', baseRole: 'convict', minClearance: 0, apiEndpoint: 'POST /api/services/bridge/feedback' },
  ],
  volunteer: [
    { key: 'bridge:mentor_individuals', displayName: 'Mentor Individuals', description: 'Mentor assigned individuals', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'mentor', apiEndpoint: 'GET/POST /api/admin/services/bridge/mentoring' },
    { key: 'bridge:lead_peer_groups', displayName: 'Lead Peer Groups', description: 'Lead peer support groups', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'peer_facilitator', apiEndpoint: 'POST /api/admin/services/bridge/groups/{id}/lead' },
    { key: 'bridge:log_mentoring_sessions', displayName: 'Log Sessions', description: 'Log mentoring sessions', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'mentor', apiEndpoint: 'POST /api/admin/services/bridge/sessions' },
    { key: 'bridge:set_mentee_goals', displayName: 'Set Goals', description: 'Set goals with mentees', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'mentor', apiEndpoint: 'POST /api/admin/services/bridge/mentees/{id}/goals' },
    { key: 'bridge:track_mentee_progress', displayName: 'Track Progress', description: 'Track mentee progress', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'mentor', apiEndpoint: 'GET /api/admin/services/bridge/mentees/{id}/progress' },
    { key: 'bridge:accountability_partner', displayName: 'Accountability Partner', description: 'Serve as accountability partner', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'accountability_partner', apiEndpoint: 'POST /api/admin/services/bridge/accountability' },
    { key: 'bridge:crisis_escalation', displayName: 'Crisis Escalation', description: 'Escalate crisis situations', baseRole: 'volunteer', minClearance: 25, requiredDuty: 'mentor', apiEndpoint: 'POST /api/admin/services/bridge/crisis-escalation' },
  ],
  staff: [
    { key: 'bridge:match_mentor_mentee', displayName: 'Match Mentor/Mentee', description: 'Match mentors with mentees', baseRole: 'staff', minClearance: 45, requiredDuty: 'match_specialist', apiEndpoint: 'POST /api/admin/services/bridge/matches' },
    { key: 'bridge:supervise_mentors', displayName: 'Supervise Mentors', description: 'Supervise mentor relationships', baseRole: 'staff', minClearance: 45, requiredDuty: 'mentor_coordinator', apiEndpoint: 'GET /api/admin/services/bridge/supervision' },
    { key: 'bridge:approve_mentor_applications', displayName: 'Approve Mentors', description: 'Approve mentor applications', baseRole: 'staff', minClearance: 45, requiredDuty: 'mentor_coordinator', apiEndpoint: 'PATCH /api/admin/services/bridge/mentors/{id}/approve' },
    { key: 'bridge:resolve_conflicts', displayName: 'Resolve Conflicts', description: 'Resolve mentor-mentee conflicts', baseRole: 'staff', minClearance: 45, requiredDuty: 'peer_program_manager', apiEndpoint: 'POST /api/admin/services/bridge/conflicts' },
    { key: 'bridge:review_progress', displayName: 'Review Progress', description: 'Review all progress reports', baseRole: 'staff', minClearance: 45, requiredDuty: 'mentor_coordinator', apiEndpoint: 'GET /api/admin/services/bridge/progress' },
    { key: 'bridge:train_mentors', displayName: 'Train Mentors', description: 'Train new mentors', baseRole: 'staff', minClearance: 45, requiredDuty: 'mentor_coordinator', apiEndpoint: 'POST /api/admin/services/bridge/training' },
    { key: 'bridge:generate_reports', displayName: 'Generate Reports', description: 'Generate mentorship reports', baseRole: 'staff', minClearance: 45, requiredDuty: 'peer_program_manager', apiEndpoint: 'GET /api/admin/services/bridge/reports' },
    { key: 'bridge:mentor_evaluation', displayName: 'Evaluate Mentors', description: 'Evaluate mentor performance', baseRole: 'staff', minClearance: 45, requiredDuty: 'mentor_coordinator', apiEndpoint: 'GET/POST /api/admin/services/bridge/evaluations' },
  ],
};

export const ALL_PROGRAM_PERMISSIONS: Record<string, Record<string, ProgramPermission[]>> = {
  [PROGRAM_TAG_IDS.TRANSIT]: TRANSIT_PERMISSIONS,
  [PROGRAM_TAG_IDS.NOURISH]: NOURISH_PERMISSIONS,
  [PROGRAM_TAG_IDS.HAVEN]: HAVEN_PERMISSIONS,
  [PROGRAM_TAG_IDS.VOICE]: VOICE_PERMISSIONS,
  [PROGRAM_TAG_IDS.NEIGHBORS]: NEIGHBORS_PERMISSIONS,
  [PROGRAM_TAG_IDS.STEPS]: STEPS_PERMISSIONS,
  [PROGRAM_TAG_IDS.AWAKEN]: AWAKEN_PERMISSIONS,
  [PROGRAM_TAG_IDS.SHEPHERD]: SHEPHERD_PERMISSIONS,
  [PROGRAM_TAG_IDS.EQUIP]: EQUIP_PERMISSIONS,
  [PROGRAM_TAG_IDS.BRIDGE]: BRIDGE_PERMISSIONS,
};

export const CONVICT_DEFAULT_PERMISSIONS: string[] = [
  ...TRANSIT_PERMISSIONS.convict.map(p => p.key),
  ...NOURISH_PERMISSIONS.convict.map(p => p.key),
  ...HAVEN_PERMISSIONS.convict.map(p => p.key),
  ...VOICE_PERMISSIONS.convict.map(p => p.key),
  ...NEIGHBORS_PERMISSIONS.convict.map(p => p.key),
  ...STEPS_PERMISSIONS.convict.map(p => p.key),
  ...AWAKEN_PERMISSIONS.convict.map(p => p.key),
  ...SHEPHERD_PERMISSIONS.convict.map(p => p.key),
  ...EQUIP_PERMISSIONS.convict.map(p => p.key),
  ...BRIDGE_PERMISSIONS.convict.map(p => p.key),
];

export const INPERSON_ACTIVITY_TYPES: Record<string, string[]> = {
  [INPERSON_TAG_IDS.TRANSIT]: ['ride_completed', 'ride_canceled', 'emergency_transport', 'group_transport', 'vehicle_maintenance'],
  [INPERSON_TAG_IDS.NOURISH]: ['meal_served', 'food_box_distributed', 'pantry_visit', 'food_drive_donation', 'inventory_stocked'],
  [INPERSON_TAG_IDS.HAVEN]: ['shelter_night', 'housing_placement', 'intake_completed', 'case_meeting', 'eviction_prevented'],
  [INPERSON_TAG_IDS.VOICE]: ['court_accompaniment', 'advocacy_meeting', 'rights_education', 'petition_signatures', 'policy_testimony'],
  [INPERSON_TAG_IDS.NEIGHBORS]: ['community_event', 'cleanup_completed', 'partnership_meeting', 'block_party', 'resource_fair'],
  [INPERSON_TAG_IDS.STEPS]: ['meeting_held', 'sponsorship_meeting', 'sobriety_milestone', 'crisis_response', '12th_step_call'],
  [INPERSON_TAG_IDS.AWAKEN]: ['study_session', 'small_group', 'testimony_shared', 'new_believer', 'baptism'],
  [INPERSON_TAG_IDS.SHEPHERD]: ['counseling_session', 'prayer_session', 'hospital_visit', 'crisis_intervention', 'ceremony_officiated', 'spiritual_direction'],
  [INPERSON_TAG_IDS.EQUIP]: ['workshop_session', 'skills_training', 'certificate_issued', 'assessment_completed', 'job_placement'],
  [INPERSON_TAG_IDS.BRIDGE]: ['mentoring_session', 'group_session', 'goal_review', 'accountability_check', 'graduation'],
};

export function hasUserProgramPermission(
  userTags: string[],
  userClearance: number,
  userDuties: string[],
  permissionKey: string,
  programTagId: string
): boolean {
  const programPermissions = ALL_PROGRAM_PERMISSIONS[programTagId];
  if (!programPermissions) return false;

  const isConvictPermission = CONVICT_DEFAULT_PERMISSIONS.includes(permissionKey);
  if (isConvictPermission) return true;

  for (const rolePerms of Object.values(programPermissions)) {
    const permission = rolePerms.find(p => p.key === permissionKey);
    if (permission) {
      if (userClearance < permission.minClearance) return false;
      if (permission.requiredDuty && !userDuties.includes(permission.requiredDuty)) return false;
      if (!userTags.includes(programTagId)) return false;
      return true;
    }
  }

  return false;
}

export function getUserProgramPermissions(
  userTags: string[],
  userClearance: number,
  userDuties: string[]
): string[] {
  const permissions: string[] = [...CONVICT_DEFAULT_PERMISSIONS];

  for (const [programTagId, programPerms] of Object.entries(ALL_PROGRAM_PERMISSIONS)) {
    if (!userTags.includes(programTagId)) continue;

    for (const rolePerms of Object.values(programPerms)) {
      for (const permission of rolePerms) {
        if (permission.baseRole === 'convict') continue;
        if (userClearance < permission.minClearance) continue;
        if (permission.requiredDuty && !userDuties.includes(permission.requiredDuty)) continue;
        if (!permissions.includes(permission.key)) {
          permissions.push(permission.key);
        }
      }
    }
  }

  return permissions;
}
