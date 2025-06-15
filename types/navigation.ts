import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Patients: undefined;
  PatientDetails: { patientId: string };
  // Add other screens here as needed
};

export type PatientsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Patients'
>;

export type PatientDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PatientDetails'
>;
