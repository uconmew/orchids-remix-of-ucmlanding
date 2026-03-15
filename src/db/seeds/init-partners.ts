import { db } from '@/db';
import { partnerOrganizations } from '@/db/schema';

async function seedPartnerOrganizations() {
  console.log('🌱 Seeding partner organizations...');

  try {
    // Seed faith partners
    await db.insert(partnerOrganizations).values([
      {
        name: 'First Baptist Church Denver',
        category: 'faith',
        description: 'Large congregation providing volunteers, facility space, and community outreach support.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-2a728e5b-20251114060310.jpg',
        websiteUrl: 'https://firstbaptistdenver.org',
        contactName: 'Pastor Michael Johnson',
        contactEmail: 'contact@firstbaptistdenver.org',
        contactPhone: '720.663.9243',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'collaborative',
        servicesProvided: ['Volunteers', 'Facility Space', 'Spiritual Support'],
        isActive: true,
        isFeatured: true,
        partnershipStartDate: new Date('2024-01-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Grace Community Church',
        category: 'faith',
        description: 'Evangelical church supporting mental health ministry and addiction recovery programs.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-2a728e5b-20251114060310.jpg',
        city: 'Aurora',
        state: 'CO',
        partnershipType: 'service_provider',
        servicesProvided: ['Recovery Support', 'Counseling'],
        isActive: true,
        partnershipStartDate: new Date('2024-02-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more faith partners (total 12)
    ]);

    // Seed social services partners
    await db.insert(partnerOrganizations).values([
      {
        name: 'Denver Rescue Mission',
        category: 'social_services',
        description: 'Leading homeless shelter and recovery services provider in Denver metro area.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-denver-s-1532aae8-20251114060310.jpg',
        websiteUrl: 'https://denverrescuemission.org',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'referral',
        servicesProvided: ['Emergency Shelter', 'Meals', 'Case Management'],
        isActive: true,
        isFeatured: true,
        partnershipStartDate: new Date('2024-01-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Urban Peak',
        category: 'social_services',
        description: 'Youth homelessness prevention and housing services for ages 15-24.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-denver-s-1532aae8-20251114060310.jpg',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'collaborative',
        servicesProvided: ['Youth Services', 'Housing', 'Education'],
        isActive: true,
        partnershipStartDate: new Date('2024-03-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more social services partners (total 8)
    ]);

    // Seed business partners
    await db.insert(partnerOrganizations).values([
      {
        name: 'Colorado Construction Partners',
        category: 'business',
        description: 'Construction company providing job training and employment for program graduates.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-1ac4716c-20251114060310.jpg',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'employer',
        servicesProvided: ['Job Training', 'Employment', 'Mentorship'],
        isActive: true,
        isFeatured: true,
        partnershipStartDate: new Date('2024-02-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Metro Coffee Roasters',
        category: 'business',
        description: 'Local coffee chain providing barista training and employment opportunities.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-1ac4716c-20251114060310.jpg',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'employer',
        servicesProvided: ['Barista Training', 'Employment'],
        isActive: true,
        partnershipStartDate: new Date('2024-04-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more business partners (total 15)
    ]);

    // Seed healthcare partners
    await db.insert(partnerOrganizations).values([
      {
        name: 'Denver Health Medical Center',
        category: 'healthcare',
        description: 'Comprehensive medical care and mental health services for underserved populations.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-a483b373-20251114060310.jpg',
        websiteUrl: 'https://denverhealth.org',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'service_provider',
        servicesProvided: ['Medical Care', 'Mental Health', 'Addiction Treatment'],
        isActive: true,
        isFeatured: true,
        partnershipStartDate: new Date('2024-01-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Colorado Coalition for Behavioral Health',
        category: 'healthcare',
        description: 'Mental health advocacy and treatment network across Colorado.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-a483b373-20251114060310.jpg',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'referral',
        servicesProvided: ['Mental Health', 'Counseling', 'Crisis Services'],
        isActive: true,
        partnershipStartDate: new Date('2024-02-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more healthcare partners (total 6)
    ]);

    // Seed justice partners
    await db.insert(partnerOrganizations).values([
      {
        name: 'Colorado Legal Services',
        category: 'justice',
        description: 'Free legal aid for low-income individuals, including criminal record expungement.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-37949567-20251114060310.jpg',
        websiteUrl: 'https://coloradolegalservices.org',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'service_provider',
        servicesProvided: ['Legal Aid', 'Expungement', 'Reentry Support'],
        isActive: true,
        isFeatured: true,
        partnershipStartDate: new Date('2024-01-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Denver Reentry Initiative',
        category: 'justice',
        description: 'Supporting justice-involved individuals with housing, employment, and counseling.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-37949567-20251114060310.jpg',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'collaborative',
        servicesProvided: ['Reentry Support', 'Case Management', 'Housing'],
        isActive: true,
        partnershipStartDate: new Date('2024-03-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more justice partners (total 4)
    ]);

    // Seed educational partners
    await db.insert(partnerOrganizations).values([
      {
        name: 'Community College of Denver',
        category: 'educational',
        description: 'Vocational training programs and workforce development courses.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-b7a95e50-20251114060310.jpg',
        websiteUrl: 'https://ccd.edu',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'service_provider',
        servicesProvided: ['Vocational Training', 'Education', 'Certification Programs'],
        isActive: true,
        isFeatured: true,
        partnershipStartDate: new Date('2024-01-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Denver Adult Education Center',
        category: 'educational',
        description: 'GED preparation, ESL classes, and basic skills education.',
        logoUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/7735ca62-a0cb-4726-ab75-d41677168806/generated_images/professional-corporate-logo-for-colorado-b7a95e50-20251114060310.jpg',
        city: 'Denver',
        state: 'CO',
        partnershipType: 'service_provider',
        servicesProvided: ['GED Prep', 'ESL', 'Adult Education'],
        isActive: true,
        partnershipStartDate: new Date('2024-02-01').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more educational partners (total 5)
    ]);

    console.log('✅ Partner organizations seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding partner organizations:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedPartnerOrganizations()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedPartnerOrganizations };
