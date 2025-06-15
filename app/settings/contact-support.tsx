"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Linking } from "react-native"
import { MessageCircle, Phone, Mail, Send, HelpCircle, Clock, MapPin } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

export default function ContactSupport() {
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")

  const handleSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    Alert.alert("Success", "Your message has been sent. We'll get back to you soon!")
    setMessage("")
    setSubject("")
  }

  const handlePhoneCall = () => {
    Linking.openURL("tel:+1234567890")
  }

  const handleEmail = () => {
    Linking.openURL("mailto:support@maternalcare.com")
  }

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      subtitle: "+1 (234) 567-8900",
      description: "Available 24/7 for emergencies",
      onPress: handlePhoneCall,
    },
    {
      icon: Mail,
      title: "Email Support",
      subtitle: "support@maternalcare.com",
      description: "Response within 24 hours",
      onPress: handleEmail,
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      subtitle: "Chat with our team",
      description: "Available Mon-Fri, 9AM-6PM",
      onPress: () => console.log("Open live chat"),
    },
  ]

  const faqItems = [
    "How do I schedule an appointment?",
    "How can I access my medical records?",
    "What should I do in case of emergency?",
    "How do I update my profile information?",
    "How can I share my data with my doctor?",
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <View style={styles.contactMethods}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity key={index} style={styles.contactMethod} onPress={method.onPress}>
                <View style={styles.contactIcon}>
                  <method.icon size={20} color={Colors.primary[600]} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
                  <Text style={styles.contactDescription}>{method.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Send Message Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <View style={styles.messageForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="What can we help you with?"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue or question..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Send size={20} color={Colors.white} />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {faqItems.map((question, index) => (
              <TouchableOpacity key={index} style={styles.faqItem}>
                <HelpCircle size={16} color={Colors.primary[600]} />
                <Text style={styles.faqQuestion}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Office Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Office Information</Text>
          <View style={styles.officeInfo}>
            <View style={styles.officeItem}>
              <Clock size={20} color={Colors.primary[600]} />
              <View style={styles.officeText}>
                <Text style={styles.officeTitle}>Business Hours</Text>
                <Text style={styles.officeDetails}>Mon-Fri: 8:00 AM - 6:00 PM</Text>
                <Text style={styles.officeDetails}>Sat-Sun: 9:00 AM - 4:00 PM</Text>
              </View>
            </View>

            <View style={styles.officeItem}>
              <MapPin size={20} color={Colors.primary[600]} />
              <View style={styles.officeText}>
                <Text style={styles.officeTitle}>Address</Text>
                <Text style={styles.officeDetails}>123 Healthcare Ave</Text>
                <Text style={styles.officeDetails}>Medical District, City 12345</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  contactMethods: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  contactMethod: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.primary[600],
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  messageForm: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  faqList: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  faqQuestion: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[700],
    marginLeft: Spacing.sm,
    flex: 1,
  },
  officeInfo: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  officeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  officeText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  officeTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.xs,
  },
  officeDetails: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginBottom: 2,
  },
})
