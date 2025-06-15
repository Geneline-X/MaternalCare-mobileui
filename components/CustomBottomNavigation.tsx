"use client"
import { View, TouchableOpacity, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, usePathname } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Colors } from "../constants/colors"
import { Spacing } from "../constants/spacing"

type IconName = keyof typeof Ionicons.glyphMap

interface NavItem {
  key: string
  label: string
  icon: IconName
  activeIcon: IconName
  route: string
}

const navItems: NavItem[] = [
  {
    key: "home",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
    route: "/(doctor)/dashboard",
  },
  {
    key: "forms",
    label: "Forms",
    icon: "document-text-outline",
    activeIcon: "document-text",
    route: "/(doctor)/dynamic-form",
  },
  {
    key: "chat",
    label: "Chat",
    icon: "chatbubble-outline",
    activeIcon: "chatbubble",
    route: "/(doctor)/chat",
  },
  {
    key: "health",
    label: "Health",
    icon: "heart-outline",
    activeIcon: "heart",
    route: "/(doctor)/health-monitoring",
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: "analytics-outline",
    activeIcon: "analytics",
    route: "/(doctor)/report-analytics",
  },
]

export default function CustomBottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()

  const isActive = (route: string) => {
    return pathname === route || pathname.includes(route.split("/").pop() || "")
  }

  const handleNavPress = (route: string) => {
    router.push(route as any)
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const active = isActive(item.route)
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => handleNavPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
                <Ionicons
                  name={active ? item.activeIcon : item.icon}
                  size={24}
                  color={active ? Colors.primary[600] : Colors.neutral[500]}
                />
              </View>
              <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navBar: {
    flexDirection: "row",
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  activeIconContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[500],
    textAlign: "center",
  },
  activeLabel: {
    color: Colors.primary[600],
    fontFamily: "Inter-SemiBold",
  },
})
