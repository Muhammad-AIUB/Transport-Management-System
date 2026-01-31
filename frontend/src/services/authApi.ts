import api from './api';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<{ success: boolean; message: string; data: LoginResponse }>(
    '/auth/login',
    { email, password }
  );
  return (response.data as { data: LoginResponse }).data;
};
