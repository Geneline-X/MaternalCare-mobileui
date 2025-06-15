"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { FileText, Shield, Eye, ChevronRight } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

export default function TermsPrivacy() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    {
      id: "terms",
      icon: FileText,
      title: "Terms of Service",
      description: "Our terms and conditions for using MaternalCare",
      content: `1. ACCEPTANCE OF TERMS
By accessing and using MaternalCare, you accept and agree to be bound by the terms and provision of this agreement.

2. USE LICENSE
Permission is granted to temporarily download one copy of MaternalCare for personal, non-commercial transitory viewing only.

3. DISCLAIMER
The materials on MaternalCare are provided on an 'as is' basis. MaternalCare makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. LIMITATIONS
In no event shall MaternalCare or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use MaternalCare, even if MaternalCare or a MaternalCare authorized representative has been notified orally or in writing of the possibility of such damage.

5. ACCURACY OF MATERIALS
The materials appearing on MaternalCare could include technical, typographical, or photographic errors. MaternalCare does not warrant that any of the materials on its website are accurate, complete, or current.

6. LINKS
MaternalCare has not reviewed all of the sites linked to our app and is not responsible for the contents of any such linked site.

7. MODIFICATIONS
MaternalCare may revise these terms of service at any time without notice. By using this app, you are agreeing to be bound by the then current version of these terms of service.`,
    },
    {
      id: "privacy",
      icon: Shield,
      title: "Privacy Policy",
      description: "How we collect, use, and protect your information",
      content: `1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices and support messages
- Respond to your comments and questions
- Monitor and analyze trends and usage

3. INFORMATION SHARING
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

4. DATA SECURITY
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. DATA RETENTION
We retain your information for as long as your account is active or as needed to provide you services, comply with our legal obligations, resolve disputes, and enforce our agreements.

6. YOUR RIGHTS
You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your information
- Object to processing
- Data portability

7. CONTACT US
If you have questions about this Privacy Policy, please contact us at privacy@maternalcare.com.`,
    },
    {
      id: "cookies",
      icon: Eye,
      title: "Cookie Policy",
      description: "How we use cookies and similar technologies",
      content: `1. WHAT ARE COOKIES
Cookies are small text files that are placed on your device when you visit our app. They help us provide you with a better experience.

2. TYPES OF COOKIES WE USE
- Essential Cookies: Required for the app to function properly
- Analytics Cookies: Help us understand how you use our app
- Preference Cookies: Remember your settings and preferences
- Marketing Cookies: Used to deliver relevant advertisements

3. HOW WE USE COOKIES
We use cookies to:
- Keep you signed in
- Remember your preferences
- Analyze app usage
- Improve our services
- Provide personalized content

4. MANAGING COOKIES
You can control cookies through your device settings. However, disabling certain cookies may affect the functionality of our app.

5. THIRD-PARTY COOKIES
We may use third-party services that place cookies on your device. These services have their own privacy policies.

6. UPDATES TO THIS POLICY
We may update this Cookie Policy from time to time. We will notify you of any significant changes.`,
    },
  ]

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Please review our terms, privacy policy, and cookie policy to understand how we protect your information and
          what we expect from our users.
        </Text>

        <View style={styles.sectionsContainer}>
          {sections.map((section) => (
            <View key={section.id} style={styles.sectionCard}>
              <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section.id)}>
                <View style={styles.sectionLeft}>
                  <View style={styles.iconContainer}>
                    <section.icon size={20} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.sectionInfo}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionDescription}>{section.description}</Text>
                  </View>
                </View>
                <ChevronRight
                  size={20}
                  color={Colors.neutral[400]}
                  style={[styles.chevron, activeSection === section.id && styles.chevronRotated]}
                />
              </TouchableOpacity>

              {activeSection === section.id && (
                <View style={styles.sectionContent}>
                  <Text style={styles.contentText}>{section.content.trim()}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated: January 15, 2024</Text>
          <Text style={styles.footerText}>
            If you have any questions about these policies, please contact us at legal@maternalcare.com
          </Text>
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
  description: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.neutral[600],
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  sectionsContainer: {
    marginBottom: Spacing.xl,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  sectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.neutral[600],
  },
  chevron: {
    transform: [{ rotate: "0deg" }],
  },
  chevronRotated: {
    transform: [{ rotate: "90deg" }],
  },
  sectionContent: {
    padding: Spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  contentText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.neutral[700],
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.neutral[600],
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
})
