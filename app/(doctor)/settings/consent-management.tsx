"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, FileText, Check, X, Clock, Download, Eye } from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"

interface ConsentRecord {
  id: string
  patientName: string
  patientId: string
  consentType: string
  status: "granted" | "denied" | "pending" | "expired"
  dateGranted?: string
  dateExpires?: string
  description: string
  version: string
}

const mockConsents: ConsentRecord[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    patientId: "P001",
    consentType: "Data Sharing",
    status: "granted",
    dateGranted: "2024-01-10T10:00:00Z",
    dateExpires: "2025-01-10T10:00:00Z",
    description: "Consent to share health data with research institutions",
    version: "v2.1",
  },
  {
    id: "2",
    patientName: "Emily Davis",
    patientId: "P002",
    consentType: "Treatment Authorization",
    status: "granted",
    dateGranted: "2024-01-08T14:30:00Z",
    dateExpires: "2024-07-08T14:30:00Z",
    description: "Authorization for maternal health treatment and procedures",
    version: "v1.5",
  },
  {
    id: "3",
    patientName: "Maria Rodriguez",
    patientId: "P003",
    consentType: "Emergency Contact",
    status: "pending",
    description: "Consent to contact emergency contacts in case of medical emergency",
    version: "v1.0",
  },
  {
    id: "4",
    patientName: "Lisa Chen",
    patientId: "P004",
    consentType: "Telemedicine",
    status: "expired",
    dateGranted: "2023-06-15T09:00:00Z",
    dateExpires: "2024-01-15T09:00:00Z",
    description: "Consent for telemedicine consultations and remote monitoring",
    version: "v1.2",
  },
]

export default function ConsentManagement() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const [consents, setConsents] = useState<ConsentRecord[]>(mockConsents)
  const [filter, setFilter] = useState<"all" | "granted" | "pending" | "expired">("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "granted":
        return Colors.success[500]
      case "denied":
        return Colors.error[500]
      case "pending":
        return Colors.warning[500]
      case "expired":
        return Colors.neutral[500]
      default:
        return Colors.neutral[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "granted":
        return <Check size={16} color={Colors.success[500]} />
      case "denied":
        return <X size={16} color={Colors.error[500]} />
      case "pending":
        return <Clock size={16} color={Colors.warning[500]} />
      case "expired":
        return <Clock size={16} color={Colors.neutral[500]} />
      default:
        return <FileText size={16} color={Colors.neutral[500]} />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredConsents = consents.filter((consent) => filter === "all" || consent.status === filter)

  const ConsentCard = ({ consent }: { consent: ConsentRecord }) => (
    <View style={[styles.consentCard, isDarkMode && styles.consentCardDark]}>
      <View style={styles.consentHeader}>
        <View style={styles.consentInfo}>
          <Text style={[styles.patientName, isDarkMode && styles.patientNameDark]}>{consent.patientName}</Text>
          <Text style={[styles.consentType, isDarkMode && styles.consentTypeDark]}>{consent.consentType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(consent.status) + "20" }]}>
          {getStatusIcon(consent.status)}
          <Text style={[styles.statusText, { color: getStatusColor(consent.status) }]}>
            {consent.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>{consent.description}</Text>

      <View style={styles.consentDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>Patient ID:</Text>
          <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>{consent.patientId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>Version:</Text>
          <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>{consent.version}</Text>
        </View>
        {consent.dateGranted && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>Granted:</Text>
            <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>
              {formatDate(consent.dateGranted)}
            </Text>
          </View>
        )}
        {consent.dateExpires && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>Expires:</Text>
            <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>
              {formatDate(consent.dateExpires)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.consentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert("View Consent", "View full consent document")}
        >
          <Eye size={16} color={Colors.primary[600]} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert("Download", "Download consent document")}
        >
          <Download size={16} color={Colors.primary[600]} />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
        {consent.status === "pending" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => Alert.alert("Approve", "Approve this consent request")}
          >
            <Check size={16} color={Colors.success[600]} />
            <Text style={[styles.actionButtonText, { color: Colors.success[600] }]}>Approve</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? Colors.white : Colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Consent Management</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={[styles.statsSection, isDarkMode && styles.statsSectionDark]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDarkMode && styles.statValueDark]}>{consents.length}</Text>
            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success[600] }]}>
              {consents.filter((c) => c.status === "granted").length}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Granted</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning[600] }]}>
              {consents.filter((c) => c.status === "pending").length}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.neutral[500] }]}>
              {consents.filter((c) => c.status === "expired").length}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Expired</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {["all", "granted", "pending", "expired"].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterTab,
                filter === filterOption && styles.activeFilterTab,
                isDarkMode && styles.filterTabDark,
              ]}
              onPress={() => setFilter(filterOption as any)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === filterOption && styles.activeFilterTabText,
                  isDarkMode && styles.filterTabTextDark,
                ]}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Consents List */}
        <View style={styles.consentsSection}>
          {filteredConsents.map((consent) => (
            <ConsentCard key={consent.id} consent={consent} />
          ))}
        </View>

        {filteredConsents.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.neutral[400]} />
            <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
              No consent records found
            </Text>
            <Text style={[styles.emptyStateSubtext, isDarkMode && styles.emptyStateSubtextDark]}>
              {filter === "all" ? "No consent records available" : `No ${filter} consent records found`}
            </Text>
          </View>
        )}

        {/* Information Section */}
        <View style={[styles.infoSection, isDarkMode && styles.infoSectionDark]}>
          <Text style={[styles.infoTitle, isDarkMode && styles.infoTitleDark]}>About Consent Management</Text>
          <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>
            This section allows you to manage patient consent records for various healthcare activities. All consent
            forms are digitally signed and legally binding. Patients can withdraw consent at any time, and you will be
            notified of any changes.
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
  statsSection: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-around",
    ...Shadows.sm,
  },
  statsSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
  },
  statValueDark: {
    color: Colors.white,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  statLabelDark: {
    color: Colors.neutral[400],
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterTabDark: {
    backgroundColor: Colors.neutral[800],
    borderColor: Colors.neutral[600],
  },
  activeFilterTab: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  filterTabTextDark: {
    color: Colors.neutral[300],
  },
  activeFilterTabText: {
    color: Colors.white,
  },
  consentsSection: {
    paddingHorizontal: Spacing.lg,
  },
  consentCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  consentCardDark: {
    backgroundColor: Colors.neutral[800],
  },
  consentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  consentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  patientNameDark: {
    color: Colors.white,
  },
  consentType: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.primary[600],
  },
  consentTypeDark: {
    color: Colors.primary[400],
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  descriptionDark: {
    color: Colors.neutral[400],
  },
  consentDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  detailLabelDark: {
    color: Colors.neutral[400],
  },
  detailValue: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
  },
  detailValueDark: {
    color: Colors.white,
  },
  consentActions: {
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
  approveButton: {
    backgroundColor: Colors.success[50],
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[600],
    marginTop: Spacing.md,
  },
  emptyStateTextDark: {
    color: Colors.neutral[400],
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
    marginTop: Spacing.xs,
  },
  emptyStateSubtextDark: {
    color: Colors.neutral[500],
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
