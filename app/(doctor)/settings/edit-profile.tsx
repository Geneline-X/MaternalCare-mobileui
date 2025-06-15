"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { useUser } from "@clerk/clerk-expo"
import { ArrowLeft, Camera, Save, User } from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"
import * as ImagePicker from "expo-image-picker"

export default function EditProfile() {
  const router = useRouter()
  const { user } = useUser()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: user?.phoneNumbers?.[0]?.phoneNumber || "",
    specialty: "Maternal Health Specialist",
    license: "MD12345",
    experience: "12 years",
    bio: "Dedicated maternal health specialist with over 12 years of experience in providing comprehensive care to expectant mothers.",
  })

  const [profileImage, setProfileImage] = useState(user?.imageUrl || null)
  const [isLoading, setIsLoading] = useState(false)

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert(t("common.permission"), t("editProfile.cameraPermission"))
      return
    }

    Alert.alert(t("editProfile.selectPhoto"), t("editProfile.selectPhotoDesc"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("editProfile.camera"), onPress: openCamera },
      { text: t("editProfile.gallery"), onPress: openGallery },
    ])
  }

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()

    if (status !== "granted") {
      Alert.alert(t("common.permission"), t("editProfile.cameraPermission"))
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      Alert.alert(t("common.error"), t("editProfile.fillRequired"))
      return
    }

    setIsLoading(true)

    try {
      // Update user profile using Clerk
      await user?.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      // In a real app, you would also update the profile image and other fields
      // via your backend API

      Alert.alert(t("common.success"), t("editProfile.profileUpdated"), [
        { text: t("common.ok"), onPress: () => router.back() },
      ])
    } catch (error) {
      Alert.alert(t("common.error"), t("editProfile.updateFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  const FormField = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    keyboardType = "default" as any,
    required = false,
  }: {
    label: string
    value: string
    onChangeText: (text: string) => void
    placeholder: string
    multiline?: boolean
    keyboardType?: any
    required?: boolean
  }) => (
    <View style={styles.formField}>
      <Text style={[styles.fieldLabel, isDarkMode && styles.fieldLabelDark]}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.fieldInput, isDarkMode && styles.fieldInputDark, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? Colors.neutral[500] : Colors.neutral[400]}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
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
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>{t("editProfile.title")}</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Save size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={[styles.photoSection, isDarkMode && styles.photoSectionDark]}>
          <TouchableOpacity style={styles.photoContainer} onPress={handleImagePicker}>
            <View style={[styles.photoWrapper, isDarkMode && styles.photoWrapperDark]}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profilePhoto} />
              ) : (
                <User size={40} color={Colors.primary[600]} />
              )}
            </View>
            <View style={styles.cameraOverlay}>
              <Camera size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.photoText, isDarkMode && styles.photoTextDark]}>{t("editProfile.tapToChange")}</Text>
        </View>

        {/* Form Fields */}
        <View style={[styles.formSection, isDarkMode && styles.formSectionDark]}>
          <FormField
            label={t("editProfile.firstName")}
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            placeholder={t("editProfile.firstNamePlaceholder")}
            required
          />

          <FormField
            label={t("editProfile.lastName")}
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            placeholder={t("editProfile.lastNamePlaceholder")}
            required
          />

          <FormField
            label={t("editProfile.email")}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder={t("editProfile.emailPlaceholder")}
            keyboardType="email-address"
            required
          />

          <FormField
            label={t("editProfile.phone")}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder={t("editProfile.phonePlaceholder")}
            keyboardType="phone-pad"
          />

          <FormField
            label={t("editProfile.specialty")}
            value={formData.specialty}
            onChangeText={(text) => setFormData({ ...formData, specialty: text })}
            placeholder={t("editProfile.specialtyPlaceholder")}
          />

          <FormField
            label={t("editProfile.license")}
            value={formData.license}
            onChangeText={(text) => setFormData({ ...formData, license: text })}
            placeholder={t("editProfile.licensePlaceholder")}
          />

          <FormField
            label={t("editProfile.experience")}
            value={formData.experience}
            onChangeText={(text) => setFormData({ ...formData, experience: text })}
            placeholder={t("editProfile.experiencePlaceholder")}
          />

          <FormField
            label={t("editProfile.bio")}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder={t("editProfile.bioPlaceholder")}
            multiline
          />
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
  saveButton: {
    backgroundColor: Colors.primary[600],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    backgroundColor: Colors.white,
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  photoSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  photoContainer: {
    position: "relative",
    marginBottom: Spacing.sm,
  },
  photoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: Colors.primary[200],
  },
  photoWrapperDark: {
    backgroundColor: Colors.neutral[700],
    borderColor: Colors.neutral[600],
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  photoText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  photoTextDark: {
    color: Colors.neutral[400],
  },
  formSection: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  formSectionDark: {
    backgroundColor: Colors.neutral[800],
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
  required: {
    color: Colors.error[500],
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
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
})
