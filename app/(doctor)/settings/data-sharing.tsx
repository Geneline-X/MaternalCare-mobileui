"use client"

import * as React from "react"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, Database, Users, Shield, Globe, FileText, Settings } from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"

export default function DataSharing() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const [sharingSettings, setSharingSettings] = useState({
    shareWithPatients: true,
    shareWithColleagues: false,
    shareWithResearch: false,
    shareAnonymizedData: true,
    shareForQualityImprovement: true,
    shareForEmergencies: true,
    shareWithInsurance: false,
    shareWithGovernment: false,
  })

  const handleToggle = (key: string, value: boolean) => {
    if (key === "shareForEmergencies" && !value) {
      Alert.alert(
        "Disable Emergency Sharing",
        "Disabling emergency data sharing may affect patient care in critical situations. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: () => setSharingSettings({ ...sharingSettings, [key]: value }),
          },
        ],
      )
    } else if (key === "shareWithResearch" && value) {
      Alert.alert(
        "Enable Research Sharing",
        "This will share anonymized patient data with approved research institutions. Patient identities will be protected.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: () => setSharingSettings({ ...sharingSettings, [key]: value }),
          },
        ],
      )
    } else {
      setSharingSettings({ ...sharingSettings, [key]: value })
    }
  }

  const SharingItem = ({
    icon,
    title,
    description,
    value,
    onToggle,
    type = "switch",
    recommended = false,
    warning = false,
  }: {
    icon: React.ReactNode
    title: string
    description: string
    value?: boolean
    onToggle?: () => void
    type?: "switch" | "button"
    recommended?: boolean
    warning?: boolean
  }) => (
    <View style={[styles.sharingItem, isDarkMode && styles.sharingItemDark]}>
      <View style={styles.sharingItemLeft}>
        <View style={[styles.sharingItemIcon, warning && styles.warningIcon]}>{icon}</View>
        <View style={styles.sharingItemText}>
          <View style={styles.titleRow}>
            <Text style={[styles.sharingItemTitle, isDarkMode && styles.sharingItemTitleDark]}>{title}</Text>
            {recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
            {warning && (
              <View style={styles.warningBadge}>
                <Text style={styles.warningText}>Sensitive</Text>
              </View>
            )}
          </View>
          <Text style={[styles.sharingItemDescription, isDarkMode && styles.sharingItemDescriptionDark]}>
            {description}
          </Text>
        </View>
      </View>
      {type === "switch" && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: Colors.neutral[300], true: warning ? Colors.warning[200] : Colors.primary[200] }}
          thumbColor={value ? (warning ? Colors.warning[600] : Colors.primary[600]) : Colors.neutral[400]}
        />
      )}
      {type === "button" && (
        <TouchableOpacity style={styles.configureButton} onPress={onToggle}>
          <Text style={styles.configureButtonText}>Configure</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? Colors.white : Colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Data Sharing</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Care Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Patient Care</Text>

          <SharingItem
            icon={<Users size={20} color={Colors.primary[600]} />}
            title="Share with Patients"
            description="Allow patients to access their health data and reports"
            value={sharingSettings.shareWithPatients}
            onToggle={() => handleToggle("shareWithPatients", !sharingSettings.shareWithPatients)}
            recommended
          />

          <SharingItem
            icon={<Shield size={20} color={Colors.success[600]} />}
            title="Emergency Sharing"
            description="Share critical data with emergency responders when needed"
            value={sharingSettings.shareForEmergencies}
            onToggle={() => handleToggle("shareForEmergencies", !sharingSettings.shareForEmergencies)}
            recommended
          />

          <SharingItem
            icon={<Users size={20} color={Colors.neutral[600]} />}
            title="Share with Colleagues"
            description="Allow other healthcare providers to access patient data for consultations"
            value={sharingSettings.shareWithColleagues}
            onToggle={() => handleToggle("shareWithColleagues", !sharingSettings.shareWithColleagues)}
          />
        </View>

        {/* Research & Quality Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Research & Quality</Text>

          <SharingItem
            icon={<Database size={20} color={Colors.primary[600]} />}
            title="Anonymized Research Data"
            description="Share anonymized data to help improve maternal healthcare research"
            value={sharingSettings.shareAnonymizedData}
            onToggle={() => handleToggle("shareAnonymizedData", !sharingSettings.shareAnonymizedData)}
            recommended
          />

          <SharingItem
            icon={<FileText size={20} color={Colors.neutral[600]} />}
            title="Research Participation"
            description="Share identifiable data with approved research institutions"
            value={sharingSettings.shareWithResearch}
            onToggle={() => handleToggle("shareWithResearch", !sharingSettings.shareWithResearch)}
            warning
          />

          <SharingItem
            icon={<Settings size={20} color={Colors.primary[600]} />}
            title="Quality Improvement"
            description="Share data to help improve healthcare services and outcomes"
            value={sharingSettings.shareForQualityImprovement}
            onToggle={() => handleToggle("shareForQualityImprovement", !sharingSettings.shareForQualityImprovement)}
            recommended
          />
        </View>

        {/* External Organizations Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>External Organizations</Text>

          <SharingItem
            icon={<Shield size={20} color={Colors.warning[600]} />}
            title="Insurance Companies"
            description="Share data with insurance providers for claims processing"
            value={sharingSettings.shareWithInsurance}
            onToggle={() => handleToggle("shareWithInsurance", !sharingSettings.shareWithInsurance)}
            warning
          />

          <SharingItem
            icon={<Globe size={20} color={Colors.warning[600]} />}
            title="Government Agencies"
            description="Share data with health authorities for public health monitoring"
            value={sharingSettings.shareWithGovernment}
            onToggle={() => handleToggle("shareWithGovernment", !sharingSettings.shareWithGovernment)}
            warning
          />
        </View>

        {/* Data Rights Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Data Rights</Text>

          <TouchableOpacity style={[styles.actionItem, isDarkMode && styles.actionItemDark]}>
            <Text style={[styles.actionItemText, isDarkMode && styles.actionItemTextDark]}>View Shared Data Log</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, isDarkMode && styles.actionItemDark]}>
            <Text style={[styles.actionItemText, isDarkMode && styles.actionItemTextDark]}>Download My Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, isDarkMode && styles.actionItemDark]}>
            <Text style={[styles.actionItemText, isDarkMode && styles.actionItemTextDark]}>Request Data Deletion</Text>
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View style={[styles.infoSection, isDarkMode && styles.infoSectionDark]}>
          <Text style={[styles.infoTitle, isDarkMode && styles.infoTitleDark]}>Data Protection</Text>
          <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>
            Your data is protected using industry-standard encryption and security measures. We comply with HIPAA and
            other healthcare privacy regulations. You can change these settings at any time, and we will respect your
            preferences for future data sharing.
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
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  sectionTitleDark: {
    color: Colors.white,
  },
  sharingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  sharingItemDark: {
    borderBottomColor: Colors.neutral[700],
  },
  sharingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sharingItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  warningIcon: {
    backgroundColor: Colors.warning[50],
  },
  sharingItemText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  sharingItemTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginRight: Spacing.sm,
  },
  sharingItemTitleDark: {
    color: Colors.white,
  },
  recommendedBadge: {
    backgroundColor: Colors.success[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  recommendedText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: Colors.success[700],
  },
  warningBadge: {
    backgroundColor: Colors.warning[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  warningText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: Colors.warning[700],
  },
  sharingItemDescription: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  sharingItemDescriptionDark: {
    color: Colors.neutral[400],
  },
  configureButton: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  configureButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
  },
  actionItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  actionItemDark: {
    borderBottomColor: Colors.neutral[700],
  },
  actionItemText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[800],
  },
  actionItemTextDark: {
    color: Colors.white,
  },
  infoSection: {
    backgroundColor: Colors.primary[50],
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  infoSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[700],
    marginBottom: Spacing.sm,
  },
  infoTitleDark: {
    color: Colors.white,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.primary[600],
    lineHeight: 20,
  },
  infoTextDark: {
    color: Colors.neutral[300],
  },
})
