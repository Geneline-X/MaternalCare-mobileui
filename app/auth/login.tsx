import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useRouter } from 'expo-router';
import { mockUsers, User } from '../constants/mockData';

// Extend the global type to include our user
declare global {
  var user: User | undefined;
}

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Store user data in memory (in a real app, you'd use secure storage)
      global.user = user;
      
      // Navigate based on role
      if (user.role === 'patient') {
        router.push('/(patient)/home');
      } else {
        router.push('/(doctor)/dashboard');
      }
    } else {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/register')}>
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
  },
  header: {
    marginTop: Spacing.xl * 2,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
  },
  form: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.neutral[900],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: Colors.primary[600],
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: Colors.primary[600],
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[300],
  },
  dividerText: {
    color: Colors.neutral[600],
    marginHorizontal: Spacing.md,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.primary[600],
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary[600],
    fontSize: 16,
    fontWeight: '600',
  },
});