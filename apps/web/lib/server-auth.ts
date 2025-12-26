import { API_BASE_URL } from './constants';

export type CurrentUser = {
  user_id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  created_at: string;
  updated_at: string;
};

type ApiResponse<T> = {
  message: string;
  data: T;
};

export class AuthError extends Error {
  public constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  return API_BASE_URL;
}

async function refreshAccessToken(cookieHeader: string): Promise<string> {
  const baseUrl = getApiBaseUrl();

  const response = await fetch(`${baseUrl}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      cookie: cookieHeader
    },
    credentials: 'include',
    cache: 'no-store'
  });

  if (response.status === 401 || response.status === 403) {
    throw new AuthError('Unauthorized');
  }

  if (!response.ok) {
    throw new Error('Failed to refresh access token.');
  }

  const { data } = (await response.json()) as ApiResponse<{ access_token: string }>;
  return data.access_token;
}

export async function fetchCurrentUser(cookieHeader: string): Promise<CurrentUser> {
  if (!cookieHeader) {
    throw new AuthError('Missing authentication.');
  }

  const baseUrl = getApiBaseUrl();
  const accessToken = await refreshAccessToken(cookieHeader);

  const response = await fetch(`${baseUrl}/user/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      cookie: cookieHeader
    },
    credentials: 'include',
    cache: 'no-store'
  });

  if (response.status === 401 || response.status === 403) {
    throw new AuthError('Unauthorized');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch current user.');
  }

  const { data } = (await response.json()) as ApiResponse<CurrentUser>;
  return data;
}
