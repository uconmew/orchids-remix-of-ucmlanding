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

interface WelcomeStaffEmailProps {
  userName: string;
  userEmail: string;
  registrationNumber: string;
  temporaryPassword: string;
  roleName: string;
  staffTitle?: string;
  loginUrl: string;
}

export const WelcomeStaffEmail: React.FC<WelcomeStaffEmailProps> = ({
  userName,
  userEmail,
  registrationNumber,
  temporaryPassword,
  roleName,
  staffTitle,
  loginUrl,
}) => (
  <Html>
    <Head />
    <Preview>Welcome to UCon Ministries - Your Staff Account Details</Preview>
    <Tailwind>
      <Body className="bg-white font-sans">
        <Container className="mx-auto px-4 py-8 max-w-2xl">
          <Section className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg p-8 border border-purple-200">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to UCon Ministries!
            </Text>
            <Text className="text-lg text-gray-700 mb-6">
              Hi {userName}, your staff account has been created.
            </Text>

            <Section className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <Text className="text-sm font-semibold text-purple-600 mb-3">
                YOUR ACCOUNT DETAILS
              </Text>
              
              <div className="space-y-3">
                <div>
                  <Text className="text-xs text-gray-500 mb-1">Registration Number:</Text>
                  <Text className="text-base font-mono font-bold text-gray-900">
                    {registrationNumber}
                  </Text>
                </div>

                <div>
                  <Text className="text-xs text-gray-500 mb-1">Email:</Text>
                  <Text className="text-base font-mono text-gray-900">
                    {userEmail}
                  </Text>
                </div>

                <div>
                  <Text className="text-xs text-gray-500 mb-1">Role:</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {roleName}
                    {staffTitle && ` - ${staffTitle}`}
                  </Text>
                </div>
              </div>
            </Section>

            <Section className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <Text className="text-sm font-bold text-blue-900 mb-2">
                🔐 TEMPORARY PASSWORD
              </Text>
              <Text className="text-2xl font-mono font-bold text-blue-900 bg-white p-4 rounded border border-blue-200 text-center">
                {temporaryPassword}
              </Text>
              <Text className="text-xs text-blue-700 mt-3 italic">
                Copy this password carefully - you'll need it to log in
              </Text>
            </Section>

            <Section className="my-8 text-center">
              <Button
                href={loginUrl}
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
                Log In to Your Account
              </Button>
            </Section>

            <Section className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 mb-6">
              <Text className="text-sm font-bold text-yellow-900 mb-3">
                ⚠️ IMPORTANT - PLEASE READ:
              </Text>
              <ul className="list-none p-0 m-0 space-y-2">
                <li className="text-sm text-yellow-800">
                  • You MUST change your password immediately after your first login
                </li>
                <li className="text-sm text-yellow-800">
                  • This temporary password will expire in 7 days
                </li>
                <li className="text-sm text-yellow-800">
                  • Never share your password with anyone
                </li>
                <li className="text-sm text-yellow-800">
                  • Keep your registration number for future reference
                </li>
              </ul>
            </Section>

            <Section className="border-t border-gray-200 pt-6 mt-6">
              <Text className="text-sm text-gray-700 mb-2">
                <strong>Need help?</strong>
              </Text>
              <Text className="text-sm text-gray-600">
                If you have any questions or didn't request this account, please contact your administrator immediately.
              </Text>
            </Section>

            <Section className="mt-6">
              <Text className="text-xs text-gray-500 text-center">
                This is an automated message from UCon Ministries. Please do not reply to this email.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default WelcomeStaffEmail;
