import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { Search, Plus, Filter, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';

const mockPatients = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 28,
    weeks: 32,
    riskLevel: 'high',
    lastVisit: '2 days ago',
    avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    phone: '+1 (555) 123-4567',
    dueDate: '2024-02-15',
  },
  {
    id: '2',
    name: 'Emily Davis',
    age: 24,
    weeks: 28,
    riskLevel: 'low',
    lastVisit: '1 week ago',
    avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    phone: '+1 (555) 234-5678',
    dueDate: '2024-03-10',
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    age: 31,
    weeks: 36,
    riskLevel: 'medium',
    lastVisit: '3 days ago',
    avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    phone: '+1 (555) 345-6789',
    dueDate: '2024-01-25',
  },
];

export default function Patients() {
  const [patients, setPatients] = useState(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return Colors.error[500];
      case 'medium':
        return Colors.warning[500];
      case 'low':
        return Colors.success[500];
      default:
        return Colors.neutral[500];
    }
  };

  const renderPatient = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.patientCard}>
      <Image source={{ uri: item.avatar }} style={styles.patientAvatar} />
      
      <View style={styles.patientInfo}>
        <View style={styles.patientHeader}>
          <Text style={styles.patientName}>{item.name}</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.riskLevel) }]}>
            <Text style={styles.riskText}>{item.riskLevel.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.patientDetails}>
          {item.age} years • {item.weeks} weeks pregnant
        </Text>
        
        <Text style={styles.patientDueDate}>
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
        
        <Text style={styles.patientLastVisit}>
          Last visit: {item.lastVisit}
        </Text>
      </View>

      {item.riskLevel === 'high' && (
        <View style={styles.alertIcon}>
          <AlertCircle size={20} color={Colors.error[500]} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredPatients.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.error[500] }]}>
            {filteredPatients.filter(p => p.riskLevel === 'high').length}
          </Text>
          <Text style={styles.statLabel}>High Risk</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.warning[500] }]}>
            {filteredPatients.filter(p => p.weeks >= 36).length}
          </Text>
          <Text style={styles.statLabel}>Due Soon</Text>
        </View>
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        style={styles.patientList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.neutral[800],
  },
  addButton: {
    backgroundColor: Colors.primary[500],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[800],
    marginLeft: Spacing.sm,
  },
  filterButton: {
    backgroundColor: Colors.white,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary[600],
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.neutral[600],
    marginTop: 2,
  },
  patientList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  patientCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  patientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.md,
  },
  patientInfo: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  patientName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[800],
  },
  riskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  riskText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: Colors.white,
  },
  patientDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  patientDueDate: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.primary[600],
    marginBottom: 2,
  },
  patientLastVisit: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[500],
  },
  alertIcon: {
    marginLeft: Spacing.sm,
  },
});