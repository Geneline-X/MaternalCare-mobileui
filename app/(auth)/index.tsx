"use client"
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { Heart, Shield, Users } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

export default function AuthIndex() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          }}
          style={styles.heroImage}
        />
        <View style={styles.overlay}>
          <Heart size={48} color={Colors.white} />
          <Text style={styles.title}>MaternalCare</Text>
          <Text style={styles.subtitle}>Comprehensive maternal health management</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.features}>
          <View style={styles.feature}>
            <Shield size={24} color={Colors.primary[500]} />
            <Text style={styles.featureText}>Secure & Private</Text>
          </View>
          <View style={styles.feature}>
            <Users size={24} color={Colors.success[500]} />
            <Text style={styles.featureText}>Expert Care Team</Text>
          </View>
          <View style={styles.feature}>
            <Heart size={24} color={Colors.secondary[500]} />
            <Text style={styles.featureText}>Personalized Care</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("./sign-in")}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("./sign-up")}>
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: "50%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.white,
    textAlign: "center",
    marginTop: Spacing.sm,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    justifyContent: "space-between",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: Spacing.xl,
  },
  feature: {
    alignItems: "center",
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  actions: {
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[700],
  },
})
