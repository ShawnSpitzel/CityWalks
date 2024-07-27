import { useState } from "react";
import ReactMapGL from "react-map-gl";
import Map from "react-map-gl"
import Header from "./components/ui/Header.jsx"

import "./App.css";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
console.log(TOKEN)

function App() {
  const [viewPort, setViewPort] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 10,
    width: "100vw",
    height: "100vh",
  });

  return (
    <>
    <Header></Header>
      <div>
        <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{
          longitude: -74.006,
          latitude: 40.7128,
          zoom: 10
        }}
        style={{width:600, height: 400}}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        />
      </div>
    </>
  );
}

export default App;
