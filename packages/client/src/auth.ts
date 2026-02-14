import { createAuthClient } from '@neondatabase/neon-js/auth';

export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL);

// The email-otp plugin is included at runtime (emailOTPClient() is in
// supportedBetterAuthClientPlugins) but TypeScript types don't propagate
// through the Neon wrapper. Cast through `any` to access them.
const client = authClient as any;

export const emailOtp = {
  sendVerificationOtp: (email: string, type: 'email-verification' | 'sign-in' | 'forget-password') =>
    client.emailOtp.sendVerificationOtp({ email, type }) as Promise<{ data: any; error: any }>,

  verifyEmail: (email: string, otp: string) =>
    client.emailOtp.verifyEmail({ email, otp }) as Promise<{ data: any; error: any }>,

  resetPassword: (email: string, otp: string, password: string) =>
    client.emailOtp.resetPassword({ email, otp, password }) as Promise<{ data: any; error: any }>,

  forgetPassword: (email: string) =>
    client.forgetPassword.emailOtp({ email }) as Promise<{ data: any; error: any }>,
};
