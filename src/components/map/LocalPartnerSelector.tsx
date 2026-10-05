import React, { useRef, useEffect, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MOCK_USERS } from '../../data/mockData';
import { User } from '../../types';
import { MapPin, Search, CheckCircle2 } from 'lucide-react';
import apiClient from '../../services/api';

// Hardcoded coordinates for mock users to simulate a map environment
// Real app would have these in the database
const MOCK_COORDS: Record<string, [number, number]> = {
  'USR-PRC-01': [77.5255, 13.0305], // Bengaluru (Processor)
  'USR-LAB-01': [78.4867, 17.3850], // Hyderabad (Lab)
  'USR-DST-01': [77.2090, 28.6139], // Delhi (Distributor)
  'USR-RET-01': [77.6411, 12.9784], // Indiranagar, Bengaluru (Retailer)
};

interface LocalPartnerSelectorProps {
  farmerLat: number;
  farmerLng: number;
  onSelectionComplete: (selections: {
    processor: User | null;
    lab: User | null;
    distributor: User | null;
    retailer: User | null;
  }) => void;
}

export const LocalPartnerSelector: React.FC<LocalPartnerSelectorProps> = ({
  farmerLat,
  farmerLng,
  onSelectionComplete,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(500); // Default 500km radius for demo
  const [mapboxToken, setMapboxToken] = useState<string>(import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '');

  // Asynchronously fetch Mapbox token from backend if missing from frontend env
  useEffect(() => {
    if (!mapboxToken) {
      let isMounted = true;
      apiClient.get('/config/mapbox')
        .then(res => {
          if (isMounted && res.data?.token) {
            setMapboxToken(res.data.token);
          }
        })
        .catch(() => {
          // Token will remain empty if backend unreachable
        });
      return () => {
        isMounted = false;
      };
    }
  }, [mapboxToken]);
  
  const [selectedPartners, setSelectedPartners] = useState<{
    PROCESSOR: User | null;
    LABORATORY: User | null;
    DISTRIBUTOR: User | null;
    RETAILER: User | null;
  }>({
    PROCESSOR: null,
    LABORATORY: null,
    DISTRIBUTOR: null,
    RETAILER: null,
  });

  // Calculate distances and filter users within radius
  const localPartners = useMemo(() => {
    const farmerPoint = turf.point([farmerLng, farmerLat]);
    
    // Realistic regional partner facilities positioned relative to the farm
    // so users at 50km, 100km, 250km, 500km all see verified partner options
    const regionalPartners: User[] = [
      {
        id: 'USR-PRC-LOC-01',
        name: 'Malwa Botanical Bio-Refining & Steam Milling',
        email: 'ops@malwabioextracts.in',
        role: 'PROCESSOR',
        organization: 'Malwa Bio-Extracts Cooperative',
        location: 'District Botanical Processing Cluster (~32 km from Farm)',
        status: 'ACTIVE',
        joinedDate: '2023-04-10',
        certifications: ['GMP Certified (AYUSH)', 'ISO 22000:2018'],
      },
      {
        id: 'USR-DST-LOC-01',
        name: 'AgroTransit Regional Cold-Chain Logistics Hub',
        email: 'dispatch@agrotransit.in',
        role: 'DISTRIBUTOR',
        organization: 'AgroTransit Express Logistics',
        location: 'Regional Highway Cold-Chain Transit Hub (~42 km from Farm)',
        status: 'ACTIVE',
        joinedDate: '2023-05-02',
        certifications: ['GDP Compliant', 'Temperature Monitored'],
      },
      {
        id: 'USR-LAB-LOC-01',
        name: 'Central Phytochemical & NABL Botanical Testing Lab',
        email: 'qa@centralphytolab.in',
        role: 'LABORATORY',
        organization: 'Regional NABL Botanical Assay Laboratory',
        location: 'State Biotech Innovation Center (~65 km from Farm)',
        status: 'ACTIVE',
        joinedDate: '2023-02-15',
        certifications: ['ISO/IEC 17025 Accredited', 'AYUSH Approved Drug Testing Lab'],
      },
      {
        id: 'USR-RET-LOC-01',
        name: 'Heritage Ayurveda Dispensary & Wellness Store',
        email: 'sales@heritageayurveda.in',
        role: 'RETAILER',
        organization: 'Heritage Botanical Dispensary',
        location: 'District Ayurvedic Apothecary Arcade (~82 km from Farm)',
        status: 'ACTIVE',
        joinedDate: '2023-06-18',
        certifications: ['FSSAI Retail License', 'Jaivik Bharat Member'],
      },
    ];

    const localOffsets: Record<string, { distKm: number; bearing: number }> = {
      'USR-PRC-LOC-01': { distKm: 32, bearing: 45 },
      'USR-DST-LOC-01': { distKm: 42, bearing: 160 },
      'USR-LAB-LOC-01': { distKm: 65, bearing: 220 },
      'USR-RET-LOC-01': { distKm: 82, bearing: 310 },
    };

    const allCandidateUsers = [
      ...regionalPartners,
      ...MOCK_USERS.filter(u => ['PROCESSOR', 'LABORATORY', 'DISTRIBUTOR', 'RETAILER'].includes(u.role))
    ];

    return allCandidateUsers.map(user => {
      let coords: [number, number];
      if (localOffsets[user.id]) {
        const dest = turf.destination(farmerPoint, localOffsets[user.id].distKm, localOffsets[user.id].bearing, { units: 'kilometers' });
        coords = dest.geometry.coordinates as [number, number];
      } else {
        coords = MOCK_COORDS[user.id] || [
          farmerLng + 0.5,
          farmerLat + 0.5
        ];
      }

      const userPoint = turf.point(coords);
      const distance = turf.distance(farmerPoint, userPoint, { units: 'kilometers' });

      return {
        ...user,
        coordinates: coords,
        distanceKm: distance
      };
    })
    .filter(user => user.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [farmerLat, farmerLng, radiusKm]);

  // Mapbox Lifecycle
  useEffect(() => {
    if (!mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [farmerLng, farmerLat],
        zoom: 6,
        antialias: true,
        projection: 'globe' as any
      });

      mapRef.current.on('style.load', () => {
        if (!mapRef.current) return;
        
        mapRef.current.setFog({
          'color': 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)'
        });
      });

      mapRef.current.on('load', () => {
        if (!mapRef.current) return;
        
        // Add Farmer Marker (Origin)
        new mapboxgl.Marker({ color: '#10b981' })
          .setLngLat([farmerLng, farmerLat])
          .setPopup(new mapboxgl.Popup().setText('Your Farm Location'))
          .addTo(mapRef.current);

        // Add radius buffer source and layer
        mapRef.current.addSource('radius-buffer', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        mapRef.current.addLayer({
          id: 'radius-fill',
          type: 'fill',
          source: 'radius-buffer',
          paint: {
            'fill-color': '#10b981',
            'fill-opacity': 0.12
          }
        });

        mapRef.current.addLayer({
          id: 'radius-line',
          type: 'line',
          source: 'radius-buffer',
          paint: {
            'line-color': '#059669',
            'line-width': 2.5,
            'line-dasharray': [3, 2]
          }
        });

        updateMapRadiusAndMarkers(true);
      });
    }

    return () => {
      mapRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerLat, farmerLng, mapboxToken]);

  // Update Map visual layer when radius or partners change
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const updateMapRadiusAndMarkers = (shouldFitBounds: boolean = false) => {
    if (!mapRef.current) return;

    // Draw buffer
    const center = [farmerLng, farmerLat];
    const options = { steps: 64, units: 'kilometers' as const };
    const circle = turf.circle(center, radiusKm, options);

    const source = mapRef.current.getSource('radius-buffer') as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(circle);
    }

    // Fit bounds to circle if requested
    if (shouldFitBounds) {
      const bbox = turf.bbox(circle);
      mapRef.current.fitBounds(bbox as [number, number, number, number], {
        padding: 40,
        duration: 400,
        maxZoom: 12
      });
    }

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers for local partners
    localPartners.forEach(partner => {
      const isSelected = selectedPartners[partner.role as keyof typeof selectedPartners]?.id === partner.id;
      const color = isSelected ? '#10b981' : '#3b82f6';

      const marker = new mapboxgl.Marker({ color })
        .setLngLat(partner.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${partner.name}</strong><br/>${partner.role}<br/>${partner.distanceKm.toFixed(1)} km away`))
        .addTo(mapRef.current!);
      
      markersRef.current.push(marker);
    });
  };

  // Re-run visual updates and smoothly animate camera to fit new radius
  useEffect(() => {
    updateMapRadiusAndMarkers(false);

    // Debounce camera zoom animation slightly so dragging range slider is silky smooth
    const timer = setTimeout(() => {
      if (mapRef.current && mapRef.current.getSource('radius-buffer')) {
        const center = [farmerLng, farmerLat];
        const circle = turf.circle(center, radiusKm, { steps: 64, units: 'kilometers' });
        const bbox = turf.bbox(circle);
        mapRef.current.fitBounds(bbox as [number, number, number, number], {
          padding: 35,
          duration: 450,
          maxZoom: 12
        });
      }
    }, 120);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm, localPartners, selectedPartners]);

  const handleSelect = (partner: any) => {
    const role = partner.role as keyof typeof selectedPartners;
    const newSelections = {
      ...selectedPartners,
      [role]: selectedPartners[role]?.id === partner.id ? null : partner // Toggle selection
    };
    setSelectedPartners(newSelections);
    onSelectionComplete({
      processor: newSelections.PROCESSOR,
      lab: newSelections.LABORATORY,
      distributor: newSelections.DISTRIBUTOR,
      retailer: newSelections.RETAILER,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-emerald-950 mb-2">Local Area Partners</h3>
        <p className="text-sm text-slate-500 mb-4">
          Adjust the radius to mark your local area on the map. Select one provider from each required category to build your supply chain.
        </p>
      </div>

      {!mapboxToken && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
          <strong>Missing Mapbox Token:</strong> Please configure <code>MAPBOX_ACCESS_TOKEN</code> in your backend or <code>VITE_MAPBOX_ACCESS_TOKEN</code> in your .env file to view the interactive map.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <label className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                  <Search size={16} className="text-emerald-600 shrink-0" />
                  <span>Search Radius:</span>
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {radiusKm} km
                  </span>
                </label>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {localPartners.length} verified partner facilities found within {radiusKm} km
                </span>
              </div>
              <div className="w-full sm:w-56">
                <input
                  type="range"
                  min="25"
                  max="1500"
                  step="25"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  onInput={(e) => setRadiusKm(Number(e.currentTarget.value))}
                  className="w-full h-2.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 touch-auto"
                />
              </div>
            </div>

            {/* Quick Radius Preset Chips (Particularly convenient on mobile touch devices) */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Quick radius:</span>
              {[50, 100, 250, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRadiusKm(preset)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    radiusKm === preset
                      ? 'bg-emerald-600 text-white font-bold shadow-xs scale-105'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 active:scale-95'
                  }`}
                >
                  {preset} km
                </button>
              ))}
            </div>
            {/* Map Container */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-[400px] rounded-lg border border-slate-200 bg-slate-100" 
            />
          </div>
        </div>

        {/* List Column */}
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
          {['PROCESSOR', 'LABORATORY', 'DISTRIBUTOR', 'RETAILER'].map(role => {
            const partnersInRole = localPartners.filter(p => p.role === role);
            const selected = selectedPartners[role as keyof typeof selectedPartners];

            return (
              <div key={role} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-medium text-sm text-slate-700 flex justify-between items-center">
                  {role}
                  <Badge count={partnersInRole.length} />
                </div>
                <div className="divide-y divide-slate-100">
                  {partnersInRole.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400 text-center">No partners found in radius.</div>
                  ) : (
                    partnersInRole.map(partner => (
                      <button
                        key={partner.id}
                        type="button"
                        onClick={() => handleSelect(partner)}
                        className={`w-full text-left p-3 hover:bg-emerald-50 transition-colors flex items-start gap-3 ${
                          selected?.id === partner.id ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${
                          selected?.id === partner.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${selected?.id === partner.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                            {partner.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin size={12} />
                            {partner.distanceKm.toFixed(1)} km away
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ count }: { count: number }) => (
  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
    {count}
  </span>
);
