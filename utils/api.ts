import * as SecureStore from 'expo-secure-store';
import { AuthTokens } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

class ApiClient {
  private tokens: AuthTokens | null = null;

  async getTokens(): Promise<AuthTokens | null> {
    if (this.tokens) return this.tokens;
    
    try {
      const tokensString = await SecureStore.getItemAsync('auth_tokens');
      if (tokensString) {
        this.tokens = JSON.parse(tokensString);
        return this.tokens;
      }
    } catch (error) {
      console.error('Error getting tokens:', error);
    }
    return null;
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
    await SecureStore.setItemAsync('auth_tokens', JSON.stringify(tokens));
  }

  async clearTokens(): Promise<void> {
    this.tokens = null;
    await SecureStore.deleteItemAsync('auth_tokens');
  }

  async refreshTokens(): Promise<boolean> {
    const tokens = await this.getTokens();
    if (!tokens) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (response.ok) {
        const newTokens = await response.json();
        await this.setTokens(newTokens);
        return true;
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
    }
    
    return false;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const tokens = await this.getTokens();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (tokens) {
      // Check if token is about to expire (15 minutes before)
      const now = Date.now();
      if (tokens.expiresAt - now < 15 * 60 * 1000) {
        await this.refreshTokens();
        const refreshedTokens = await this.getTokens();
        if (refreshedTokens) {
          headers.Authorization = `Bearer ${refreshedTokens.accessToken}`;
        }
      } else {
        headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: any; tokens: AuthTokens }> {
    const response = await this.request<{ user: any; tokens: AuthTokens }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    await this.setTokens(response.tokens);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      await this.clearTokens();
    }
  }

  async register(userData: any): Promise<{ user: any; tokens: AuthTokens }> {
    const response = await this.request<{ user: any; tokens: AuthTokens }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    await this.setTokens(response.tokens);
    return response;
  }

  // Patient endpoints
  async getPatients(page = 1, limit = 20): Promise<any> {
    return this.request(`/Patient?_page=${page}&_count=${limit}`);
  }

  async getPatient(id: string): Promise<any> {
    return this.request(`/Patient/${id}`);
  }

  async createPatient(patientData: any): Promise<any> {
    return this.request('/Patient', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  // Pregnancy endpoints
  async getPregnancies(patientId?: string): Promise<any> {
    const query = patientId ? `?patient=${patientId}` : '';
    return this.request(`/Pregnancy${query}`);
  }

  async createPregnancy(pregnancyData: any): Promise<any> {
    return this.request('/Pregnancy', {
      method: 'POST',
      body: JSON.stringify(pregnancyData),
    });
  }

  // Observation endpoints
  async getObservations(patientId?: string): Promise<any> {
    const query = patientId ? `?patient=${patientId}` : '';
    return this.request(`/Observation${query}`);
  }

  async createObservation(observationData: any): Promise<any> {
    return this.request('/Observation', {
      method: 'POST',
      body: JSON.stringify(observationData),
    });
  }

  // Notification endpoints
  async getNotifications(): Promise<any> {
    return this.request('/Notification');
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request(`/Notification/${id}/read`, { method: 'POST' });
  }

  // Form endpoints
  async getDynamicForm(id: string): Promise<any> {
    return this.request(`/DynamicForm/${id}`);
  }

  async submitDynamicForm(formId: string, data: any): Promise<any> {
    return this.request(`/DynamicForm/${formId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // SMS endpoints
  async sendSMS(to: string, message: string): Promise<any> {
    return this.request('/SMS/send', {
      method: 'POST',
      body: JSON.stringify({ to, message }),
    });
  }
}

export const apiClient = new ApiClient();