"use client"

import * as React from "react"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Send,
  HelpCircle,
  Book,
  Video,
  FileText,
} from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"

export default function ContactSupport() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const [selectedCategory, setSelectedCategory] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supportCategories = [
    "Technical Issue",
    "Account Problem",
    "Billing Question",
    "Feature Request",
    "Data Export",
    "Privacy Concern",
    "Other",
  ]

  const handleSubmitTicket = async () => {
    if (!selectedCategory || !message || !email) {
      Alert.alert("Error", "Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      Alert.alert("Success", "Your support ticket has been submitted. We'll get back to you within 24 hours.", [
        {
          text: "OK",
          onPress: () => {
            setSelectedCategory("")
            setMessage("")
            setEmail("")
          },
        },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to submit ticket. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhoneCall = () => {
    Alert.alert("Call Support", "Would you like to call our support team?", [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Linking.openURL("tel:+23276123456") },
    ])
  }

  const handleEmail = () => {
    Linking.openURL("mailto:support@maternalcare.com?subject=Support Request")
  }

  const handleLiveChat = () => {
    Alert.alert("Live Chat", "Live chat feature will be available soon!")
  }

  const SupportOption = ({
    icon,
    title,
    description,
    onPress,
    available = true,
  }: {
    icon: React.ReactNode
    title: string
    description: string
    onPress: () => void
    available?: boolean
  }) => (
    <TouchableOpacity
      style={[styles.supportOption, isDarkMode && styles.supportOptionDark, !available && styles.supportOptionDisabled]}
      onPress={available ? onPress : undefined}
      disabled={!available}
    >
      <View style={[styles.supportOptionIcon, !available && styles.supportOptionIconDisabled]}>{icon}</View>
      <View style={styles.supportOptionText}>
        <Text
          style={[
            styles.supportOptionTitle,
            isDarkMode && styles.supportOptionTitleDark,
            !available && styles.disabledText,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.supportOptionDescription,
            isDarkMode && styles.supportOptionDescriptionDark,
            !available && styles.disabledText,
          ]}
        >
          {description}
        </Text>
      </View>
      {!available && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  const CategoryChip = ({ category, isSelected }: { category: string; isSelected: boolean }) => (
    <TouchableOpacity
      style={[styles.categoryChip, isSelected && styles.categoryChipSelected, isDarkMode && styles.categoryChipDark]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryChipText,
          isSelected && styles.categoryChipTextSelected,
          isDarkMode && styles.categoryChipTextDark,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  )

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.containerDark]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? Colors.white : Colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Contact Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Support Options */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Get Help</Text>

          <SupportOption
            icon={<MessageCircle size={24} color={Colors.primary[600]} />}
            title="Live Chat"
            description="Chat with our support team in real-time"
            onPress={handleLiveChat}
            available={false}
          />

          <SupportOption
            icon={<Phone size={24} color={Colors.success[600]} />}
            title="Phone Support"
            description="Call us at +232 76 123 456 (Mon-Fri, 9AM-5PM)"
            onPress={handlePhoneCall}
          />

          <SupportOption
            icon={<Mail size={24} color={Colors.warning[600]} />}
            title="Email Support"
            description="Send us an email and we'll respond within 24 hours"
            onPress={handleEmail}
          />
        </View>

        {/* Support Hours */}
        <View style={[styles.hoursSection, isDarkMode && styles.hoursSectionDark]}>
          <Clock size={20} color={Colors.primary[600]} />
          <View style={styles.hoursText}>
            <Text style={[styles.hoursTitle, isDarkMode && styles.hoursTitleDark]}>Support Hours</Text>
            <Text style={[styles.hoursDescription, isDarkMode && styles.hoursDescriptionDark]}>
              Monday - Friday: 9:00 AM - 5:00 PM (GMT){"\n"}
              Saturday: 10:00 AM - 2:00 PM (GMT){"\n"}
              Sunday: Closed
            </Text>
          </View>
        </View>

        {/* Submit Ticket */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Submit a Ticket</Text>

          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, isDarkMode && styles.fieldLabelDark]}>Email Address *</Text>
            <TextInput
              style={[styles.fieldInput, isDarkMode && styles.fieldInputDark]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor={isDarkMode ? Colors.neutral[500] : Colors.neutral[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, isDarkMode && styles.fieldLabelDark]}>Category *</Text>
            <View style={styles.categoriesContainer}>
              {supportCategories.map((category) => (
                <CategoryChip key={category} category={category} isSelected={selectedCategory === category} />
              ))}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, isDarkMode && styles.fieldLabelDark]}>Message *</Text>
            <TextInput
              style={[styles.messageInput, isDarkMode && styles.messageInputDark]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or question in detail..."
              placeholderTextColor={isDarkMode ? Colors.neutral[500] : Colors.neutral[400]}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmitTicket}
            disabled={isSubmitting}
          >
            <Send size={20} color={Colors.white} />
            <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting..." : "Submit Ticket"}</Text>
          </TouchableOpacity>
        </View>

        {/* Self-Help Resources */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Self-Help Resources</Text>

          <TouchableOpacity style={[styles.resourceItem, isDarkMode && styles.resourceItemDark]}>
            <HelpCircle size={20} color={Colors.primary[600]} />
            <Text style={[styles.resourceText, isDarkMode && styles.resourceTextDark]}>Frequently Asked Questions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.resourceItem, isDarkMode && styles.resourceItemDark]}>
            <Book size={20} color={Colors.primary[600]} />
            <Text style={[styles.resourceText, isDarkMode && styles.resourceTextDark]}>User Guide & Documentation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.resourceItem, isDarkMode && styles.resourceItemDark]}>
            <Video size={20} color={Colors.primary[600]} />
            <Text style={[styles.resourceText, isDarkMode && styles.resourceTextDark]}>Video Tutorials</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.resourceItem, isDarkMode && styles.resourceItemDark]}>
            <FileText size={20} color={Colors.primary[600]} />
            <Text style={[styles.resourceText, isDarkMode && styles.resourceTextDark]}>Release Notes</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contact */}
        <View style={[styles.emergencySection, isDarkMode && styles.emergencySectionDark]}>
          <Text style={[styles.emergencyTitle, isDarkMode && styles.emergencyTitleDark]}>Emergency Support</Text>
          <Text style={[styles.emergencyDescription, isDarkMode && styles.emergencyDescriptionDark]}>
            For critical system issues affecting patient care, call our emergency hotline:
          </Text>
          <TouchableOpacity style={styles.emergencyButton} onPress={() => Linking.openURL("tel:+23276999999")}>
            <Phone size={20} color={Colors.white} />
            <Text style={styles.emergencyButtonText}>+232 76 999 999</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  containerDark: {
    backgroundColor: Colors.neutral[900],
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
  headerDark: {
    backgroundColor: Colors.neutral[800],
    borderBottomColor: Colors.neutral[700],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  titleDark: {
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  sectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.lg,
  },
  sectionTitleDark: {
    color: Colors.white,
  },
  supportOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  supportOptionDark: {
    borderBottomColor: Colors.neutral[700],
  },
  supportOptionDisabled: {
    opacity: 0.6,
  },
  supportOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  supportOptionIconDisabled: {
    backgroundColor: Colors.neutral[200],
  },
  supportOptionText: {
    flex: 1,
  },
  supportOptionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  supportOptionTitleDark: {
    color: Colors.white,
  },
  supportOptionDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  supportOptionDescriptionDark: {
    color: Colors.neutral[400],
  },
  disabledText: {
    color: Colors.neutral[400],
  },
  comingSoonBadge: {
    backgroundColor: Colors.warning[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  comingSoonText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: Colors.warning[700],
  },
  hoursSection: {
    backgroundColor: Colors.primary[50],
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  hoursSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  hoursText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  hoursTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[700],
    marginBottom: Spacing.xs,
  },
  hoursTitleDark: {
    color: Colors.white,
  },
  hoursDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.primary[600],
    lineHeight: 20,
  },
  hoursDescriptionDark: {
    color: Colors.neutral[300],
  },
  formField: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  fieldLabelDark: {
    color: Colors.neutral[300],
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
    backgroundColor: Colors.neutral[50],
  },
  fieldInputDark: {
    borderColor: Colors.neutral[600],
    backgroundColor: Colors.neutral[700],
    color: Colors.white,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  categoryChipDark: {
    backgroundColor: Colors.neutral[700],
    borderColor: Colors.neutral[600],
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
  },
  categoryChipTextDark: {
    color: Colors.neutral[300],
  },
  categoryChipTextSelected: {
    color: Colors.white,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
    backgroundColor: Colors.neutral[50],
    height: 120,
    textAlignVertical: "top",
  },
  messageInputDark: {
    borderColor: Colors.neutral[600],
    backgroundColor: Colors.neutral[700],
    color: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary[600],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  resourceItemDark: {
    borderBottomColor: Colors.neutral[700],
  },
  resourceText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[800],
    marginLeft: Spacing.md,
  },
  resourceTextDark: {
    color: Colors.white,
  },
  emergencySection: {
    backgroundColor: Colors.error[50],
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  emergencySectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  emergencyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.error[700],
    marginBottom: Spacing.sm,
  },
  emergencyTitleDark: {
    color: Colors.error[400],
  },
  emergencyDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.error[600],
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  emergencyDescriptionDark: {
    color: Colors.neutral[300],
  },
  emergencyButton: {
    backgroundColor: Colors.error[600],
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  emergencyButtonText: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: Colors.white,
  },
})
