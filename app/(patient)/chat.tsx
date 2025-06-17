import * as React from 'react';
import { 
  useState, 
  useRef, 
  useCallback, 
  useEffect 
} from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '@/hooks/useChat';
import { blobToBase64 } from '@/utils/audioUtils';
import config from '@/config';
import { ChatMessage, SenderType, VoiceMetadata } from '@/types';

interface ChatScreenProps {
  roomId: string;
  patientId: string;
  socketUrl?: string;
  patientName?: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  roomId,
  patientId,
  socketUrl = config.SOCKET_URL,
  patientName = 'Patient'
}) => {
  // State and refs
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<Audio.Recording | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const recordingStartTime = useRef<number>(0);

  // Chat hook
  const { 
    messages = [], 
    isConnected = false, 
    isLoading = false,
    error, 
    sendMessage,
    sendVoiceMessage,
  } = useChat({
    roomId,
    userId: patientId,
    socketUrl,
    callbacks: {
      onError: (error) => {
        console.error('Chat error:', error);
        Alert.alert('Error', error.message);
      },
      onConnect: () => {
        console.log('Connected to chat server');
      },
      onDisconnect: () => {
        console.log('Disconnected from chat server');
      },
    },
  });

  // Format time for message timestamp
  const formatTime = (timestamp: string | number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle sending a text message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      roomId,
      senderId: patientId,
      senderType: 'patient' as SenderType,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sending'
    };
    
    sendMessage(newMessage.trim());
    setNewMessage('');
  }, [newMessage, patientId, roomId, sendMessage]);

  // Handle starting voice recording
  const handleStartRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Microphone access is needed to record voice messages');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      mediaRecorderRef.current = recording;
      recordingStartTime.current = Date.now();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  }, []);

  // Handle stopping voice recording
  const handleStopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;
    
    try {
      await mediaRecorderRef.current.stopAndUnloadAsync();
      const uri = mediaRecorderRef.current.getURI();
      
      if (uri) {
        const { sound, status } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
        );
        
        try {
          // Convert the audio file to base64
          const response = await fetch(uri);
          const blob = await response.blob();
          const base64Audio = await blobToBase64(blob);
          
          // Send the voice message with the audio data and duration
          const duration = status?.isLoaded ? status.durationMillis ?? 0 : 0;
          await sendVoiceMessage(
            base64Audio, // audioData as base64 string
            duration // duration in milliseconds
          );
          
          // Clean up the sound object
          await sound.unloadAsync();
        } catch (err) {
          console.error('Failed to process audio data:', err);
          Alert.alert('Error', 'Failed to process audio data');
        }
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert('Error', 'Failed to stop recording');
    } finally {
      setIsRecording(false);
      mediaRecorderRef.current = null;
    }
  }, [patientId, roomId, sendVoiceMessage]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Connecting to chat...</Text>
      </View>
    );
  }

  // Connection error state
  if (!isConnected) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Connecting to chat server...</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }}
        >
          {messages.map((message, index) => (
            <View
              key={`${message.id}-${index}`}
              style={[
                styles.messageContainer,
                message.senderId === patientId 
                  ? styles.patientMessage 
                  : styles.doctorMessage
              ]}
            >
              {message.type === 'voice' && (message.metadata as VoiceMetadata)?.uri ? (
                <TouchableOpacity 
                  onPress={async () => {
                    if ((message.metadata as VoiceMetadata)?.uri) {
                      try {
                        const { sound } = await Audio.Sound.createAsync(
                          { uri: (message.metadata as VoiceMetadata).uri },
                          { shouldPlay: true }
                        );
                        await sound.playAsync();
                        // Unload the sound when done playing
                        sound.setOnPlaybackStatusUpdate((status) => {
                          if (!status.isLoaded) return; // Skip if status is not loaded or is an error
                          if (status.didJustFinish) {
                            sound.unloadAsync();
                          }
                        });
                      } catch (err) {
                        console.error('Error playing audio:', err);
                        Alert.alert('Error', 'Failed to play voice message');
                      }
                    }
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons 
                      name="play" 
                      size={20} 
                      color={message.senderId === patientId ? 'white' : '#E91E63'} 
                    />
                    <Text style={[
                      styles.voiceDuration,
                      { color: message.senderId === patientId ? 'white' : '#E91E63' }
                    ]}>
                      {message.metadata?.duration 
                        ? `${Math.floor(message.metadata.duration / 1000)}s` 
                        : 'Play'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Text style={[
                  styles.messageText,
                  { color: message.senderId === patientId ? 'white' : 'black' }
                ]}>
                  {message.content}
                </Text>
              )}
              <Text style={[
                styles.timestamp,
                { color: message.senderId === patientId ? 'rgba(255,255,255,0.7)' : '#888' }
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
          />
          {newMessage.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!isConnected}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isRecording && styles.voiceButtonRecording
              ]}
              onPressIn={handleStartRecording}
              onPressOut={handleStopRecording}
              disabled={!isConnected}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={20}
                color={isRecording ? 'white' : '#E91E63'}
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  patientMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E91E63',
    marginLeft: '20%',
  },
  doctorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    marginRight: '20%',
  },
  messageText: {
    fontSize: 16,
  },
  voiceDuration: {
    marginLeft: 5,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8F9FA",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 50,
    marginBottom: 35,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 10,
    color: 'black',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: "#F0F0F0",
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FCE4EC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderWidth: 2,
    borderColor: "#E91E63",
  },
  voiceButtonRecording: {
    backgroundColor: "#E91E63",
    borderColor: "#C2185B",
    transform: [{ scale: 1.1 }],
  },
})