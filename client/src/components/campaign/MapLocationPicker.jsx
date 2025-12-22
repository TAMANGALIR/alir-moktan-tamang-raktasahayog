import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
}

const MapLocationPicker = ({ latitude, longitude, onLocationChange, locationName, onLocationNameChange }) => {
    const [position, setPosition] = useState(
        latitude && longitude ? [latitude, longitude] : [27.7172, 85.3240] // Default to Kathmandu
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const mapRef = useRef(null);

    useEffect(() => {
        if (latitude && longitude) {
            setPosition([latitude, longitude]);
        }
    }, [latitude, longitude]);

    useEffect(() => {
        if (onLocationChange) {
            onLocationChange(position[0], position[1]);
        }
    }, [position]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            // Using Nominatim (OpenStreetMap) geocoding service
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newPosition = [parseFloat(lat), parseFloat(lon)];
                setPosition(newPosition);

                // Update location name if callback provided
                if (onLocationNameChange) {
                    onLocationNameChange(display_name);
                }

                // Pan map to new location
                if (mapRef.current) {
                    mapRef.current.setView(newPosition, 13);
                }
            } else {
                toast.error('Location not found. Please try a different search term.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('Failed to search location. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search for a location (e.g., Kathmandu, Nepal)"
                        className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                    {searching ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Location Name Input */}
            {locationName !== undefined && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FaMapMarkerAlt className="inline mr-2" />
                        Location Name
                    </label>
                    <input
                        type="text"
                        value={locationName}
                        onChange={(e) => onLocationNameChange && onLocationNameChange(e.target.value)}
                        placeholder="Enter location name"
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            )}

            {/* Map Container */}
            <div className="rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '300px', width: '100%' }}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>

            {/* Coordinates Display */}
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <strong>Selected Coordinates:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                    Click anywhere on the map to select a location
                </p>
            </div>
        </div>
    );
};

export default MapLocationPicker;
