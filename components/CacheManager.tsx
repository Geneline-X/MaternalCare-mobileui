"use client"

import React from "react"
import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { CacheManager } from "../utils/cacheManager"
import { Colors } from "../constants/colors"
import { Spacing, BorderRadius } from "../constants/spacing"

interface CacheInfo {
  totalKeys: number
  estimatedSize: string
}

export const CacheManagerComponent: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({ totalKeys: 0, estimatedSize: "0 KB" })
  const [loading, setLoading] = useState(false)

  const loadCacheInfo = async () => {
    const info = await CacheManager.getCacheInfo()
    setCacheInfo(info)
  }

  useEffect(() => {
    loadCacheInfo()
  }, [])

  const handleClearExpired = async () => {
    setLoading(true)
    try {
      await CacheManager.clearExpired()
      await loadCacheInfo()
      Alert.alert("Success", "Expired cache entries cleared successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to clear expired cache")
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    Alert.alert("Clear All Cache", "This will clear all cached data. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          setLoading(true)
          try {
            await CacheManager.clearAll()
            await loadCacheInfo()
            Alert.alert("Success", "All cache cleared successfully")
          } catch (error) {
            Alert.alert("Error", "Failed to clear cache")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cache Management</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Total cached items: {cacheInfo.totalKeys}</Text>
        <Text style={styles.infoText}>Estimated size: {cacheInfo.estimatedSize}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleClearExpired} disabled={loading}>
          <Text style={styles.buttonText}>Clear Expired</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearAll} disabled={loading}>
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadCacheInfo}>
        <Text style={styles.refreshText}>Refresh Info</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  infoContainer: {
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
  },
  dangerButton: {
    backgroundColor: Colors.error[500],
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "600",
  },
  refreshButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  refreshText: {
    color: Colors.primary[600],
    fontSize: 14,
  },
})
