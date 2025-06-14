import '@clerk/clerk-react';

declare module '@clerk/clerk-react' {
  interface UserPublicMetadata {
    role?: 'patient' | 'doctor';
  }

  interface UserUnsafeMetadata {
    role?: 'patient' | 'doctor';
  }
}

// Extend the global Window interface to include Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        id: string;
        userId: string;
        status: string;
        lastActiveAt: number;
        expireAt: number;
        abandonAt: number;
      };
      user?: {
        id: string;
        primaryEmailAddressId: string | null;
        firstName: string | null;
        lastName: string | null;
        fullName: string | null;
        imageUrl: string;
        hasImage: boolean;
        primaryEmailAddress: string | null;
        publicMetadata: UserPublicMetadata;
        unsafeMetadata: UserUnsafeMetadata;
      };
    };
  }
}
