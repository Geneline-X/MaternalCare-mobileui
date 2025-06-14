import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/colors';
import { Calendar, Clock, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Spacing } from '../../constants/spacing';
import { FontSize } from '@/constants/fontSize';

interface Appointment {
  id: string;
  date: string;
  type: string;
  provider: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // TODO: Fetch appointments from API
    // For now, using mock data
    setAppointments([
      {
        id: 'apt-1',
        date: '2023-06-15T10:00:00Z',
        type: 'Prenatal Checkup',
        provider: 'Dr. Smith',
        status: 'scheduled',
        notes: 'Regular checkup and ultrasound',
      },
      {
        id: 'apt-2',
        date: '2023-06-01T14:30:00Z',
        type: 'Blood Test',
        provider: 'Dr. Johnson',
        status: 'completed',
        notes: 'Complete blood count and glucose test',
      },
    ]);
  }, []);

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return Colors.primary[500];
      case 'completed':
        return Colors.success[500];
      case 'cancelled':
        return Colors.error[500];
      default:
        return Colors.neutral[500];
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => {
            // TODO: Navigate to new appointment form
            console.log('Create new appointment');
          }}>
          <Text style={styles.newButtonText}>New Appointment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {appointments
          .filter((apt) => apt.status === 'scheduled')
          .map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.card}
              onPress={() => {
                // TODO: Navigate to appointment details
                console.log('View appointment:', appointment.id);
              }}>
              <View style={styles.cardHeader}>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) },
                  ]}>
                  <Text style={styles.statusText}>{appointment.status}</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Calendar size={16} color={Colors.neutral[600]} />
                  <Text style={styles.infoText}>
                    {new Date(appointment.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={16} color={Colors.neutral[600]} />
                  <Text style={styles.infoText}>
                    {new Date(appointment.date).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <User size={16} color={Colors.neutral[600]} />
                  <Text style={styles.infoText}>{appointment.provider}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past</Text>
        {appointments
          .filter((apt) => apt.status !== 'scheduled')
          .map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.card}
              onPress={() => {
                // TODO: Navigate to appointment details
                console.log('View appointment:', appointment.id);
              }}>
              <View style={styles.cardHeader}>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) },
                  ]}>
                  <Text style={styles.statusText}>{appointment.status}</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Calendar size={16} color={Colors.neutral[600]} />
                  <Text style={styles.infoText}>
                    {new Date(appointment.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={16} color={Colors.neutral[600]} />
                  <Text style={styles.infoText}>
                    {new Date(appointment.date).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <User size={16} color={Colors.neutral[600]} />
                  <Text style={styles.infoText}>{appointment.provider}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.neutral[900],
  },
  newButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  newButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appointmentType: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.neutral[900],
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  statusText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  cardContent: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
  },
}); 