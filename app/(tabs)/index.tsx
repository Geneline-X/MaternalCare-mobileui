import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const isDoctor = user?.role === 'doctor';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.role}>
            {isDoctor ? 'Healthcare Provider' : 'Patient'}
          </Text>
        </View>

        {/* Avatar and Greeting */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user?.avatar ||
                'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>Let’s find your doctor</Text>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={20} color="#aaa" />
              <Text style={styles.searchPlaceholder}>Search doctor</Text>
            </View>
          </View>
        </View>

        {/* Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isDoctor ? 'Today’s Appointments' : 'Next Appointment'}
          </Text>
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <Ionicons
                name={isDoctor ? 'calendar-outline' : 'medkit-outline'}
                size={24}
                color="#2F80ED"
              />
              <Text style={styles.cardTitle}>
                {isDoctor
                  ? '3 appointments scheduled'
                  : 'Dr. Charlie Start - Tomorrow, 10:30 AM'}
              </Text>
            </View>
            <Text style={styles.cardSubtext}>
              {isDoctor
                ? 'Tap to manage your schedule'
                : 'Heart Specialist | Video Call'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#2F80ED',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerText: {
    color: '#DDE9FF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  role: {
    color: '#A8C3FF',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    marginTop: -30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: '#999',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'Poppins-Medium',
    color: '#2F80ED',
  },
  cardSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
});
