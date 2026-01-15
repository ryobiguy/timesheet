import { api } from '../config/api'
import * as Location from 'expo-location'
import { Jobsite } from './jobsiteService'

export interface GeofenceEvent {
  workerId: string
  jobsiteId: string
  type: 'ENTER' | 'EXIT'
  timestamp: string
  accuracy?: number
  source: string
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export class GeofenceTracker {
  private jobsites: Jobsite[] = []
  private workerId: string
  private isTracking: boolean = false
  private watchSubscription: Location.LocationSubscription | null = null
  private currentLocation: Location.LocationObject | null = null
  private insideGeofences: Set<string> = new Set() // Track which jobsites we're inside
  private onEventCallback?: (event: GeofenceEvent) => void

  constructor(workerId: string) {
    this.workerId = workerId
  }

  setJobsites(jobsites: Jobsite[]) {
    this.jobsites = jobsites
  }

  setOnEventCallback(callback: (event: GeofenceEvent) => void) {
    this.onEventCallback = callback
  }

  async startTracking() {
    if (this.isTracking) return

    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      throw new Error('Location permission not granted')
    }

    // Request background location permissions for continuous tracking
    const backgroundStatus = await Location.requestBackgroundPermissionsAsync()
    if (backgroundStatus.status !== 'granted') {
      console.warn('Background location permission not granted - tracking may be limited')
    }

    this.isTracking = true

    // Start watching location
    this.watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // Check every 10 seconds
        distanceInterval: 10, // Or every 10 meters
      },
      (location) => {
        this.handleLocationUpdate(location)
      }
    )
  }

  stopTracking() {
    if (this.watchSubscription) {
      this.watchSubscription.remove()
      this.watchSubscription = null
    }
    this.isTracking = false
  }

  private handleLocationUpdate(location: Location.LocationObject) {
    this.currentLocation = location
    const { latitude, longitude, accuracy } = location.coords

    // Check each jobsite geofence
    for (const jobsite of this.jobsites) {
      const distance = calculateDistance(
        latitude,
        longitude,
        jobsite.latitude,
        jobsite.longitude
      )

      const isInside = distance <= jobsite.radiusMeters
      const wasInside = this.insideGeofences.has(jobsite.id)

      if (isInside && !wasInside) {
        // Entered geofence
        this.insideGeofences.add(jobsite.id)
        this.triggerEvent({
          workerId: this.workerId,
          jobsiteId: jobsite.id,
          type: 'ENTER',
          timestamp: new Date().toISOString(),
          accuracy: accuracy || undefined,
          source: 'device',
        })
      } else if (!isInside && wasInside) {
        // Exited geofence
        this.insideGeofences.delete(jobsite.id)
        this.triggerEvent({
          workerId: this.workerId,
          jobsiteId: jobsite.id,
          type: 'EXIT',
          timestamp: new Date().toISOString(),
          accuracy: accuracy || undefined,
          source: 'device',
        })
      }
    }
  }

  private async triggerEvent(event: GeofenceEvent) {
    try {
      // Send to backend
      await api.post('/api/geofence-events', event)
      
      // Call callback if set
      if (this.onEventCallback) {
        this.onEventCallback(event)
      }
    } catch (error) {
      console.error('Failed to send geofence event:', error)
      // TODO: Queue for retry
    }
  }

  getCurrentLocation(): Location.LocationObject | null {
    return this.currentLocation
  }

  isInsideGeofence(jobsiteId: string): boolean {
    return this.insideGeofences.has(jobsiteId)
  }
}
