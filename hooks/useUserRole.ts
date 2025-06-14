import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

type UserMetadata = {
  role?: 'patient' | 'doctor';
};

export function useUserRole() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  
  useEffect(() => {
    if (isLoaded && user) {
      // Use type assertion to access unsafeMetadata
      const metadata = user.unsafeMetadata as UserMetadata | undefined;
      setRole(metadata?.role || 'patient');
    }
  }, [user, isLoaded]);
  
  return {
    role,
    isDoctor: role === 'doctor',
    isPatient: role === 'patient',
  };
}
