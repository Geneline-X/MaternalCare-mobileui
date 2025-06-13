declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_OAUTH_CLIENT_ID: string;
      EXPO_PUBLIC_OAUTH_REDIRECT_URI: string;
    }
  }
}

export {};