import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface JobsiteMapProps {
  latitude: number | null
  longitude: number | null
  radiusMeters: number
  onLocationChange: (lat: number, lng: number) => void
  onRadiusChange: (radius: number) => void
}

function MapClickHandler({ 
  onLocationChange, 
  onMapClick 
}: { 
  onLocationChange: (lat: number, lng: number) => void
  onMapClick?: () => void
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationChange(lat, lng)
      onMapClick?.()
    },
  })
  return null
}

function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 15)
  }, [map, lat, lng])
  return null
}

export function JobsiteMap({ latitude, longitude, radiusMeters, onLocationChange, onRadiusChange }: JobsiteMapProps) {
  const [searchAddress, setSearchAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<{ lat: number; lng: number } | null>(null)

  const center: [number, number] = latitude && longitude ? [latitude, longitude] : [51.505, -0.09] // Default to London

  // Geocode address using OpenStreetMap Nominatim API
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Clockly App',
          },
        }
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newLat = parseFloat(lat)
        const newLng = parseFloat(lon)
        onLocationChange(newLat, newLng)
        setSearchResult({ lat: newLat, lng: newLng })
      } else {
        alert('Address not found. Please try a different search term.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      alert('Failed to search address. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Address Search */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Search Address</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
            placeholder="Enter address to search..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddressSearch}
            disabled={isSearching || !searchAddress.trim()}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl border border-slate-300 overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={center}
          zoom={latitude && longitude ? 15 : 10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler 
            onLocationChange={onLocationChange}
            onMapClick={() => setSearchResult(null)}
          />
          {searchResult && <MapCenter lat={searchResult.lat} lng={searchResult.lng} />}
          {latitude && longitude && (
            <>
              <Marker position={[latitude, longitude]} />
              <Circle
                center={[latitude, longitude]}
                radius={radiusMeters}
                pathOptions={{
                  color: '#0ea5e9',
                  fillColor: '#0ea5e9',
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Radius Slider */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Geofence Radius: {radiusMeters}m
        </label>
        <input
          type="range"
          min="50"
          max="500"
          step="10"
          value={radiusMeters}
          onChange={(e) => onRadiusChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>50m</span>
          <span>275m</span>
          <span>500m</span>
        </div>
      </div>

      {/* Coordinates Display */}
      {latitude && longitude && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Latitude: </span>
            <span className="font-mono font-medium">{latitude.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-slate-600">Longitude: </span>
            <span className="font-mono font-medium">{longitude.toFixed(6)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
