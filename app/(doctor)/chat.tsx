import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';
import { Send } from 'lucide-react-native';

const initialMessages: Message[] = [
  { id: '1', text: 'Hello! How can I help you today?', sender: 'other' as const },
  { id: '2', text: 'I have a question about my appointment.', sender: 'me' as const },
  { id: '3', text: 'Sure, feel free to ask!', sender: 'other' as const },
];

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { id: Date.now().toString(), text: input, sender: 'me' }]);
    setInput('');
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === 'me' ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Send size={20} color={Colors.white} />
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
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.neutral[800],
  },
  messagesList: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  myMessage: {
    backgroundColor: Colors.primary[100],
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[800],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    color: Colors.neutral[800],
  },
  sendButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 