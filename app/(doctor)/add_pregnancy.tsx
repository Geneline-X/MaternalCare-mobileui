import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';
import { useRouter } from 'expo-router';

export default function AddPregnancy() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    patientId: '',
    lastMenstrualPeriod: '',
    expectedDeliveryDate: '',
    numberOfPregnancies: '',
    numberOfLiveBirths: '',
    numberOfMiscarriages: '',
    bloodType: '',
    height: '',
    prePregnancyWeight: '',
    currentWeight: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    familyHistory: '',
  });

  const handleSubmit = () => {
    // TODO: Implement pregnancy record creation logic
    console.log('Form submitted:', formData);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Pregnancy Record</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Patient ID</Text>
            <TextInput
              style={styles.input}
              value={formData.patientId}
              onChangeText={(text) => setFormData({ ...formData, patientId: text })}
              placeholder="Enter patient ID"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Menstrual Period</Text>
            <TextInput
              style={styles.input}
              value={formData.lastMenstrualPeriod}
              onChangeText={(text) => setFormData({ ...formData, lastMenstrualPeriod: text })}
              placeholder="MM/DD/YYYY"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expected Delivery Date</Text>
            <TextInput
              style={styles.input}
              value={formData.expectedDeliveryDate}
              onChangeText={(text) => setFormData({ ...formData, expectedDeliveryDate: text })}
              placeholder="MM/DD/YYYY"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Previous Pregnancies</Text>
            <TextInput
              style={styles.input}
              value={formData.numberOfPregnancies}
              onChangeText={(text) => setFormData({ ...formData, numberOfPregnancies: text })}
              placeholder="Enter number"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Live Births</Text>
            <TextInput
              style={styles.input}
              value={formData.numberOfLiveBirths}
              onChangeText={(text) => setFormData({ ...formData, numberOfLiveBirths: text })}
              placeholder="Enter number"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Miscarriages</Text>
            <TextInput
              style={styles.input}
              value={formData.numberOfMiscarriages}
              onChangeText={(text) => setFormData({ ...formData, numberOfMiscarriages: text })}
              placeholder="Enter number"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Type</Text>
            <TextInput
              style={styles.input}
              value={formData.bloodType}
              onChangeText={(text) => setFormData({ ...formData, bloodType: text })}
              placeholder="Enter blood type"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={formData.height}
              onChangeText={(text) => setFormData({ ...formData, height: text })}
              placeholder="Enter height"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pre-pregnancy Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={formData.prePregnancyWeight}
              onChangeText={(text) => setFormData({ ...formData, prePregnancyWeight: text })}
              placeholder="Enter weight"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={formData.currentWeight}
              onChangeText={(text) => setFormData({ ...formData, currentWeight: text })}
              placeholder="Enter weight"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medical Conditions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.medicalConditions}
              onChangeText={(text) => setFormData({ ...formData, medicalConditions: text })}
              placeholder="Enter medical conditions"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Medications</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.medications}
              onChangeText={(text) => setFormData({ ...formData, medications: text })}
              placeholder="Enter medications"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Allergies</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.allergies}
              onChangeText={(text) => setFormData({ ...formData, allergies: text })}
              placeholder="Enter allergies"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Family History</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.familyHistory}
              onChangeText={(text) => setFormData({ ...formData, familyHistory: text })}
              placeholder="Enter family history"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Add Pregnancy Record</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.neutral[800],
  },
  content: {
    flex: 1,
  },
  form: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.neutral[700],
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[800],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  submitButton: {
    backgroundColor: Colors.primary[600],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
}); 