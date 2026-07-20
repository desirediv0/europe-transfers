"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522];
const DEFAULT_ZOOM = 5;

function fixLeafletIcon() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

fixLeafletIcon();

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

function MarkerDragHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function SyncView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function InnerMap({ latitude, longitude, onChange }: MapPickerProps) {
  const center: [number, number] = latitude != null && longitude != null
    ? [latitude, longitude]
    : DEFAULT_CENTER;

  const zoom = latitude != null && longitude != null ? 10 : DEFAULT_ZOOM;

  return (
    <div className="relative rounded-md border overflow-hidden" style={{ height: 280 }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SyncView center={center} />
        <MarkerDragHandler onChange={onChange} />
        {latitude != null && longitude != null && (
          <Marker
            position={[latitude, longitude]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const pos = e.target.getLatLng();
                onChange(pos.lat, pos.lng);
              },
            }}
          />
        )}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] rounded bg-background/90 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
        Click map or drag marker to set position
      </div>
    </div>
  );
}

export function MapPicker(props: MapPickerProps) {
  return <InnerMap {...props} />;
}
