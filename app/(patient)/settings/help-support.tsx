"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, Send } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

const faqs = [
  {
    question: "How do I book an appointment?",
    answer:
      "You can book an appointment by going to the Appointments tab and selecting 'Book New Appointment'. Choose your preferred doctor, date, and time slot.",
  },
  {
    question: "Can I cancel or reschedule my appointment?",
    answer:
      "Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time. Go to your appointments and select the appointment you want to modify.",
  },
  {
    question: "How do I update my medical information?",
    answer:
      "Go to Settings > Personal Information to update your medical details, allergies, emergency contacts, and other health information.",
  },
  {
    question: "Is my health data secure?",
    answer:
      "Yes, we use industry-standard encryption and security measures to protect your health data. Your information is never shared without your explicit consent.",
  },
  {
    question: "How do I contact my doctor?",
    answer:
      "You can message your doctor through the Chat tab. For urgent matters, please call the emergency number or visit the nearest hospital.",
  },
  {
    question: "What should I do in case of emergency?",
    answer:
      "For medical emergencies, call 911 immediately. This app is not intended for emergency situations. Always seek immediate medical attention for urgent health concerns.",
  },
]

export default function HelpSupport() {
  const router = useRouter()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [contactMessage, setContactMessage] = useState("")
  const [contactSubject, setContactSubject] = useState("")

  const handleFaqToggle = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const handleSendMessage = () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      Alert.alert("Error", "Please fill in both subject and message fields")
      return
    }

    Alert.alert(
      "Message Sent",
      "Your message has been sent to our support team. We'll get back to you within 24 hours.",
      [
        {
          text: "OK",
          onPress: () => {
            setContactSubject("")
            setContactMessage("")
          },
        },
      ],
    )
  }

  const handlePhoneCall = () => {
    Linking.openURL("tel:+1234567890")
  }

  const handleEmail = () => {
    Linking.openURL("mailto:support@maternalcare.com")
  }

  const ContactOption = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: any
    title: string
    subtitle: string
    onPress: () => void
  }) => (
    <TouchableOpacity style={styles.contactOption} onPress={onPress}>
      <View style={styles.contactIconContainer}>
        <Icon size={20} color={Colors.primary[600]} />
      </View>
      <View style={styles.contactText}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  )

  const FaqItem = ({ faq, index }: { faq: (typeof faqs)[0]; index: number }) => (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQuestion} onPress={() => handleFaqToggle(index)}>
        <Text style={styles.faqQuestionText}>{faq.question}</Text>
        {expandedFaq === index ? (
          <ChevronUp size={20} color={Colors.neutral[600]} />
        ) : (
          <ChevronDown size={20} color={Colors.neutral[600]} />
        )}
      </TouchableOpacity>
      {expandedFaq === index && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactOptions}>
            <ContactOption icon={Phone} title="Call Support" subtitle="+1 (234) 567-8900" onPress={handlePhoneCall} />
            <ContactOption
              icon={Mail}
              title="Email Support"
              subtitle="support@maternalcare.com"
              onPress={handleEmail}
            />
            <ContactOption
              icon={MessageCircle}
              title="Live Chat"
              subtitle="Chat with our support team"
              onPress={() => Alert.alert("Coming Soon", "Live chat will be available soon")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <FaqItem key={index} faq={faq} index={index} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <View style={styles.contactForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={contactSubject}
                onChangeText={setContactSubject}
                placeholder="What can we help you with?"
                placeholderTextColor={Colors.neutral[400]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={contactMessage}
                onChangeText={setContactMessage}
                placeholder="Describe your issue or question in detail..."
                placeholderTextColor={Colors.neutral[400]}
                multiline
                numberOfLines={5}
              />
            </View>

            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Send size={16} color={Colors.white} />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.emergencyNotice}>
          <Text style={styles.emergencyTitle}>⚠️ Emergency Notice</Text>
          <Text style={styles.emergencyText}>
            For medical emergencies, please call 911 or go to your nearest emergency room immediately. This app is not
            intended for emergency situations.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  contactOptions: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
  },
  contactSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  faqContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  faqQuestionText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    flex: 1,
    marginRight: Spacing.sm,
  },
  faqAnswer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  faqAnswerText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    lineHeight: 20,
  },
  contactForm: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[700],
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
  emergencyNotice: {
    backgroundColor: Colors.error[50],
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  emergencyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.error[700],
    marginBottom: Spacing.sm,
  },
  emergencyText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.error[600],
    lineHeight: 20,
  },
})
