import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Bell,
  Calendar,
  AlertCircle,
  Info,
  Heart,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';

const mockNotifications = [
  {
    id: '1',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'You have an appointment with Dr. Sarah Williams tomorrow at 10:30 AM',
    time: '2 hours ago',
    isRead: false,
    actionUrl: '/appointments/123',
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Medication Reminder',
    message: 'Time to take your prenatal vitamins',
    time: '4 hours ago',
    isRead: false,
    actionUrl: null,
  },
  {
    id: '3',
    type: 'alert',
    title: 'High Blood Pressure Alert',
    message: 'Your recent blood pressure reading (145/90) is higher than normal. Please contact your doctor.',
    time: '1 day ago',
    isRead: true,
    actionUrl: '/vitals/bp',
  },
  {
    id: '4',
    type: 'info',
    title: 'Week 28 Pregnancy Milestone',
    message: 'Congratulations! You\'ve reached week 28 of your pregnancy. Your baby is now the size of an eggplant.',
    time: '2 days ago',
    isRead: true,
    actionUrl: '/pregnancy/milestones',
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Lab Results Available',
    message: 'Your recent blood test results are now available in your patient portal.',
    time: '3 days ago',
    isRead: true,
    actionUrl: '/lab-results/456',
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar size={20} color={Colors.primary[600]} />;
      case 'reminder':
        return <Clock size={20} color={Colors.warning[600]} />;
      case 'alert':
        return <AlertCircle size={20} color={Colors.error[600]} />;
      case 'info':
        return <Info size={20} color={Colors.success[600]} />;
      default:
        return <Bell size={20} color={Colors.neutral[600]} />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return Colors.primary[50];
      case 'reminder':
        return Colors.warning[50];
      case 'alert':
        return Colors.error[50];
      case 'info':
        return Colors.success[50];
      default:
        return Colors.neutral[50];
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.isRead && styles.unreadNotification,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getNotificationBgColor(item.type) }]}>
        {getNotificationIcon(item.type)}
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        {item.actionUrl && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>

      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <CheckCircle size={20} color={Colors.primary[600]} />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <View style={[styles.quickStatIcon, { backgroundColor: Colors.primary[100] }]}>
            <Calendar size={16} color={Colors.primary[600]} />
          </View>
          <Text style={styles.quickStatValue}>
            {notifications.filter(n => n.type === 'appointment').length}
          </Text>
          <Text style={styles.quickStatLabel}>Appointments</Text>
        </View>

        <View style={styles.quickStat}>
          <View style={[styles.quickStatIcon, { backgroundColor: Colors.warning[100] }]}>
            <Clock size={16} color={Colors.warning[600]} />
          </View>
          <Text style={styles.quickStatValue}>
            {notifications.filter(n => n.type === 'reminder').length}
          </Text>
          <Text style={styles.quickStatLabel}>Reminders</Text>
        </View>

        <View style={styles.quickStat}>
          <View style={[styles.quickStatIcon, { backgroundColor: Colors.error[100] }]}>
            <AlertCircle size={16} color={Colors.error[600]} />
          </View>
          <Text style={styles.quickStatValue}>
            {notifications.filter(n => n.type === 'alert').length}
          </Text>
          <Text style={styles.quickStatLabel}>Alerts</Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
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
    alignItems: 'flex-start',
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
  unreadCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary[600],
    marginTop: 2,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  markAllText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary[600],
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickStatValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: Colors.neutral[800],
  },
  quickStatLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: Colors.neutral[600],
    marginTop: 2,
  },
  notificationList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[800],
    flex: 1,
    marginRight: Spacing.sm,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[500],
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[600],
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.sm,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary[600],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
    marginLeft: Spacing.sm,
    marginTop: Spacing.sm,
  },
});