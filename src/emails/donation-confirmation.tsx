import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface DonationConfirmationEmailProps {
  donorName: string;
  donorEmail: string;
  amount: number;
  donationType: 'one_time' | 'recurring';
  interval?: 'month' | 'year';
  tier?: string;
  transactionId: string;
  donationDate: string;
  isAnonymous: boolean;
}

export const DonationConfirmationEmail: React.FC<DonationConfirmationEmailProps> = ({
  donorName,
  donorEmail,
  amount,
  donationType,
  interval,
  tier,
  transactionId,
  donationDate,
  isAnonymous,
}) => {
  const formattedAmount = (amount / 100).toFixed(2);
  const displayName = isAnonymous ? 'Anonymous Donor' : donorName;

  return (
    <Html>
      <Head />
      <Preview>Thank you for your donation to UCon Ministries!</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto px-4 py-8 max-w-2xl">
            <Section className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg p-8 border border-purple-200">
              <div className="text-center mb-6">
                <Text className="text-4xl mb-2">💜</Text>
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  Thank You for Your Generosity!
                </Text>
                <Text className="text-lg text-gray-700">
                  {displayName}, your {donationType === 'recurring' ? 'recurring ' : ''}donation has been received.
                </Text>
              </div>

              <Section className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
                <Text className="text-sm font-semibold text-purple-600 mb-4">
                  DONATION DETAILS
                </Text>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <Text className="text-sm text-gray-600">Amount:</Text>
                    <Text className="text-lg font-bold text-gray-900">
                      ${formattedAmount}
                      {donationType === 'recurring' && interval && `/${interval}`}
                    </Text>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <Text className="text-sm text-gray-600">Type:</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {donationType === 'recurring' 
                        ? `Recurring (${interval === 'month' ? 'Monthly' : 'Yearly'})`
                        : 'One-Time Gift'
                      }
                    </Text>
                  </div>

                  {tier && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <Text className="text-sm text-gray-600">Giving Level:</Text>
                      <Text className="text-sm font-medium text-gray-900 capitalize">{tier}</Text>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <Text className="text-sm text-gray-600">Date:</Text>
                    <Text className="text-sm font-medium text-gray-900">{donationDate}</Text>
                  </div>

                  <div className="flex justify-between">
                    <Text className="text-sm text-gray-600">Transaction ID:</Text>
                    <Text className="text-xs font-mono text-gray-900">{transactionId}</Text>
                  </div>
                </div>
              </Section>

              <Section className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6">
                <Text className="text-sm font-bold text-green-800 mb-2">
                  🎉 Your Impact
                </Text>
                <Text className="text-sm text-green-700">
                  Your generous donation helps provide meals, housing support, counseling, 
                  and life-transforming programs for individuals impacted by addiction, 
                  homelessness, and justice system involvement.
                </Text>
              </Section>

              <Section className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
                <Text className="text-sm font-bold text-blue-800 mb-2">
                  📄 Tax Deductible
                </Text>
                <Text className="text-sm text-blue-700">
                  UCon Ministries is a 501(c)(3) nonprofit organization (EIN: XX-XXXXXXX). 
                  Your donation is tax-deductible to the fullest extent permitted by law. 
                  Please keep this email as your receipt for tax purposes.
                </Text>
              </Section>

              {donationType === 'recurring' && (
                <Section className="bg-purple-50 border border-purple-200 rounded-lg p-5 mb-6">
                  <Text className="text-sm font-bold text-purple-800 mb-2">
                    🔄 Recurring Donation
                  </Text>
                  <Text className="text-sm text-purple-700">
                    Your {interval === 'month' ? 'monthly' : 'yearly'} donation of ${formattedAmount} 
                    will be automatically processed. You can manage or cancel your subscription at any time.
                  </Text>
                </Section>
              )}

              <Section className="my-8 text-center">
                <Button
                  href="https://uconministries.org"
                  className="bg-purple-600 text-white font-semibold py-4 px-8 rounded-lg inline-block no-underline"
                  style={{
                    backgroundColor: '#A92FFA',
                    color: '#ffffff',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    display: 'inline-block',
                  }}
                >
                  Visit Our Website
                </Button>
              </Section>

              <Section className="border-t border-gray-200 pt-6 mt-6">
                <Text className="text-sm text-gray-700 mb-2">
                  <strong>Questions about your donation?</strong>
                </Text>
                <Text className="text-sm text-gray-600">
                  Contact us at donations@uconministries.org or visit our website for more information about our programs and impact.
                </Text>
              </Section>

              <Section className="mt-6 text-center">
                <Text className="text-xs text-gray-500">
                  UCon Ministries • Restoring Hope, Dignity, and Purpose
                </Text>
                <Text className="text-xs text-gray-400 mt-2">
                  This receipt was sent to {donorEmail}
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default DonationConfirmationEmail;
