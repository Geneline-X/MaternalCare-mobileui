// This file provides type-safe access to environment variables

interface Config {
  SOCKET_URL: string;
}

const config: Config = {
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || '',
};

// Validate required environment variables
const requiredEnvVars: (keyof Config)[] = ['SOCKET_URL'];

const missingVars = requiredEnvVars.filter(key => !config[key]);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error(
    `Missing required environment variables: ${missingVars.join(', ')}. ` +
    'Please check your .env file.'
  );
}

export default config;
