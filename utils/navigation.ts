import { useRouter as useExpoRouter } from 'expo-router';

// Define the type for our routes
type AppRoutes = {
  settings: {
    personalInfo: string;
    changePassword: string;
    privacySecurity: string;
    language: string;
    contactSupport: string;
    termsPrivacy: string;
    editProfile: string;
  };
  patient: {
    home: string;
    profile: string;
    appointments: string;
    records: string;
  };
};

// Path constants for type safety in our app
export const paths: AppRoutes = {
  settings: {
    personalInfo: '/settings/personal-info',
    changePassword: '/settings/change-password',
    privacySecurity: '/settings/privacy-security',
    language: '/settings/language',
    contactSupport: '/settings/contact-support',
    termsPrivacy: '/settings/terms-privacy',
    editProfile: '/settings/edit-profile',
  },
  patient: {
    home: '/(patient)/home',
    profile: '/(patient)/profile',
    appointments: '/(patient)/appointments',
    records: '/(patient)/records',
  },
} as const;

// Type-safe navigation hook
export function useRouter() {
  const router = useExpoRouter();

  return {
    ...router,
    // Add any custom navigation methods here
  };
}
