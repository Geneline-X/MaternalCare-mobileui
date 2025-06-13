export interface User {
  id: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  name: string;
  profile: {
    avatar?: string;
    specialization?: string;
    age?: number;
    gender?: string;
  };
}

export const mockUsers: User[] = [
  {
    id: 'patient-1',
    email: 'patient@example.com',
    password: 'patient123',
    role: 'patient',
    name: 'Jane Doe',
    profile: {
      avatar: 'https://i.pravatar.cc/150?img=1',
      age: 28,
      gender: 'female',
    },
  },
  {
    id: 'doctor-1',
    email: 'doctor@example.com',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. John Smith',
    profile: {
      avatar: 'https://i.pravatar.cc/150?img=2',
      specialization: 'Obstetrics & Gynecology',
    },
  },
]; 