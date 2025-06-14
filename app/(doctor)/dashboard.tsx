import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const isDoctor = (user?.unsafeMetadata?.role as string) === 'doctor';
  const userName = `${user?.firstName || 'Dr. David'} ${user?.lastName || ''}`.trim();

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.role}>
                {isDoctor ? 'Healthcare Provider' : 'Patient'}
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={20} color="#aaa" />
            <Text style={styles.searchPlaceholder}>Search doctor</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('./add-patient')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="person-add-outline" size={24} color="#2F80ED" />
            </View>
            <Text style={styles.actionText}>Add Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('./add-pregnancy')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="heart-outline" size={24} color="#2F80ED" />
            </View>
            <Text style={styles.actionText}>Add Pregnancy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('./schedule-visit')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="calendar-outline" size={24} color="#2F80ED" />
            </View>
            <Text style={styles.actionText}>Schedule Visit</Text>
          </TouchableOpacity>
        </View>

        {/* Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isDoctor ? "Today's Appointments" : 'Next Appointment'}
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

        {/* Analytics Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics Overview</Text>
          <View style={styles.card}>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 80}
              height={180}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#2F80ED',
                },
              }}
              bezier
              style={styles.chart}
            />
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
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
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
  welcomeText: {
    fontSize: 14,
    color: '#A8C3FF',
    fontFamily: 'Inter-Regular',
  },
  searchCard: {
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchPlaceholder: {
    color: '#aaa',
    marginLeft: 8,
    fontSize: 14,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '30%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#666',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
}); 