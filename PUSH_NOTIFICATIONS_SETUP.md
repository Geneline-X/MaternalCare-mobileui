# Push Notifications Setup Guide for PreSTrack

This guide provides detailed instructions for setting up push notifications in the PreSTrack mobile app using Expo's push notification service.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Expo Push Notifications Setup](#expo-push-notifications-setup)
3. [Android Configuration](#android-configuration)
4. [iOS Configuration](#ios-configuration)
5. [Backend Integration](#backend-integration)
6. [Testing Push Notifications](#testing-push-notifications)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up push notifications, ensure you have:

- Expo CLI installed (`npm install -g @expo/cli`)
- An Expo account (sign up at [expo.dev](https://expo.dev))
- Physical devices for testing (push notifications don't work in simulators)
- For iOS: Apple Developer Account
- For Android: Google Cloud Console access

## Expo Push Notifications Setup

### 1. Install Required Dependencies

\`\`\`bash
npx expo install expo-notifications expo-device expo-constants
npm install @react-native-async-storage/async-storage
\`\`\`

### 2. Configure app.json

Add the following configuration to your `app.json`:

\`\`\`json
{
  "expo": {
    "name": "PreSTrack",
    "slug": "prestrack",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.prestrack"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.prestrack"
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff",
          "sounds": [
            "./assets/sounds/notification.wav"
          ]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#000000"
    }
  }
}
\`\`\`

### 3. Environment Variables

Create a `.env` file in your project root:

\`\`\`env
EXPO_PUBLIC_PUSH_NOTIFICATION_ENDPOINT=https://exp.host/--/api/v2/push/send
EXPO_PUBLIC_API_BASE_URL=https://your-backend-api.com
\`\`\`

## Android Configuration

### 1. Firebase Cloud Messaging (FCM) Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add an Android app to your Firebase project
4. Use your package name from `app.json` (e.g., `com.yourcompany.prestrack`)
5. Download `google-services.json`
6. Place it in your project root directory

### 2. Configure FCM in Expo

Add FCM configuration to your `app.json`:

\`\`\`json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
\`\`\`

### 3. Android Notification Channels

The app automatically creates notification channels for different types of notifications:

- **Default**: General notifications
- **Emergency**: High-priority emergency alerts
- **Appointments**: Appointment reminders
- **Patient Updates**: Patient status updates

## iOS Configuration

### 1. Apple Push Notification Service (APNs) Setup

1. Log in to [Apple Developer Console](https://developer.apple.com/)
2. Go to Certificates, Identifiers & Profiles
3. Create an App ID with Push Notifications capability
4. Generate an APNs Key:
   - Go to Keys section
   - Create a new key with Apple Push Notifications service (APNs)
   - Download the `.p8` file and note the Key ID

### 2. Configure APNs in Expo

1. Run `expo credentials:manager` in your project directory
2. Select iOS platform
3. Choose "Push Notifications: Manage your Apple Push Notification Keys"
4. Upload your `.p8` file and provide the Key ID

### 3. iOS Permissions

The app requests notification permissions automatically when first launched. Users can also manage permissions in iOS Settings.

## Backend Integration

### 1. Server-Side Push Notification Sending

Create an API endpoint to send push notifications:

\`\`\`javascript
// Example Node.js/Express endpoint
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

app.post('/api/send-notification', async (req, res) => {
  const { pushTokens, title, body, data } = req.body;

  // Create messages
  const messages = pushTokens.map(pushToken => ({
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high',
    channelId: 'default'
  }));

  // Send notifications
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }

  res.json({ success: true, tickets });
});
\`\`\`

### 2. Store Push Tokens

Store user push tokens in your database:

\`\`\`sql
CREATE TABLE user_push_tokens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  push_token VARCHAR(255) NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### 3. Notification Types and Priorities

Define different notification types in your backend:

\`\`\`javascript
const NOTIFICATION_TYPES = {
  EMERGENCY: {
    priority: 'high',
    sound: 'emergency.wav',
    channelId: 'emergency'
  },
  APPOINTMENT: {
    priority: 'normal',
    sound: 'default',
    channelId: 'appointments'
  },
  PATIENT_UPDATE: {
    priority: 'normal',
    sound: 'default',
    channelId: 'patient_updates'
  }
};
\`\`\`

## Testing Push Notifications

### 1. Using Expo Push Tool

Test notifications using Expo's push tool:

1. Go to [https://expo.dev/notifications](https://expo.dev/notifications)
2. Enter your Expo push token
3. Compose and send a test notification

### 2. Using curl

\`\`\`bash
curl -H "Content-Type: application/json" \
     -X POST \
     -d '{
       "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
       "title": "Test Notification",
       "body": "This is a test notification from PreSTrack",
       "data": {"type": "test"}
     }' \
     https://exp.host/--/api/v2/push/send
\`\`\`

### 3. Testing Different Scenarios

Test these notification scenarios:

- **Emergency Alerts**: High-priority notifications for critical patient updates
- **Appointment Reminders**: Scheduled notifications for upcoming appointments
- **Patient Updates**: Regular updates about patient status changes
- **System Notifications**: App updates and maintenance notices

## Production Deployment

### 1. Build Configuration

For production builds, ensure:

\`\`\`bash
# Build for Android
expo build:android --type apk

# Build for iOS
expo build:ios --type archive
\`\`\`

### 2. Production Environment Variables

Set production environment variables:

\`\`\`env
EXPO_PUBLIC_PUSH_NOTIFICATION_ENDPOINT=https://exp.host/--/api/v2/push/send
EXPO_PUBLIC_API_BASE_URL=https://your-production-api.com
\`\`\`

### 3. Notification Rate Limits

Be aware of Expo's rate limits:
- 600 notifications per second
- 6,000,000 notifications per month (free tier)

## Troubleshooting

### Common Issues and Solutions

#### 1. Push Token Not Generated

**Problem**: `getExpoPushTokenAsync()` returns null or undefined

**Solutions**:
- Ensure you're testing on a physical device
- Check that notification permissions are granted
- Verify your Expo account is properly configured

#### 2. Notifications Not Received

**Problem**: Push notifications are sent but not received

**Solutions**:
- Check device notification settings
- Verify the push token is valid and current
- Ensure the app is not in "Do Not Disturb" mode
- Check notification channel settings (Android)

#### 3. iOS Notifications Not Working

**Problem**: Notifications work on Android but not iOS

**Solutions**:
- Verify APNs key is properly configured
- Check bundle identifier matches Apple Developer Console
- Ensure notification permissions are granted
- Test with a production build (development builds may have issues)

#### 4. Android Notification Channels

**Problem**: Notifications not showing with custom sounds or priorities

**Solutions**:
- Ensure notification channels are properly created
- Check channel importance levels
- Verify custom sound files are in the correct format

### Debug Mode

Enable debug logging for notifications:

\`\`\`javascript
import * as Notifications from 'expo-notifications';

// Enable debug mode
if (__DEV__) {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      console.log('Notification received:', notification);
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
}
\`\`\`

### Logging and Monitoring

Implement comprehensive logging:

\`\`\`javascript
const logNotificationEvent = async (event, data) => {
  try {
    await fetch(`${API_BASE_URL}/api/notification-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
        userId: user?.id,
      }),
    });
  } catch (error) {
    console.error('Failed to log notification event:', error);
  }
};
\`\`\`

## Security Considerations

1. **Token Security**: Store push tokens securely and rotate them regularly
2. **Message Validation**: Validate all notification content on the server
3. **Rate Limiting**: Implement rate limiting to prevent spam
4. **User Consent**: Always respect user notification preferences
5. **Data Privacy**: Don't include sensitive patient data in notification content

## Best Practices

1. **Personalization**: Customize notifications based on user role and preferences
2. **Timing**: Send notifications at appropriate times based on user timezone
3. **Batching**: Group related notifications to avoid overwhelming users
4. **Fallback**: Implement fallback mechanisms for critical notifications
5. **Analytics**: Track notification delivery and engagement rates

## Support and Resources

- [Expo Push Notifications Documentation](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Expo Community Forums](https://forums.expo.dev/)

For additional support, contact the development team or refer to the project documentation.
