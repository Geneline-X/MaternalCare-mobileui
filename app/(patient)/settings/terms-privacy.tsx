"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, Shield, FileText } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

export default function TermsPrivacy() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms")

  const TabButton = ({
    tab,
    title,
    isActive,
    onPress,
  }: {
    tab: "terms" | "privacy"
    title: string
    isActive: boolean
    onPress: () => void
  }) => (
    <TouchableOpacity style={[styles.tabButton, isActive && styles.activeTabButton]} onPress={onPress}>
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>{title}</Text>
    </TouchableOpacity>
  )

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <View style={styles.sectionHeader}>
      <Icon size={20} color={Colors.primary[600]} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  )

  const TermsContent = () => (
    <ScrollView style={styles.contentScroll}>
      <View style={styles.contentContainer}>
        <SectionHeader icon={FileText} title="Terms of Service" />

        <Text style={styles.lastUpdated}>Last updated: January 15, 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By accessing and using MaternalCare, you accept and agree to be bound by the terms and provision of this
            agreement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.sectionText}>
            Permission is granted to temporarily download one copy of MaternalCare for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you
            may not:
          </Text>
          <Text style={styles.bulletPoint}>• Modify or copy the materials</Text>
          <Text style={styles.bulletPoint}>• Use the materials for any commercial purpose</Text>
          <Text style={styles.bulletPoint}>• Attempt to reverse engineer any software</Text>
          <Text style={styles.bulletPoint}>• Remove any copyright or proprietary notations</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Medical Disclaimer</Text>
          <Text style={styles.sectionText}>
            MaternalCare is not intended to replace professional medical advice, diagnosis, or treatment. Always seek
            the advice of your physician or other qualified health provider with any questions you may have regarding a
            medical condition.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
          <Text style={styles.sectionText}>You are responsible for:</Text>
          <Text style={styles.bulletPoint}>• Providing accurate and complete information</Text>
          <Text style={styles.bulletPoint}>• Maintaining the confidentiality of your account</Text>
          <Text style={styles.bulletPoint}>• Using the service in compliance with applicable laws</Text>
          <Text style={styles.bulletPoint}>• Notifying us of any unauthorized use of your account</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            In no event shall MaternalCare or its suppliers be liable for any damages (including, without limitation,
            damages for loss of data or profit, or due to business interruption) arising out of the use or inability to
            use the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Termination</Text>
          <Text style={styles.sectionText}>
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or
            liability, under our sole discretion, for any reason whatsoever.
          </Text>
        </View>
      </View>
    </ScrollView>
  )

  const PrivacyContent = () => (
    <ScrollView style={styles.contentScroll}>
      <View style={styles.contentContainer}>
        <SectionHeader icon={Shield} title="Privacy Policy" />

        <Text style={styles.lastUpdated}>Last updated: January 15, 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.sectionText}>
            We collect information you provide directly to us, such as when you create an account, update your profile,
            or communicate with us.
          </Text>
          <Text style={styles.bulletPoint}>• Personal information (name, email, phone number)</Text>
          <Text style={styles.bulletPoint}>• Health information (medical history, appointments)</Text>
          <Text style={styles.bulletPoint}>• Usage data (app interactions, preferences)</Text>
          <Text style={styles.bulletPoint}>• Device information (device type, operating system)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.sectionText}>We use the information we collect to:</Text>
          <Text style={styles.bulletPoint}>• Provide and maintain our services</Text>
          <Text style={styles.bulletPoint}>• Process appointments and communications</Text>
          <Text style={styles.bulletPoint}>• Send you important updates and notifications</Text>
          <Text style={styles.bulletPoint}>• Improve our services and user experience</Text>
          <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.sectionText}>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your
            consent, except as described in this policy:
          </Text>
          <Text style={styles.bulletPoint}>• With healthcare providers for treatment purposes</Text>
          <Text style={styles.bulletPoint}>• With service providers who assist our operations</Text>
          <Text style={styles.bulletPoint}>• When required by law or to protect rights and safety</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.sectionText}>
            We implement appropriate security measures to protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. This includes:
          </Text>
          <Text style={styles.bulletPoint}>• Encryption of data in transit and at rest</Text>
          <Text style={styles.bulletPoint}>• Regular security assessments and updates</Text>
          <Text style={styles.bulletPoint}>• Access controls and authentication measures</Text>
          <Text style={styles.bulletPoint}>• Employee training on data protection</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.sectionText}>You have the right to:</Text>
          <Text style={styles.bulletPoint}>• Access and update your personal information</Text>
          <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
          <Text style={styles.bulletPoint}>• Opt-out of certain communications</Text>
          <Text style={styles.bulletPoint}>• Request a copy of your data</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.bulletPoint}>• Email: privacy@maternalcare.com</Text>
          <Text style={styles.bulletPoint}>• Phone: +1 (234) 567-8900</Text>
          <Text style={styles.bulletPoint}>• Address: 123 Healthcare Ave, Medical City, MC 12345</Text>
        </View>
      </View>
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.title}>Terms & Privacy</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TabButton
          tab="terms"
          title="Terms of Service"
          isActive={activeTab === "terms"}
          onPress={() => setActiveTab("terms")}
        />
        <TabButton
          tab="privacy"
          title="Privacy Policy"
          isActive={activeTab === "privacy"}
          onPress={() => setActiveTab("privacy")}
        />
      </View>

      <View style={styles.content}>{activeTab === "terms" ? <TermsContent /> : <PrivacyContent />}</View>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginHorizontal: Spacing.xs,
  },
  activeTabButton: {
    backgroundColor: Colors.primary[50],
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[600],
  },
  activeTabButtonText: {
    color: Colors.primary[600],
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
    marginLeft: Spacing.sm,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
    marginBottom: Spacing.xl,
    fontStyle: "italic",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  bulletPoint: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    lineHeight: 20,
    marginLeft: Spacing.md,
    marginBottom: Spacing.xs,
  },
})
