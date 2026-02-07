import { authClient } from '../auth';
import { useGameStore } from '../stores';

/**
 * Auth-aware fetch wrapper. Automatically attaches Authorization header
 * if the user has an active session.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  // Try to attach auth token if user is logged in
  const { user } = useGameStore.getState();
  if (user) {
    try {
      const { data } = await authClient.getSession();
      const token = data?.session?.token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // No session available — proceed without auth
    }
  }

  return fetch(path, {
    ...options,
    headers,
  });
}
