// This file provides type safety for our routes

export type RootStackParamList = {
  // Root routes
  '/': undefined;
  '/(auth)': undefined;
  '/(tabs)': undefined;
  '/(patient)': undefined;
  '/(doctor)': undefined;
  
  // Settings routes
  '/settings': undefined;
  '/settings/personal-info': undefined;
  '/settings/change-password': undefined;
  '/settings/privacy-security': undefined;
  '/settings/language': undefined;
  '/settings/contact-support': undefined;
  '/settings/terms-privacy': undefined;
  '/settings/edit-profile': undefined;
  
  // Add other routes as needed
};

// This makes it easier to reference route names
export type AppRoute = keyof RootStackParamList;
