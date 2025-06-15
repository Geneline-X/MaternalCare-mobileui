"use client"

import * as React from "react"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, FileText, Shield, Download, ExternalLink } from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"

export default function TermsPrivacy() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const DocumentSection = ({
    icon,
    title,
    description,
    lastUpdated,
    onView,
    onDownload,
  }: {
    icon: React.ReactNode
    title: string
    description: string
    lastUpdated: string
    onView: () => void
    onDownload: () => void
  }) => (
    <View style={[styles.documentSection, isDarkMode && styles.documentSectionDark]}>
      <View style={styles.documentHeader}>
        <View style={styles.documentInfo}>
          <View style={styles.documentIcon}>{icon}</View>
          <View style={styles.documentText}>
            <Text style={[styles.documentTitle, isDarkMode && styles.documentTitleDark]}>{title}</Text>
            <Text style={[styles.documentDescription, isDarkMode && styles.documentDescriptionDark]}>
              {description}
            </Text>
            <Text style={[styles.lastUpdated, isDarkMode && styles.lastUpdatedDark]}>Last updated: {lastUpdated}</Text>
          </View>
        </View>
      </View>
      <View style={styles.documentActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onView}>
          <ExternalLink size={16} color={Colors.primary[600]} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
          <Download size={16} color={Colors.primary[600]} />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? Colors.white : Colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Terms & Privacy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Legal Documents */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Legal Documents</Text>

          <DocumentSection
            icon={<FileText size={24} color={Colors.primary[600]} />}
            title="Terms of Service"
            description="Our terms and conditions for using MaternalCare services"
            lastUpdated="January 15, 2024"
            onView={() => {}}
            onDownload={() => {}}
          />

          <DocumentSection
            icon={<Shield size={24} color={Colors.success[600]} />}
            title="Privacy Policy"
            description="How we collect, use, and protect your personal information"
            lastUpdated="January 10, 2024"
            onView={() => {}}
            onDownload={() => {}}
          />

          <DocumentSection
            icon={<Shield size={24} color={Colors.warning[600]} />}
            title="HIPAA Notice"
            description="Notice of privacy practices for protected health information"
            lastUpdated="December 20, 2023"
            onView={() => {}}
            onDownload={() => {}}
          />

          <DocumentSection
            icon={<FileText size={24} color={Colors.neutral[600]} />}
            title="Cookie Policy"
            description="Information about how we use cookies and similar technologies"
            lastUpdated="November 30, 2023"
            onView={() => {}}
            onDownload={() => {}}
          />
        </View>

        {/* Compliance Information */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Compliance & Certifications</Text>

          <View style={styles.complianceGrid}>
            <View style={[styles.complianceItem, isDarkMode && styles.complianceItemDark]}>
              <Text style={[styles.complianceTitle, isDarkMode && styles.complianceTitleDark]}>HIPAA Compliant</Text>
              <Text style={[styles.complianceDescription, isDarkMode && styles.complianceDescriptionDark]}>
                Fully compliant with Health Insurance Portability and Accountability Act
              </Text>
            </View>

            <View style={[styles.complianceItem, isDarkMode && styles.complianceItemDark]}>
              <Text style={[styles.complianceTitle, isDarkMode && styles.complianceTitleDark]}>ISO 27001</Text>
              <Text style={[styles.complianceDescription, isDarkMode && styles.complianceDescriptionDark]}>
                Information security management system certification
              </Text>
            </View>

            <View style={[styles.complianceItem, isDarkMode && styles.complianceItemDark]}>
              <Text style={[styles.complianceTitle, isDarkMode && styles.complianceTitleDark]}>SOC 2 Type II</Text>
              <Text style={[styles.complianceDescription, isDarkMode && styles.complianceDescriptionDark]}>
                Security, availability, and confidentiality controls audited
              </Text>
            </View>

            <View style={[styles.complianceItem, isDarkMode && styles.complianceItemDark]}>
              <Text style={[styles.complianceTitle, isDarkMode && styles.complianceTitleDark]}>GDPR Ready</Text>
              <Text style={[styles.complianceDescription, isDarkMode && styles.complianceDescriptionDark]}>
                General Data Protection Regulation compliant
              </Text>
            </View>
          </View>
        </View>

        {/* Key Points */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Key Privacy Points</Text>

          <View style={styles.keyPoints}>
            <View style={styles.keyPoint}>
              <View style={styles.bulletPoint} />
              <Text style={[styles.keyPointText, isDarkMode && styles.keyPointTextDark]}>
                We never sell your personal health information to third parties
              </Text>
            </View>

            <View style={styles.keyPoint}>
              <View style={styles.bulletPoint} />
              <Text style={[styles.keyPointText, isDarkMode && styles.keyPointTextDark]}>
                All data is encrypted in transit and at rest using industry-standard encryption
              </Text>
            </View>

            <View style={styles.keyPoint}>
              <View style={styles.bulletPoint} />
              <Text style={[styles.keyPointText, isDarkMode && styles.keyPointTextDark]}>
                You have the right to access, correct, or delete your personal information
              </Text>
            </View>

            <View style={styles.keyPoint}>
              <View style={styles.bulletPoint} />
              <Text style={[styles.keyPointText, isDarkMode && styles.keyPointTextDark]}>
                We only share data with healthcare providers involved in your care
              </Text>
            </View>

            <View style={styles.keyPoint}>
              <View style={styles.bulletPoint} />
              <Text style={[styles.keyPointText, isDarkMode && styles.keyPointTextDark]}>
                Anonymous data may be used for research to improve maternal healthcare
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Questions or Concerns?</Text>

          <Text style={[styles.contactDescription, isDarkMode && styles.contactDescriptionDark]}>
            If you have any questions about our terms of service or privacy policy, please contact us:
          </Text>

          <View style={styles.contactInfo}>
            <Text style={[styles.contactItem, isDarkMode && styles.contactItemDark]}>
              Email: legal@maternalcare.com
            </Text>
            <Text style={[styles.contactItem, isDarkMode && styles.contactItemDark]}>Phone: +232 76 123 456</Text>
            <Text style={[styles.contactItem, isDarkMode && styles.contactItemDark]}>
              Address: 123 Medical Center Drive, Freetown, Sierra Leone
            </Text>
          </View>
        </View>

        {/* Version History */}
        <View style={[styles.versionSection, isDarkMode && styles.versionSectionDark]}>
          <Text style={[styles.versionTitle, isDarkMode && styles.versionTitleDark]}>Document Version History</Text>

          <View style={styles.versionItem}>
            <Text style={[styles.versionDate, isDarkMode && styles.versionDateDark]}>January 15, 2024</Text>
            <Text style={[styles.versionChange, isDarkMode && styles.versionChangeDark]}>
              Updated Terms of Service - Added new data retention policies
            </Text>
          </View>

          <View style={styles.versionItem}>
            <Text style={[styles.versionDate, isDarkMode && styles.versionDateDark]}>January 10, 2024</Text>
            <Text style={[styles.versionChange, isDarkMode && styles.versionChangeDark]}>
              Updated Privacy Policy - Enhanced data protection measures
            </Text>
          </View>

          <View style={styles.versionItem}>
            <Text style={[styles.versionDate, isDarkMode && styles.versionDateDark]}>December 20, 2023</Text>
            <Text style={[styles.versionChange, isDarkMode && styles.versionChangeDark]}>
              Updated HIPAA Notice - Clarified patient rights
            </Text>
          </View>
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
  documentSection: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  documentSectionDark: {
    borderBottomColor: Colors.neutral[700],
  },
  documentHeader: {
    marginBottom: Spacing.md,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  documentText: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  documentTitleDark: {
    color: Colors.white,
  },
  documentDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginBottom: 4,
    lineHeight: 20,
  },
  documentDescriptionDark: {
    color: Colors.neutral[400],
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[500],
  },
  lastUpdatedDark: {
    color: Colors.neutral[500],
  },
  documentActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
  },
  complianceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  complianceItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.neutral[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  complianceItemDark: {
    backgroundColor: Colors.neutral[700],
  },
  complianceTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  complianceTitleDark: {
    color: Colors.primary[400],
  },
  complianceDescription: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    lineHeight: 16,
  },
  complianceDescriptionDark: {
    color: Colors.neutral[400],
  },
  keyPoints: {
    gap: Spacing.md,
  },
  keyPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary[600],
    marginTop: 6,
    marginRight: Spacing.md,
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[700],
    lineHeight: 20,
  },
  keyPointTextDark: {
    color: Colors.neutral[300],
  },
  contactDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  contactDescriptionDark: {
    color: Colors.neutral[400],
  },
  contactInfo: {
    gap: Spacing.sm,
  },
  contactItem: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[800],
  },
  contactItemDark: {
    color: Colors.white,
  },
  versionSection: {
    backgroundColor: Colors.neutral[100],
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  versionSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  versionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  versionTitleDark: {
    color: Colors.white,
  },
  versionItem: {
    marginBottom: Spacing.md,
  },
  versionDate: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
    marginBottom: 2,
  },
  versionDateDark: {
    color: Colors.primary[400],
  },
  versionChange: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[700],
    lineHeight: 18,
  },
  versionChangeDark: {
    color: Colors.neutral[300],
  },
})
