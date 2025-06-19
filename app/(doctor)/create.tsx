"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Modal,
  FlatList,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { Colors } from "../../constants/colors"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { useToast } from "react-native-toast-notifications"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Send,
  Save,
  Settings,
  Calendar,
  FileText,
  CheckSquare,
  Type,
  Hash,
  Upload,
} from "lucide-react-native"
import { useApiClient } from "../../utils/api"
import type {
  FormField,
  FormTemplateCreateRequest,
  FormSendRequest,
  PatientForForm,
  PaginatedResponse,
  FormTemplate,
  FormSendResponse,
} from "../../types/api"

interface FormFieldWithTempId extends FormField {
  tempId: string
}

const CreateFormScreen = () => {
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [fields, setFields] = useState<FormFieldWithTempId[]>([])
  const [showFieldTypeModal, setShowFieldTypeModal] = useState(false)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])
  const [patients, setPatients] = useState<PatientForForm[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const toast = useToast()
  const apiClient = useApiClient()

  const fieldTypes = [
    { type: "text", label: "Text Input", icon: Type },
    { type: "textarea", label: "Text Area", icon: FileText },
    { type: "number", label: "Number", icon: Hash },
    { type: "date", label: "Date", icon: Calendar },
    { type: "select", label: "Dropdown", icon: Settings },
    { type: "radio", label: "Radio Buttons", icon: CheckSquare },
    { type: "checkbox", label: "Checkboxes", icon: CheckSquare },
    { type: "file", label: "File Upload", icon: Upload },
  ]

  const fetchPatients = async () => {
    if (isLoadingPatients) return

    setIsLoadingPatients(true)
    try {
      const response = await apiClient.get<PaginatedResponse<PatientForForm>>(
        "/api/fhir/Patient",
        {
          _page: 1,
          _count: 50,
          active: true,
        },
        { ttl: 10 * 60 * 1000 }, // 10 minutes cache
      )

      if (response.success && response.data) {
        setPatients(response.data.data)
      } else {
        toast.show("Failed to load patients", { type: "danger" })
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast.show("Failed to load patients", { type: "danger" })
    } finally {
      setIsLoadingPatients(false)
    }
  }

  const addField = (type: string) => {
    const newField: FormFieldWithTempId = {
      tempId: Date.now().toString(),
      type: type as any,
      label: `New ${type} field`,
      required: false,
      placeholder: "",
      helpText: "",
      options: type === "select" || type === "radio" || type === "checkbox" ? ["Option 1"] : undefined,
    }
    setFields([...fields, newField])
    setShowFieldTypeModal(false)
  }

  const updateField = (tempId: string, updates: Partial<FormFieldWithTempId>) => {
    setFields(fields.map((field) => (field.tempId === tempId ? { ...field, ...updates } : field)))
  }

  const removeField = (tempId: string) => {
    setFields(fields.filter((field) => field.tempId !== tempId))
  }

  const addOption = (tempId: string) => {
    const field = fields.find((f) => f.tempId === tempId)
    if (field && field.options) {
      updateField(tempId, {
        options: [...field.options, `Option ${field.options.length + 1}`],
      })
    }
  }

  const updateOption = (tempId: string, optionIndex: number, value: string) => {
    const field = fields.find((f) => f.tempId === tempId)
    if (field && field.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = value
      updateField(tempId, { options: newOptions })
    }
  }

  const removeOption = (tempId: string, optionIndex: number) => {
    const field = fields.find((f) => f.tempId === tempId)
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex)
      updateField(tempId, { options: newOptions })
    }
  }

  const validateForm = (): boolean => {
    if (!formTitle.trim()) {
      toast.show("Form title is required", { type: "danger" })
      return false
    }
    if (!formDescription.trim()) {
      toast.show("Form description is required", { type: "danger" })
      return false
    }
    if (fields.length === 0) {
      toast.show("At least one field is required", { type: "danger" })
      return false
    }
    for (const field of fields) {
      if (!field.label.trim()) {
        toast.show("All fields must have labels", { type: "danger" })
        return false
      }
    }
    return true
  }

  const saveAsDraft = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const formData: FormTemplateCreateRequest = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        status: "draft",
        fields: fields.map(({ tempId, ...field }) => field),
        version: "1.0",
      }

      const response = await apiClient.post<FormTemplate>("/api/fhir/forms/templates", formData)

      if (response.success) {
        toast.show("Form saved as draft", { type: "success" })
        router.back()
      } else {
        toast.show(response.message || "Failed to save form", { type: "danger" })
      }
    } catch (error) {
      console.error("Error saving form:", error)
      toast.show("Failed to save form", { type: "danger" })
    } finally {
      setIsSaving(false)
    }
  }

  const publishForm = async () => {
    if (!validateForm()) return

    setIsPublishing(true)
    try {
      const formData: FormTemplateCreateRequest = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        status: "active",
        fields: fields.map(({ tempId, ...field }) => field),
        version: "1.0",
      }

      const response = await apiClient.post<FormTemplate>("/api/fhir/forms/templates", formData)

      if (response.success) {
        toast.show("Form published successfully", { type: "success" })
        router.back()
      } else {
        toast.show(response.message || "Failed to publish form", { type: "danger" })
      }
    } catch (error) {
      console.error("Error publishing form:", error)
      toast.show("Failed to publish form", { type: "danger" })
    } finally {
      setIsPublishing(false)
    }
  }

  const sendToPatients = async () => {
    if (!validateForm()) return
    if (selectedPatients.length === 0) {
      toast.show("Please select at least one patient", { type: "danger" })
      return
    }

    setIsSending(true)
    try {
      // First publish the form
      const formData: FormTemplateCreateRequest = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        status: "active",
        fields: fields.map(({ tempId, ...field }) => field),
        version: "1.0",
      }

      const publishResponse = await apiClient.post<FormTemplate>("/api/fhir/forms/templates", formData)

      if (publishResponse.success && publishResponse.data) {
        // Then send to patients
        const sendData: FormSendRequest = {
          formId: publishResponse.data.id,
          patientIds: selectedPatients,
          message: `New form: ${formTitle}`,
          priority: "medium",
        }

        const sendResponse = await apiClient.post<FormSendResponse>("/api/fhir/forms/send", sendData)

        if (sendResponse.success && sendResponse.data) {
          toast.show(`Form sent to ${sendResponse.data.sentCount} patients`, { type: "success" })
          setShowPatientModal(false)
          router.back()
        } else {
          toast.show(sendResponse.message || "Failed to send form", { type: "danger" })
        }
      } else {
        toast.show(publishResponse.message || "Failed to publish form", { type: "danger" })
      }
    } catch (error) {
      console.error("Error sending form:", error)
      toast.show("Failed to send form", { type: "danger" })
    } finally {
      setIsSending(false)
    }
  }

  const openPatientModal = () => {
    fetchPatients()
    setShowPatientModal(true)
  }

  const showPreview = () => {
    if (!validateForm()) return
    setShowPreviewModal(true)
  }

  const renderFieldEditor = ({ item }: { item: FormFieldWithTempId }) => {
    const IconComponent = fieldTypes.find((ft) => ft.type === item.type)?.icon || Type

    return (
      <View style={styles.fieldEditor}>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTypeIndicator}>
            <IconComponent size={16} color={Colors.primary[600]} />
            <Text style={styles.fieldType}>{item.type}</Text>
          </View>
          <TouchableOpacity onPress={() => removeField(item.tempId)} style={styles.removeFieldButton}>
            <Trash2 size={16} color={Colors.error[500]} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.fieldInput}
          placeholder="Field Label"
          value={item.label}
          onChangeText={(text) => updateField(item.tempId, { label: text })}
        />

        <TextInput
          style={styles.fieldInput}
          placeholder="Placeholder text (optional)"
          value={item.placeholder || ""}
          onChangeText={(text) => updateField(item.tempId, { placeholder: text })}
        />

        <TextInput
          style={styles.fieldInput}
          placeholder="Help text (optional)"
          value={item.helpText || ""}
          onChangeText={(text) => updateField(item.tempId, { helpText: text })}
        />

        <View style={styles.fieldOptions}>
          <View style={styles.requiredToggle}>
            <Text style={styles.toggleLabel}>Required</Text>
            <Switch
              value={item.required}
              onValueChange={(value) => updateField(item.tempId, { required: value })}
              trackColor={{ false: Colors.secondary[300], true: Colors.primary[500] }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {(item.type === "select" || item.type === "radio" || item.type === "checkbox") && (
          <View style={styles.optionsSection}>
            <Text style={styles.optionsTitle}>Options:</Text>
            {item.options?.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <TextInput
                  style={[styles.fieldInput, { flex: 1 }]}
                  value={option}
                  onChangeText={(text) => updateOption(item.tempId, index, text)}
                  placeholder={`Option ${index + 1}`}
                />
                {item.options && item.options.length > 1 && (
                  <TouchableOpacity onPress={() => removeOption(item.tempId, index)} style={styles.removeOptionButton}>
                    <Trash2 size={14} color={Colors.error[500]} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={() => addOption(item.tempId)} style={styles.addOptionButton}>
              <Plus size={16} color={Colors.primary[600]} />
              <Text style={styles.addOptionText}>Add Option</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  const renderPatientItem = ({ item }: { item: PatientForForm }) => (
    <TouchableOpacity
      style={[styles.patientItem, selectedPatients.includes(item.id) && styles.selectedPatientItem]}
      onPress={() => {
        if (selectedPatients.includes(item.id)) {
          setSelectedPatients(selectedPatients.filter((id) => id !== item.id))
        } else {
          setSelectedPatients([...selectedPatients, item.id])
        }
      }}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientEmail}>{item.email}</Text>
      </View>
      {selectedPatients.includes(item.id) && (
        <View style={styles.selectedIndicator}>
          <CheckSquare size={20} color={Colors.primary[600]} />
        </View>
      )}
    </TouchableOpacity>
  )

  const renderPreviewField = ({ item }: { item: FormFieldWithTempId }) => (
    <View style={styles.previewField}>
      <Text style={styles.previewFieldLabel}>
        {item.label}
        {item.required && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>
      {item.helpText && <Text style={styles.previewFieldHelp}>{item.helpText}</Text>}

      {item.type === "text" && (
        <TextInput style={styles.previewInput} placeholder={item.placeholder} editable={false} />
      )}

      {item.type === "textarea" && (
        <TextInput
          style={[styles.previewInput, styles.previewTextArea]}
          placeholder={item.placeholder}
          multiline
          editable={false}
        />
      )}

      {item.type === "select" && (
        <View style={styles.previewSelect}>
          <Text style={styles.previewSelectText}>{item.placeholder || "Select an option..."}</Text>
        </View>
      )}

      {(item.type === "radio" || item.type === "checkbox") && (
        <View style={styles.previewOptions}>
          {item.options?.map((option, index) => (
            <View key={index} style={styles.previewOption}>
              <View style={[styles.previewOptionIndicator, item.type === "radio" && styles.previewRadio]} />
              <Text style={styles.previewOptionText}>{option}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary[600]} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Form</Text>
        <TouchableOpacity onPress={showPreview} style={styles.previewButton}>
          <Eye size={20} color={Colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formBasics}>
          <Text style={styles.sectionTitle}>Form Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Form Title"
            value={formTitle}
            onChangeText={setFormTitle}
            maxLength={100}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Form Description"
            value={formDescription}
            onChangeText={setFormDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <TextInput
            style={styles.input}
            placeholder="Category (optional)"
            value={formCategory}
            onChangeText={setFormCategory}
            maxLength={50}
          />
        </View>

        <View style={styles.fieldsSection}>
          <View style={styles.fieldsSectionHeader}>
            <Text style={styles.sectionTitle}>Form Fields</Text>
            <TouchableOpacity onPress={() => setShowFieldTypeModal(true)} style={styles.addFieldButton}>
              <Plus size={16} color={Colors.white} />
              <Text style={styles.addFieldText}>Add Field</Text>
            </TouchableOpacity>
          </View>

          {fields.length === 0 ? (
            <View style={styles.emptyFields}>
              <Text style={styles.emptyFieldsText}>No fields added yet</Text>
              <Text style={styles.emptyFieldsSubtext}>Tap "Add Field" to get started</Text>
            </View>
          ) : (
            <FlatList
              data={fields}
              renderItem={renderFieldEditor}
              keyExtractor={(item) => item.tempId}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity onPress={saveAsDraft} style={[styles.actionButton, styles.draftButton]} disabled={isSaving}>
          <Save size={16} color={Colors.secondary[600]} />
          <Text style={styles.draftButtonText}>{isSaving ? "Saving..." : "Save Draft"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={publishForm}
          style={[styles.actionButton, styles.publishButton]}
          disabled={isPublishing}
        >
          <FileText size={16} color={Colors.white} />
          <Text style={styles.publishButtonText}>{isPublishing ? "Publishing..." : "Publish"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={openPatientModal} style={[styles.actionButton, styles.sendButton]}>
          <Send size={16} color={Colors.white} />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Field Type Selection Modal */}
      <Modal visible={showFieldTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Field Type</Text>
            <FlatList
              data={fieldTypes}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.fieldTypeItem} onPress={() => addField(item.type)}>
                  <item.icon size={20} color={Colors.primary[600]} />
                  <Text style={styles.fieldTypeLabel}>{item.label}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.type}
            />
            <TouchableOpacity onPress={() => setShowFieldTypeModal(false)} style={styles.modalCancelButton}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Patient Selection Modal */}
      <Modal visible={showPatientModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send to Patients</Text>
            <Text style={styles.modalSubtitle}>Select patients to send this form to:</Text>

            {isLoadingPatients ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading patients...</Text>
              </View>
            ) : (
              <FlatList
                data={patients}
                renderItem={renderPatientItem}
                keyExtractor={(item) => item.id}
                style={styles.patientList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No patients found</Text>
                  </View>
                }
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowPatientModal(false)} style={styles.modalCancelButton}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={sendToPatients}
                style={[styles.modalSendButton, selectedPatients.length === 0 && styles.disabledButton]}
                disabled={selectedPatients.length === 0 || isSending}
              >
                <Text style={styles.modalSendText}>
                  {isSending ? "Sending..." : `Send (${selectedPatients.length})`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Form Preview Modal */}
      <Modal visible={showPreviewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.previewModal]}>
            <View style={styles.previewHeader}>
              <Text style={styles.modalTitle}>Form Preview</Text>
              <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                <Text style={styles.previewCloseText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.previewContent}>
              <Text style={styles.previewTitle}>{formTitle || "Untitled Form"}</Text>
              <Text style={styles.previewDescription}>{formDescription || "No description"}</Text>

              <FlatList
                data={fields}
                renderItem={renderPreviewField}
                keyExtractor={(item) => item.tempId}
                scrollEnabled={false}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Keep existing styles and add new ones for preview
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[200],
  } as ViewStyle,
  backButton: {
    padding: 5,
  } as ViewStyle,
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary[600],
  } as TextStyle,
  previewButton: {
    padding: 5,
  } as ViewStyle,
  content: {
    flex: 1,
    paddingHorizontal: 20,
  } as ViewStyle,
  formBasics: {
    paddingVertical: 20,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary[600],
    marginBottom: 15,
  } as TextStyle,
  input: {
    borderWidth: 1,
    borderColor: Colors.secondary[300],
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: Colors.white,
  } as TextStyle,
  textArea: {
    height: 80,
    textAlignVertical: "top",
  } as TextStyle,
  fieldsSection: {
    paddingBottom: 20,
  } as ViewStyle,
  fieldsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  } as ViewStyle,
  addFieldButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  } as ViewStyle,
  addFieldText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 5,
  } as TextStyle,
  emptyFields: {
    alignItems: "center",
    paddingVertical: 40,
  } as ViewStyle,
  emptyFieldsText: {
    fontSize: 16,
    color: Colors.secondary[500],
    marginBottom: 5,
  } as TextStyle,
  emptyFieldsSubtext: {
    fontSize: 14,
    color: Colors.secondary[400],
  } as TextStyle,
  fieldEditor: {
    backgroundColor: Colors.secondary[50],
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.secondary[200],
  } as ViewStyle,
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  } as ViewStyle,
  fieldTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  fieldType: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: "600",
    marginLeft: 5,
    textTransform: "uppercase",
  } as TextStyle,
  removeFieldButton: {
    padding: 5,
  } as ViewStyle,
  fieldInput: {
    borderWidth: 1,
    borderColor: Colors.secondary[300],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: Colors.white,
  } as TextStyle,
  fieldOptions: {
    marginTop: 5,
  } as ViewStyle,
  requiredToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,
  toggleLabel: {
    fontSize: 14,
    color: Colors.secondary[600],
    fontWeight: "500",
  } as TextStyle,
  optionsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.secondary[200],
  } as ViewStyle,
  optionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary[600],
    marginBottom: 10,
  } as TextStyle,
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  removeOptionButton: {
    padding: 8,
    marginLeft: 8,
  } as ViewStyle,
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  } as ViewStyle,
  addOptionText: {
    color: Colors.primary[600],
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  } as TextStyle,
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.secondary[200],
    backgroundColor: Colors.white,
  } as ViewStyle,
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  } as ViewStyle,
  draftButton: {
    backgroundColor: Colors.secondary[100],
    borderWidth: 1,
    borderColor: Colors.secondary[300],
  } as ViewStyle,
  publishButton: {
    backgroundColor: Colors.primary[500],
  } as ViewStyle,
  sendButton: {
    backgroundColor: Colors.success[500],
  } as ViewStyle,
  draftButtonText: {
    color: Colors.secondary[600],
    fontWeight: "600",
    marginLeft: 5,
  } as TextStyle,
  publishButtonText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 5,
  } as TextStyle,
  sendButtonText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 5,
  } as TextStyle,
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  } as ViewStyle,
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary[600],
    marginBottom: 15,
    textAlign: "center",
  } as TextStyle,
  modalSubtitle: {
    fontSize: 14,
    color: Colors.secondary[600],
    marginBottom: 15,
    textAlign: "center",
  } as TextStyle,
  fieldTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[200],
  } as ViewStyle,
  fieldTypeLabel: {
    fontSize: 16,
    color: Colors.secondary[700],
    marginLeft: 10,
  } as TextStyle,
  patientList: {
    maxHeight: 300,
  } as ViewStyle,
  patientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[200],
  } as ViewStyle,
  selectedPatientItem: {
    backgroundColor: Colors.primary[50],
  } as ViewStyle,
  patientInfo: {
    flex: 1,
  } as ViewStyle,
  patientName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.secondary[700],
  } as TextStyle,
  patientEmail: {
    fontSize: 14,
    color: Colors.secondary[500],
    marginTop: 2,
  } as TextStyle,
  selectedIndicator: {
    marginLeft: 10,
  } as ViewStyle,
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  } as ViewStyle,
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.secondary[300],
    borderRadius: 8,
  } as ViewStyle,
  modalSendButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: Colors.success[500],
    borderRadius: 8,
    marginLeft: 10,
  } as ViewStyle,
  disabledButton: {
    backgroundColor: Colors.secondary[300],
  } as ViewStyle,
  modalCancelText: {
    color: Colors.secondary[600],
    fontWeight: "600",
  } as TextStyle,
  modalSendText: {
    color: Colors.white,
    fontWeight: "600",
  } as TextStyle,
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  } as ViewStyle,
  loadingText: {
    fontSize: 16,
    color: Colors.secondary[600],
  } as TextStyle,
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  } as ViewStyle,
  emptyText: {
    fontSize: 16,
    color: Colors.secondary[600],
  } as TextStyle,
  // Preview Modal Styles
  previewModal: {
    width: "95%",
    maxHeight: "90%",
  } as ViewStyle,
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  } as ViewStyle,
  previewCloseText: {
    color: Colors.primary[600],
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,
  previewContent: {
    flex: 1,
  } as ViewStyle,
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary[600],
    marginBottom: 8,
  } as TextStyle,
  previewDescription: {
    fontSize: 14,
    color: Colors.secondary[600],
    marginBottom: 20,
  } as TextStyle,
  previewField: {
    marginBottom: 20,
  } as ViewStyle,
  previewFieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary[700],
    marginBottom: 5,
  } as TextStyle,
  requiredAsterisk: {
    color: Colors.error[500],
  } as TextStyle,
  previewFieldHelp: {
    fontSize: 12,
    color: Colors.secondary[500],
    marginBottom: 8,
  } as TextStyle,
  previewInput: {
    borderWidth: 1,
    borderColor: Colors.secondary[300],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: Colors.secondary[50],
  } as TextStyle,
  previewTextArea: {
    height: 80,
    textAlignVertical: "top",
  } as TextStyle,
  previewSelect: {
    borderWidth: 1,
    borderColor: Colors.secondary[300],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.secondary[50],
  } as ViewStyle,
  previewSelectText: {
    fontSize: 14,
    color: Colors.secondary[500],
  } as TextStyle,
  previewOptions: {
    marginTop: 5,
  } as ViewStyle,
  previewOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  previewOptionIndicator: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: Colors.secondary[400],
    marginRight: 10,
  } as ViewStyle,
  previewRadio: {
    borderRadius: 8,
  } as ViewStyle,
  previewOptionText: {
    fontSize: 14,
    color: Colors.secondary[700],
  } as TextStyle,
})

export default CreateFormScreen
