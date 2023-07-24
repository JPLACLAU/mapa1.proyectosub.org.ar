import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { Map, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./assets/stylesheets/App.css";

import Layout from "./components/Layout";

import locations from "./data/locations";
import utensilsIcon from "./assets/shared/mapa2verdepsub.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
const MAPBOX_USERID = process.env.REACT_APP_MAPBOX_USERID;
const MAPBOX_STYLEID = process.env.REACT_APP_MAPBOX_STYLEID;

function App() {
  const mapRef = useRef();

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });
  }, []);

  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;

    if (!map) return;

    map.eachLayer((layer = {}) => {
      const { options } = layer;
      const { name } = options;

      if (name !== "Mapbox") {
        map.removeLayer(layer);
      }
    });

    const geoJson = new L.GeoJSON(locations, {
      pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconUrl: utensilsIcon,
            iconSize: [26, 26],
            popupAnchor: [0, -15],
            shadowUrl: markerShadow,
            shadowAnchor: [13, 28],
          }),
        });
      },
      onEachFeature: (feature = {}, layer) => {
        const { properties = {}, geometry = {} } = feature;
        const {
          name,
          presenciamp,
          deliveryRadius,
          tags,
          voluntarios,
          muestreos,
        } = properties;
        const { coordinates } = geometry;

        let deliveryZoneCircle;

        if (deliveryRadius) {
          deliveryZoneCircle = L.circle(coordinates.reverse(), {
            radius: deliveryRadius,
            color: "deeppurple",
          });
        }

        const popup = L.popup();

        const html = `
          <div class="restaurant-popup">
            <h3>${name}</h3>
            <ul>
              <li>
                ${tags.join(", ")}
              </li>
              <li>
                <strong>¿Se encontraron microplásticos?:</strong> ${
                  presenciamp ? "Sí" : "No"
                }
              </li>
              <li>
                <strong>Promedio de voluntarios:</strong> ${voluntarios}
              </li>
              <li>
                <strong>Cantidad de muestreos:</strong> ${muestreos}
              </li>
            </ul>
          </div>
        `;

        popup.setContent(html);

        layer.bindPopup(popup);

        layer.on("mouseover", () => {
          if (deliveryZoneCircle) {
            deliveryZoneCircle.addTo(map);
          }
        });

        layer.on("mouseout", () => {
          if (deliveryZoneCircle) {
            deliveryZoneCircle.removeFrom(map);
          }
        });
      },
    });

    geoJson.addTo(map);
  }, [mapRef]);

  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;

    if (!map) return;
  }, [mapRef]);

  return (
    <Layout>
      <div className="search-actions"></div>
      <Map ref={mapRef} center={[-45.0, -65.0]} zoom={5}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />
      </Map>
    </Layout>
  );
}

export default App;
