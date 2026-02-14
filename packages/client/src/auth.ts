import { createAuthClient } from '@neondatabase/neon-js/auth';

const authBaseUrl = import.meta.env.VITE_NEON_AUTH_URL;
export const authClient = createAuthClient(authBaseUrl);

// The email-otp plugin methods exist at runtime but TypeScript types
// don't propagate through the Neon wrapper. Use direct fetch calls instead.
async function otpFetch<T>(path: string, body: Record<string, string>): Promise<{ data: T | null; error: { message: string } | null }> {
  const res = await fetch(`${authBaseUrl}/api/auth${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    return { data: null, error: { message: json.message ?? json.error ?? '操作失败' } };
  }
  return { data: json as T, error: null };
}

export const emailOtp = {
  sendVerificationOtp: (email: string, type: 'email-verification' | 'sign-in' | 'forget-password') =>
    otpFetch<{ success: boolean }>('/email-otp/send-verification-otp', { email, type }),

  verifyEmail: (email: string, otp: string) =>
    otpFetch<{ status: boolean; token: string | null }>('/email-otp/verify-email', { email, otp }),

  resetPassword: (email: string, otp: string, password: string) =>
    otpFetch<{ success: boolean }>('/email-otp/reset-password', { email, otp, password }),

  forgetPassword: (email: string) =>
    otpFetch<{ success: boolean }>('/forget-password/email-otp', { email }),
};
