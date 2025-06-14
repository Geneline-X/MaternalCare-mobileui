import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { ClipboardList, Plus, FileText, Clock, CheckCircle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';

const mockForms = [
  {
    id: '1',
    title: 'Prenatal Assessment Form',
    description: 'Comprehensive prenatal health assessment',
    version: '2.1',
    status: 'active',
    completedCount: 24,
    totalCount: 30,
    lastUpdated: '2024-01-10',
  },
  {
    id: '2',
    title: 'Risk Assessment Checklist',
    description: 'High-risk pregnancy evaluation form',
    version: '1.3',
    status: 'active',
    completedCount: 18,
    totalCount: 25,
    lastUpdated: '2024-01-08',
  },
  {
    id: '3',
    title: 'Postpartum Follow-up',
    description: 'Post-delivery care and recovery assessment',
    version: '1.0',
    status: 'draft',
    completedCount: 0,
    totalCount: 0,
    lastUpdated: '2024-01-05',
  },
  {
    id: '4',
    title: 'Emergency Contact Form',
    description: 'Patient emergency contact information',
    version: '1.5',
    status: 'active',
    completedCount: 28,
    totalCount: 30,
    lastUpdated: '2024-01-12',
  },
];

export default function Forms() {
  const [forms, setForms] = useState(mockForms);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.success[500];
      case 'draft':
        return Colors.warning[500];
      case 'archived':
        return Colors.neutral[500];
      default:
        return Colors.neutral[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} color={Colors.success[500]} />;
      case 'draft':
        return <Clock size={16} color={Colors.warning[500]} />;
      default:
        return <FileText size={16} color={Colors.neutral[500]} />;
    }
  };

  const renderForm = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.formCard}>
      <View style={styles.formHeader}>
        <View style={styles.formTitleRow}>
          <FileText size={20} color={Colors.primary[600]} />
          <Text style={styles.formTitle}>{item.title}</Text>
        </View>
        <View style={styles.statusBadge}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.formDescription}>{item.description}</Text>

      <View style={styles.formStats}>
        <View style={styles.formStat}>
          <Text style={styles.formStatValue}>v{item.version}</Text>
          <Text style={styles.formStatLabel}>Version</Text>
        </View>
        <View style={styles.formStat}>
          <Text style={styles.formStatValue}>
            {item.completedCount}/{item.totalCount}
          </Text>
          <Text style={styles.formStatLabel}>Completed</Text>
        </View>
        <View style={styles.formStat}>
          <Text style={styles.formStatValue}>
            {new Date(item.lastUpdated).toLocaleDateString()}
          </Text>
          <Text style={styles.formStatLabel}>Last Updated</Text>
        </View>
      </View>

      {item.status === 'active' && item.totalCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(item.completedCount / item.totalCount) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((item.completedCount / item.totalCount) * 100)}% completed
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forms</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <ClipboardList size={24} color={Colors.primary[600]} />
          <Text style={styles.statValue}>{forms.length}</Text>
          <Text style={styles.statLabel}>Total Forms</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={24} color={Colors.success[600]} />
          <Text style={styles.statValue}>
            {forms.filter(f => f.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={24} color={Colors.warning[600]} />
          <Text style={styles.statValue}>
            {forms.filter(f => f.status === 'draft').length}
          </Text>
          <Text style={styles.statLabel}>Drafts</Text>
        </View>
      </View>

      <FlatList
        data={forms}
        renderItem={renderForm}
        keyExtractor={(item) => item.id}
        style={styles.formList}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Colors.neutral[800],
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.neutral[600],
    marginTop: 2,
  },
  formList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  formCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[800],
    marginLeft: Spacing.sm,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  formDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[600],
    marginBottom: Spacing.md,
  },
  formStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  formStat: {
    alignItems: 'center',
  },
  formStatValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[800],
  },
  formStatLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: Colors.neutral[600],
    marginTop: 2,
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.success[600],
    textAlign: 'right',
  },
});