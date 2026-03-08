"use client";

import { useEffect, useState } from "react";

type LatLng = {
  lat: number;
  lng: number;
};

type ReactLeafletModule = typeof import("react-leaflet");
type LeafletModule = typeof import("leaflet");

type LeafletBundle = {
  RL: ReactLeafletModule;
  L: LeafletModule;
};

let leafletBundlePromise: Promise<LeafletBundle> | null = null;
let defaultLeafletIconConfigured = false;

function loadLeafletBundle() {
  if (!leafletBundlePromise) {
    leafletBundlePromise = Promise.all([import("react-leaflet"), import("leaflet")]).then(([RL, L]) => ({
      RL,
      L,
    }));
  }

  return leafletBundlePromise;
}

function configureDefaultIcon(L: LeafletModule) {
  if (defaultLeafletIconConfigured) return;

  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });

  defaultLeafletIconConfigured = true;
}

export default function Map({ onSelect }: { onSelect?: (pos: LatLng) => void }) {
  const [bundle, setBundle] = useState<LeafletBundle | null>(null);
  const [clickedPos, setClickedPos] = useState<LatLng | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let isMounted = true;

    loadLeafletBundle()
      .then((loadedBundle) => {
        configureDefaultIcon(loadedBundle.L);
        if (isMounted) {
          setBundle(loadedBundle);
        }
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

  if (!bundle) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = bundle.RL;

  function ClickMarker() {
    useMapEvents({
      click(e) {
        const nextPos = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        };
        setClickedPos(nextPos);
        onSelect?.(nextPos);
      },
    });

    return clickedPos ? (
      <Marker position={clickedPos}>
        <Popup>
          <strong>New report location</strong>
          <br />
          Lat: {clickedPos.lat.toFixed(4)}
          <br />
          Lng: {clickedPos.lng.toFixed(4)}
        </Popup>
      </Marker>
    ) : null;
  }

  return (
    <div className="h-full w-full">
      <MapContainer center={[-13.9833, 33.7833]} zoom={12} preferCanvas className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          updateWhenIdle
          keepBuffer={2}
        />
        <ClickMarker />
      </MapContainer>
    </div>
  );
}
