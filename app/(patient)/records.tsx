import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/colors';
import { FileText, Calendar, Download } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Spacing } from '../../constants/spacing';
import { FontSize } from '@/constants/fontSize';

interface MedicalRecord {
  id: string;
  type: string;
  date: string;
  provider: string;
  summary: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

export default function RecordsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    // TODO: Fetch records from API
    // For now, using mock data
    setRecords([
      {
        id: 'rec-1',
        type: 'Prenatal Visit',
        date: '2023-06-01T10:00:00Z',
        provider: 'Dr. Smith',
        summary: 'Regular checkup. Blood pressure and weight are normal. Fetal heart rate is good.',
        attachments: [
          {
            id: 'att-1',
            name: 'Ultrasound Report',
            type: 'pdf',
            url: 'https://example.com/ultrasound.pdf',
          },
        ],
      },
      {
        id: 'rec-2',
        type: 'Blood Test Results',
        date: '2023-05-15T14:30:00Z',
        provider: 'Dr. Johnson',
        summary: 'Complete blood count and glucose test results are within normal range.',
        attachments: [
          {
            id: 'att-2',
            name: 'Blood Test Report',
            type: 'pdf',
            url: 'https://example.com/blood-test.pdf',
          },
        ],
      },
    ]);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Records</Text>
      </View>

      <View style={styles.section}>
        {records.map((record) => (
          <TouchableOpacity
            key={record.id}
            style={styles.card}
            onPress={() => {
              // TODO: Navigate to record details
              console.log('View record:', record.id);
            }}>
            <View style={styles.cardHeader}>
              <View style={styles.typeContainer}>
                <FileText size={16} color={Colors.primary[500]} />
                <Text style={styles.recordType}>{record.type}</Text>
              </View>
              <Text style={styles.recordDate}>
                {new Date(record.date).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.provider}>Provider: {record.provider}</Text>
              <Text style={styles.summary}>{record.summary}</Text>

              {record.attachments && record.attachments.length > 0 && (
                <View style={styles.attachments}>
                  <Text style={styles.attachmentsTitle}>Attachments:</Text>
                  {record.attachments.map((attachment) => (
                    <TouchableOpacity
                      key={attachment.id}
                      style={styles.attachment}
                      onPress={() => {
                        // TODO: Handle attachment download
                        console.log('Download attachment:', attachment.url);
                      }}>
                      <FileText size={16} color={Colors.neutral[600]} />
                      <Text style={styles.attachmentName}>{attachment.name}</Text>
                      <Download size={16} color={Colors.primary[500]} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.neutral[900],
  },
  section: {
    padding: Spacing.lg,
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
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recordType: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.neutral[900],
  },
  recordDate: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
  },
  cardContent: {
    gap: Spacing.sm,
  },
  provider: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
  },
  summary: {
    fontSize: FontSize.md,
    color: Colors.neutral[900],
    lineHeight: 20,
  },
  attachments: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  attachmentsTitle: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.neutral[900],
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.neutral[50],
    borderRadius: 4,
  },
  attachmentName: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.neutral[900],
  },
}); 