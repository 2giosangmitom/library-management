import { api } from './apiClient';
import { SignUpResponse, SignInResponse } from './types';

export async function signUp(data: { fullName: string; email: string; password: string }) {
  return api.post<SignUpResponse>('/auth/signup', data);
}

export async function signIn(data: { email: string; password: string }) {
  return api.post<SignInResponse>('/auth/signin', data);
}
