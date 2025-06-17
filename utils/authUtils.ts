import * as SecureStore from 'expo-secure-store';

/**
 * Logs the JWT token from SecureStore
 * @param key The key used to store the token (defaults to '__clerk_client_jwt')
 * @returns Promise that resolves when the token is logged
 */
export const logSecureToken = async (key: string = '__clerk_client_jwt'): Promise<void> => {
  try {
    console.log(`[AuthUtils] Getting token for key: ${key}`);
    const token = await SecureStore.getItemAsync(key);
    
    if (token) {
      console.log(`[AuthUtils] Token retrieved successfully`);
      console.log(`[AuthUtils] Token (first 10 chars): ${token.substring(0, 10)}...`);
      console.log(`[AuthUtils] Token length: ${token.length} characters`);
      // For security, we don't log the full token
    } else {
      console.log('[AuthUtils] No token found for the specified key');
    }
    
    return;
  } catch (error) {
    console.error('[AuthUtils] Error retrieving token:', error);
    throw error;
  }
};

/**
 * Gets the token from SecureStore without logging it
 * @param key The key used to store the token (defaults to '__clerk_client_jwt')
 * @returns Promise that resolves with the token or null if not found
 */
export const getSecureToken = async (key: string = '__clerk_client_jwt'): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('[AuthUtils] Error getting token:', error);
    return null;
  }
};
