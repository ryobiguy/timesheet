import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'
import { GeofenceTracker } from '../services/geofenceService'
import { jobsiteService, type Assignment } from '../services/jobsiteService'
import { timeEntryService, type TimeEntry } from '../services/timeEntryService'

export function HomeScreen() {
  const { user, logout } = useAuth()
  const navigation = useNavigation()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTracking, setIsTracking] = useState(false)
  const [tracker, setTracker] = useState<GeofenceTracker | null>(null)
  const canApprove = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR'

  useEffect(() => {
    if (user) {
      loadData()
    }
    return () => {
      if (tracker) {
        tracker.stopTracking()
      }
    }
  }, [user?.id])

  const loadData = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const [assignmentsData, activeEntryData] = await Promise.all([
        jobsiteService.getAssignments(user.id),
        timeEntryService.getActiveTimeEntry(user.id),
      ])
      setAssignments(assignmentsData)
      setActiveEntry(activeEntryData)

      // Initialize tracker
      const newTracker = new GeofenceTracker(user.id)
      newTracker.setJobsites(assignmentsData.map((a) => a.jobsite))
      newTracker.setOnEventCallback((event) => {
        Alert.alert(
          event.type === 'ENTER' ? 'Clocked In' : 'Clocked Out',
          `Jobsite: ${assignmentsData.find((a) => a.jobsiteId === event.jobsiteId)?.jobsite.name || 'Unknown'}`
        )
        // Reload active entry
        timeEntryService.getActiveTimeEntry(user.id).then(setActiveEntry).catch(console.error)
      })
      setTracker(newTracker)
    } catch (error: any) {
      console.error('Load data error:', error)
      Alert.alert('Error', error?.response?.data?.message || error.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTracking = async () => {
    if (!tracker) return

    try {
      if (isTracking) {
        tracker.stopTracking()
        setIsTracking(false)
        Alert.alert('Tracking Stopped', 'GPS tracking has been stopped')
      } else {
        await tracker.startTracking()
        setIsTracking(true)
        Alert.alert('Tracking Started', 'GPS tracking is now active')
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start tracking')
    }
  }

  const handleLogout = async () => {
    if (tracker) {
      tracker.stopTracking()
    }
    await logout()
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, isTracking === true && styles.statusActive]} />
          <Text style={styles.statusText}>
            {isTracking === true ? 'GPS Tracking Active' : 'GPS Tracking Inactive'}
          </Text>
        </View>
        {activeEntry && (
          <View style={styles.activeEntry}>
            <Text style={styles.activeEntryText}>
              Clocked in at: {new Date(activeEntry.startAt).toLocaleTimeString()}
            </Text>
            <Text style={styles.activeEntryJobsite}>
              {activeEntry.jobsite?.name || 'Unknown jobsite'}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.trackButton, isTracking === true && styles.trackButtonActive]}
          onPress={toggleTracking}
        >
          <Text style={styles.trackButtonText}>
            {isTracking === true ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Approvals Card (Admin/Supervisor only) */}
      {canApprove && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Approvals</Text>
          <TouchableOpacity
            style={styles.approvalsButton}
            onPress={() => navigation.navigate('Approvals' as never)}
          >
            <Text style={styles.approvalsButtonText}>Review Pending Approvals</Text>
            <Text style={styles.approvalsButtonSubtext}>Approve or dispute time entries</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Assigned Jobsites */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Jobsites ({assignments.length})</Text>
        {assignments.length === 0 ? (
          <Text style={styles.emptyText}>No jobsites assigned</Text>
        ) : (
          assignments.map((assignment) => (
            <View key={assignment.id} style={styles.jobsiteItem}>
              <View style={styles.jobsiteInfo}>
                <Text style={styles.jobsiteName}>{assignment.jobsite.name}</Text>
                <Text style={styles.jobsiteAddress}>{assignment.jobsite.address}</Text>
                <Text style={styles.jobsiteRadius}>
                  Radius: {assignment.jobsite.radiusMeters}m
                </Text>
              </View>
              {tracker?.isInsideGeofence(assignment.jobsite.id) && (
                <View style={styles.insideBadge}>
                  <Text style={styles.insideBadgeText}>Inside</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#cbd5e1',
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 16,
    color: '#475569',
  },
  activeEntry: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  activeEntryText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  activeEntryJobsite: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  trackButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButtonActive: {
    backgroundColor: '#ef4444',
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  jobsiteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
  },
  jobsiteInfo: {
    flex: 1,
  },
  jobsiteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  jobsiteAddress: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  jobsiteRadius: {
    fontSize: 12,
    color: '#94a3b8',
  },
  insideBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  insideBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
  },
  approvalsButton: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  approvalsButtonText: {
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  approvalsButtonSubtext: {
    color: '#64748b',
    fontSize: 12,
  },
})
