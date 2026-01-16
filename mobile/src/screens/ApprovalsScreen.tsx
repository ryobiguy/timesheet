import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { timeEntryService, type TimeEntry } from '../services/timeEntryService'

export function ApprovalsScreen() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'SUPERVISOR')) {
      loadApprovals()
    }
  }, [user])

  const loadApprovals = async () => {
    try {
      setIsLoading(true)
      const data = await timeEntryService.getPendingApprovals()
      setEntries(data)
    } catch (error: any) {
      console.error('Failed to load approvals:', error)
      Alert.alert('Error', error?.message || 'Failed to load pending approvals')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleApprove = async (entry: TimeEntry) => {
    Alert.alert(
      'Approve Entry',
      `Approve time entry for ${entry.worker?.name || 'Unknown'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setProcessingId(entry.id)
              await timeEntryService.approveTimeEntry(entry.id)
              Alert.alert('Success', 'Time entry approved')
              await loadApprovals()
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to approve entry')
            } finally {
              setProcessingId(null)
            }
          },
        },
      ]
    )
  }

  const handleReject = async (entry: TimeEntry) => {
    Alert.alert(
      'Dispute Entry',
      `Mark this entry as disputed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dispute',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(entry.id)
              await timeEntryService.rejectTimeEntry(entry.id)
              Alert.alert('Success', 'Time entry marked as disputed')
              await loadApprovals()
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to dispute entry')
            } finally {
              setProcessingId(null)
            }
          },
        },
      ]
    )
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Access denied. Admin or Supervisor role required.</Text>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading approvals...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={loadApprovals} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Timesheet Approvals</Text>
          <Text style={styles.subtitle}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} pending
          </Text>
        </View>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending approvals</Text>
          <Text style={styles.emptySubtext}>All time entries have been reviewed</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>
                    {entry.worker?.name || 'Unknown Worker'}
                  </Text>
                  <Text style={styles.jobsiteName}>
                    {entry.jobsite?.name || 'Unknown Jobsite'}
                  </Text>
                  <Text style={styles.jobsiteAddress}>
                    {entry.jobsite?.address || ''}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDate(entry.startAt)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(entry.startAt)} - {entry.endAt ? formatTime(entry.endAt) : 'Ongoing'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{formatDuration(entry.durationMinutes)}</Text>
                </View>
              </View>

              {entry.disputes && entry.disputes.length > 0 && (
                <View style={styles.disputeBadge}>
                  <Text style={styles.disputeText}>
                    {entry.disputes.length} {entry.disputes.length === 1 ? 'dispute' : 'disputes'}
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.approveButton, processingId === entry.id && styles.buttonDisabled]}
                  onPress={() => handleApprove(entry)}
                  disabled={processingId === entry.id}
                >
                  {processingId === entry.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.approveButtonText}>Approve</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectButton, processingId === entry.id && styles.buttonDisabled]}
                  onPress={() => handleReject(entry)}
                  disabled={processingId === entry.id}
                >
                  <Text style={styles.rejectButtonText}>Dispute</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  workerInfo: {
    marginBottom: 8,
  },
  workerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  jobsiteName: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 2,
  },
  jobsiteAddress: {
    fontSize: 14,
    color: '#94a3b8',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  disputeBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  disputeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
