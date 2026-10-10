import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { Search, Navigation } from "lucide-react";
import { getCurrentPosition, checkPermissions, requestPermissions } from "@tauri-apps/plugin-geolocation";

// Fix Leaflet's default icon path issue in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle clicks on the map
function MapEvents({ setPosition, setAddress }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });

      // Reverse Geocode: Get readable address from Lat/Lng
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        setAddress(res.data.display_name);
      } catch (error) {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    },
  });
  return null;
}

// Component to fly to search result
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

export default function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null); // { lat, lng }
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default: India Center

  // Notify parent (CreateJob) whenever position changes
  useEffect(() => {
    if (position) {
      onLocationSelect({
        latitude: position.lat,
        longitude: position.lng,
        address: address,
      });
    }
  }, [position, address, onLocationSelect]);

  const executeSearch = async (query) => {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: query,
        format: "json",
        addressdetails: 1,
        limit: 1,
        countrycodes: "in", // Limit to India
      },
    });
    return res.data;
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      // 1. First attempt: Exact query
      let results = await executeSearch(searchQuery);

      // 2. Second attempt: Fallback (remove specific details like 'Sector-A' or house numbers)
      if (results.length === 0) {
        // Regex to remove common specific terms (Sector, Plot No, etc.) to broaden search
        const broadQuery = searchQuery
          .replace(/Sector-?[A-Z0-9]+|Plot No\.?\s?\d+|Flat No\.?\s?\d+/gi, "")
          .trim();

        if (broadQuery !== searchQuery && broadQuery.length > 3) {
          console.log(`Retrying search with broader query: "${broadQuery}"`);
          results = await executeSearch(broadQuery);
        }
      }

      // 3. Third attempt: Fallback to just the last part (likely City/Area)
      if (results.length === 0 && searchQuery.includes(",")) {
        const parts = searchQuery.split(",");
        if (parts.length > 1) {
          const cityOnly = parts[parts.length - 1].trim(); // e.g., "Bhopal"
          const areaAndCity = parts.slice(-2).join(", ").trim(); // e.g. "Indrapuri, Bhopal"

          console.log(`Retrying search with area/city: "${areaAndCity}"`);
          results = await executeSearch(areaAndCity);

          if (results.length === 0) {
            console.log(`Retrying search with city only: "${cityOnly}"`);
            results = await executeSearch(cityOnly);
          }
        }
      }

      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };

        setMapCenter([newPos.lat, newPos.lng]);
        setPosition(newPos);
        // We keep the user's original query as the 'address' if they were specific,
        // or use the API result if it's clearer. Using API result is safer for consistency.
        setAddress(display_name);
      } else {
        alert(
          "Location not found. Please try entering just the City or Area name (e.g., 'Indrapuri, Bhopal')."
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please check your internet connection.");
    }
  };

  const handleCurrentLocation = async () => {
    if (window.__TAURI__) {
      try {
        let permissions = await checkPermissions();
        if (permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') {
          permissions = await requestPermissions();
        }
        if (permissions.location !== 'granted') {
          alert("Location permission denied. Please allow location access in your device settings.");
          return;
        }

        const pos = await getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const newAddress = res.data.display_name;
          const newPos = { lat, lng };

          setMapCenter([lat, lng]);
          setPosition(newPos);
          setAddress(newAddress);
          setSearchQuery(""); // Clear search query if they used GPS
        } catch (error) {
          console.error("Reverse geocoding failed", error);
          const newPos = { lat, lng };
          setMapCenter([lat, lng]);
          setPosition(newPos);
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      } catch (err) {
        console.error(err);
        alert("Unable to retrieve your location. Please try again or check your device settings.");
      }
    } else {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          try {
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const newAddress = res.data.display_name;
            const newPos = { lat, lng };

            setMapCenter([lat, lng]);
            setPosition(newPos);
            setAddress(newAddress);
            setSearchQuery(""); // Clear search query if they used GPS
          } catch (error) {
            console.error("Reverse geocoding failed", error);
            const newPos = { lat, lng };
            setMapCenter([lat, lng]);
            setPosition(newPos);
            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location. Please ensure location services are enabled.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city or area..."
            className="flex-1 p-2 border rounded-lg text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shrink-0"
            title="Search"
          >
            <Search size={20} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center transition-colors gap-2 text-sm font-bold whitespace-nowrap w-full sm:w-auto"
          title="Use My Current Location"
        >
          <Navigation size={18} /> Use My Current Location
        </button>
      </div>

      {/* Map */}
      <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-300 z-0 relative">
        <MapContainer
          center={mapCenter}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents setPosition={setPosition} setAddress={setAddress} />
          <MapRecenter center={mapCenter} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      {/* Selected Address Display */}
      {address && (
        <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
          <strong>Selected:</strong> {address}
        </div>
      )}
    </div>
  );
}
