import Map from "react-map-gl";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapBox() {
  return (
    <div className="flex justified-end">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{
          longitude: -74.006,
          latitude: 40.7128,
          zoom: 10,
        }}
        style={{ width: "100vw", height: "85vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      />
    </div>
  );
}
