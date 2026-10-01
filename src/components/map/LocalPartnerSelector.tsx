import React, { useRef, useEffect, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MOCK_USERS } from '../../data/mockData';
import { User } from '../../types';
import { MapPin, Search, CheckCircle2 } from 'lucide-react';

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
    
    return MOCK_USERS.filter(user => ['PROCESSOR', 'LABORATORY', 'DISTRIBUTOR', 'RETAILER'].includes(user.role))
      .map(user => {
        // Fallback to random nearby coordinate if not in mock map
        const coords = MOCK_COORDS[user.id] || [
          farmerLng + (Math.random() - 0.5) * 5,
          farmerLat + (Math.random() - 0.5) * 5
        ];
        
        const userPoint = turf.point(coords as [number, number]);
        const distance = turf.distance(farmerPoint, userPoint, { units: 'kilometers' });
        
        return {
          ...user,
          coordinates: coords as [number, number],
          distanceKm: distance
        };
      })
      .filter(user => user.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [farmerLat, farmerLng, radiusKm]);

  // Mapbox Lifecycle
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v12', // A better style for agricultural context
        center: [farmerLng, farmerLat],
        zoom: 4,
        antialias: true, // Smooths out lines and 3D features
        projection: 'globe' as any // Uses a 3D globe projection when zoomed out
      });

      mapRef.current.on('style.load', () => {
        if (!mapRef.current) return;
        
        // Add atmospheric fog for 3D effect
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
            'fill-opacity': 0.1
          }
        });

        mapRef.current.addLayer({
          id: 'radius-line',
          type: 'line',
          source: 'radius-buffer',
          paint: {
            'line-color': '#10b981',
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });

        updateMapRadiusAndMarkers(true);
      });
    }

    // CRITICAL: Cleanup to prevent memory leaks as per integration patterns
    return () => {
      mapRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerLat, farmerLng]);

  // Update Map visual layer when radius or partners change
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const updateMapRadiusAndMarkers = (shouldFitBounds: boolean = false) => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    // Draw buffer
    const center = [farmerLng, farmerLat];
    const options = { steps: 64, units: 'kilometers' as const };
    const circle = turf.circle(center, radiusKm, options);

    const source = mapRef.current.getSource('radius-buffer') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(circle);
    }

    // Fit bounds to circle only if explicitly requested (e.g., initial load)
    if (shouldFitBounds) {
      const bbox = turf.bbox(circle);
      mapRef.current.fitBounds(bbox as [number, number, number, number], { padding: 40 });
    }

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers for local partners
    localPartners.forEach(partner => {
      const color = selectedPartners[partner.role as keyof typeof selectedPartners]?.id === partner.id 
        ? '#3b82f6' // Selected color
        : '#94a3b8'; // Unselected color

      const marker = new mapboxgl.Marker({ color })
        .setLngLat(partner.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${partner.name}</strong><br/>${partner.role}<br/>${partner.distanceKm.toFixed(1)} km away`))
        .addTo(mapRef.current!);
      
      markersRef.current.push(marker);
    });
  };

  // Re-run visual updates when dependencies change (but don't fit bounds to avoid jumping map)
  useEffect(() => {
    updateMapRadiusAndMarkers(false);
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

      {!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
          <strong>Missing Mapbox Token:</strong> Please add <code>VITE_MAPBOX_ACCESS_TOKEN</code> to your .env file to view the interactive map.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-emerald-900 flex items-center gap-2">
                <Search size={16} />
                Search Radius: {radiusKm} km
              </label>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-48 accent-emerald-600"
              />
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
