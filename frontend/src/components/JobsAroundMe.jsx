import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { getCurrentPosition, checkPermissions, requestPermissions } from "@tauri-apps/plugin-geolocation";
import CompanyDisplay from "./CompanyDisplay";
import {
  MapPin,
  Navigation,
  Loader2,
  Briefcase,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

// Custom red icon for user location
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to recenter map when location changes
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 12);
  }, [lat, lng, map]);
  return null;
}

export default function JobsAroundMe({ onJobClick }) {
  const [userLocation, setUserLocation] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAutoTrigger = () => {
      // Small delay to let smooth scroll finish
      setTimeout(() => handleGetLocation(), 300);
    };
    window.addEventListener("autoTriggerLocation", handleAutoTrigger);
    return () => window.removeEventListener("autoTriggerLocation", handleAutoTrigger);
  }, []);

  const handleGetLocation = async () => {
    setLoading(true);
    setError(null);

    // If running inside Tauri (Android/Desktop app)
    if (window.__TAURI__) {
      try {
        let permissions = await checkPermissions();
        if (permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') {
          permissions = await requestPermissions();
        }
        if (permissions.location !== 'granted') {
          setError("Location permission denied. Please allow location access in your device settings.");
          setLoading(false);
          return;
        }

        const pos = await getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        fetchNearbyJobs(pos.coords.latitude, pos.coords.longitude);
      } catch (err) {
        console.error(err);
        setError("Unable to retrieve your location. Please try again or check your device settings.");
        setLoading(false);
      }
    } else {
      // Running in standard web browser
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyJobs(latitude, longitude);
        },
        (err) => {
          console.error(err);
          setLoading(false);
          if (err.code === 1) {
            setError(
              "Location permission denied. Please allow location access to find jobs near you."
            );
          } else {
            setError("Unable to retrieve your location. Please try again or check your device settings.");
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const fetchNearbyJobs = async (lat, lng) => {
    try {
      // Default radius: 50km
      const { data } = await axios.get(
        `https://jobone-mrpy.onrender.com/jobs/nearby?lat=${lat}&lng=${lng}&dist=50`
      );
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch nearby jobs", err);
      setError("Failed to find jobs in your area.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="text-blue-600" /> Jobs Around You
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Find opportunities within 50km of your current location.
          </p>
        </div>

        {!userLocation && (
          <button
            onClick={handleGetLocation}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium disabled:bg-blue-400"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Navigation size={18} />
            )}
            {loading ? "Locating..." : "Use My Location"}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium border-l-4 border-red-500">
          {error}
        </div>
      )}

      {/* Map View */}
      {userLocation && (
        <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full z-0 relative border-b border-gray-100">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

            {/* User Marker */}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>You are here</Popup>
            </Marker>

            {/* Job Markers */}
            {jobs.map(
              (job) =>
                job.location?.coordinates && (
                  <Marker
                    key={job._id}
                    position={[
                      job.location.coordinates[1],
                      job.location.coordinates[0],
                    ]} // Mongo uses [Lng, Lat], Leaflet uses [Lat, Lng]
                  >
                    <Popup>
                      <div className="min-w-[150px]">
                        <h3 className="font-bold text-gray-800 text-sm">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {job.location.address}
                        </p>
                        <p className="text-blue-600 font-bold text-xs mt-1">
                          ₹{job.salary}
                        </p>
                        <button
                          onClick={() => onJobClick ? onJobClick(job) : navigate(`/job/${job._id}`)}
                          className="text-xs text-white bg-blue-600 px-2 py-1 rounded mt-2 w-full"
                        >
                          View Job
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                )
            )}
          </MapContainer>
        </div>
      )}

      {/* Jobs List */}
      <div className="p-6 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
          {userLocation
            ? `${jobs.length} Jobs Found Nearby`
            : "Results will appear here"}
        </h3>

        {!userLocation ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center shadow-sm h-64 hover:border-blue-300 transition-colors">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 shadow-sm shadow-blue-100 animate-pulse">
              <MapPin size={28} />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Discover Local Opportunities</h4>
            <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6">
              We need your location to show the best jobs in your immediate area. 
            </p>
            <button
              onClick={handleGetLocation}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Navigation size={18} className="text-cyan-400" />
              Enable Location
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No jobs found within 50km. Try searching a different area.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                onClick={() => onJobClick ? onJobClick(job) : navigate(`/job/${job._id}`)}
                className="bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden"
              >
                {/* Top highlight bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-start justify-between mb-5 mt-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl font-black text-blue-600 border border-blue-100/50 shadow-sm group-hover:scale-105 transition-transform duration-300">
                    {(job.postedByCompany || job.postedByName || "C").charAt(0)}
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-blue-100 shadow-sm mt-1">
                    {Array.isArray(job.jobType) ? job.jobType.join(", ") : job.jobType}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-500 font-semibold mb-5">
                  <CompanyDisplay job={job} fallback="Company Confidential" />
                </p>

                <div className="mt-auto space-y-3 pt-4 border-t border-slate-50/80">
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                        <MapPin size={14} className="shrink-0" />
                    </div>
                    <span className="truncate">
                      {typeof job.location === "object"
                        ? job.location.address
                        : job.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                        <IndianRupee size={14} className="shrink-0" />
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-green-700 transition-colors">
                      {job.salaryAmount === 0 || (job.salaryMin === 0 && job.salaryMax === 0) 
                        ? "Unpaid"
                        : job.salaryAmount?.toLocaleString() || job.salaryMin?.toLocaleString() || job.salary?.toLocaleString() || "TBD"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
