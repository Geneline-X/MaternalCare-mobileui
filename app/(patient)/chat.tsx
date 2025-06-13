import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/colors';
import { Send } from 'lucide-react-native';
import { Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/fontSize';

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'provider';
  timestamp: string;
}

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'provider',
      timestamp: '2023-06-01T10:00:00Z',
    },
    {
      id: '2',
      text: 'I have a question about my next appointment.',
      sender: 'patient',
      timestamp: '2023-06-01T10:01:00Z',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: 'patient',
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
      // TODO: Send message to API
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat with Provider</Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === 'patient' ? styles.patientMessage : styles.providerMessage,
            ]}>
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.timestamp}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor={Colors.neutral[400]}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}>
          <Send
            size={24}
            color={newMessage.trim() ? Colors.primary[500] : Colors.neutral[400]}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.neutral[900],
  },
  messagesContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  patientMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary[500],
  },
  providerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.neutral[100],
  },
  messageText: {
    fontSize: FontSize.md,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  timestamp: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
    maxHeight: 100,
  },
  sendButton: {
    padding: Spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 