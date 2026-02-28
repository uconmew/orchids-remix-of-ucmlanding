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

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetUrl,
}) => (
  <Html>
    <Head />
    <Preview>Reset your UCon Ministries password</Preview>
    <Tailwind>
      <Body className="bg-white font-sans">
        <Container className="mx-auto px-4 py-8 max-w-2xl">
          <Section className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg p-8 border border-purple-200">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Password Reset Request
            </Text>
            <Text className="text-lg text-gray-700 mb-6">
              Hi {userName || 'there'}, we received a request to reset your password.
            </Text>

            <Section className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <Text className="text-sm text-gray-700 mb-4">
                Click the button below to reset your password. This link will expire in 1 hour.
              </Text>
              
              <div className="text-center my-8">
                <Button
                  href={resetUrl}
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
                  Reset Password
                </Button>
              </div>
            </Section>

            <Section className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 mb-6">
              <Text className="text-sm font-bold text-yellow-900 mb-3">
                ⚠️ SECURITY NOTICE:
              </Text>
              <ul className="list-none p-0 m-0 space-y-2">
                <li className="text-sm text-yellow-800">
                  • This link expires in 1 hour
                </li>
                <li className="text-sm text-yellow-800">
                  • If you didn't request this reset, ignore this email
                </li>
                <li className="text-sm text-yellow-800">
                  • Never share this link with anyone
                </li>
                <li className="text-sm text-yellow-800">
                  • Your password won't change until you create a new one
                </li>
              </ul>
            </Section>

            <Section className="bg-gray-50 rounded-lg p-4 mb-6">
              <Text className="text-xs text-gray-600 mb-2">
                If the button doesn't work, copy and paste this link into your browser:
              </Text>
              <Text className="text-xs text-purple-600 break-all font-mono">
                {resetUrl}
              </Text>
            </Section>

            <Section className="border-t border-gray-200 pt-6 mt-6">
              <Text className="text-sm text-gray-700 mb-2">
                <strong>Need help?</strong>
              </Text>
              <Text className="text-sm text-gray-600">
                If you continue to have issues, please contact your administrator.
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

export default PasswordResetEmail;
