"use client"
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, Check, Globe } from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "kr", name: "Krio", nativeName: "Krio" },
]

export default function LanguageSettings() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { t, currentLanguage, changeLanguage } = useTranslation()

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage) return

    await changeLanguage(languageCode)
    Alert.alert(t("common.success"), t("language.languageChanged"), [{ text: t("common.ok") }])
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? Colors.white : Colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>{t("language.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t("language.selectLanguage")}
          </Text>

          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                isDarkMode && styles.languageItemDark,
                currentLanguage === language.code && styles.selectedLanguageItem,
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <View style={styles.languageInfo}>
                <Globe size={24} color={Colors.primary[600]} />
                <View style={styles.languageText}>
                  <Text style={[styles.languageName, isDarkMode && styles.languageNameDark]}>{language.name}</Text>
                  <Text style={[styles.languageNative, isDarkMode && styles.languageNativeDark]}>
                    {language.nativeName}
                  </Text>
                </View>
              </View>
              {currentLanguage === language.code && <Check size={20} color={Colors.primary[600]} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoSection, isDarkMode && styles.infoSectionDark]}>
          <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>
            Changing the language will update all text throughout the app. Some features may require an app restart to
            fully apply the new language.
          </Text>
        </View>
      </View>
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
    padding: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  languageItemDark: {
    backgroundColor: Colors.neutral[700],
  },
  selectedLanguageItem: {
    backgroundColor: Colors.primary[50],
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageText: {
    marginLeft: Spacing.md,
  },
  languageName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
  },
  languageNameDark: {
    color: Colors.white,
  },
  languageNative: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  languageNativeDark: {
    color: Colors.neutral[400],
  },
  infoSection: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  infoSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.primary[700],
    lineHeight: 20,
  },
  infoTextDark: {
    color: Colors.neutral[300],
  },
})
