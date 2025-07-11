import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { icons } from "@/constants";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/env";
const GOOGLE_API_KEY = "AIzaSyCOOfG2mcr3kXZpMaUOk_IKOnRViF6mNaw";

const ProcesoDeRecogidaTricimotero = () => {
  const { clienteId, rideId } = useLocalSearchParams();
  const [ubicacionCliente, setUbicacionCliente] = useState(null);
  const [ubicacionTricimotero, setUbicacionTricimotero] = useState(null);
  const [rutaCoords, setRutaCoords] = useState([]);
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [region, setRegion] = useState(null); // Estado para manejar la región del mapa
  const { getToken } = useAuth();
  const mapRef = useRef(null); // Referencia del mapa
  const [distanciaMetros, setDistanciaMetros] = useState(null);
  const router = useRouter();
   useEffect(() => {
      if (!rideId) return;
  
      const verificarEstadoRide = async () => {
          try {
              const token = await getToken();
              const res = await fetch(`${BASE_URL}/api/rides/estado/?ride_id=${rideId}`, {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              });
  
              if (res.ok) {
                  const data = await res.json();
                  if (data.estado === "hallegado") {
                      router.replace("/confirmacion");
                  }
              }
          } catch (error) {
              console.error("❌ Error consultando estado del ride:", error);
          }
      };
  
      const interval = setInterval(verificarEstadoRide, 5000); // cada 5 segundos
      return () => clearInterval(interval);
  }, [rideId]);
  useEffect(() => {
    if (!rideId) return;

    consultarDistancia();
    const interval = setInterval(() => {
      consultarDistancia();
    }, 5000);

    return () => clearInterval(interval);
  }, [rideId]);

  const consultarDistancia = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/distancia-cliente-tricimotero/?ride_id=${rideId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setDistanciaMetros(data.distancia_metros);
      } else {
        console.log("No se pudo calcular la distancia");
      }
    } catch (err) {
      console.error("❌ Error consultando distancia:", err);
    }
  };
  // 🛰️ Obtener la ubicación actual del dispositivo y configurar el mapa
  useEffect(() => {
    const obtenerUbicacionActual = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // Obtén la ubicación actual del dispositivo
      const { coords } = await Location.getCurrentPositionAsync({});
      const regionInicial = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01, // Controla el nivel de zoom
        longitudeDelta: 0.01, // Controla el nivel de zoom
      };
      setRegion(regionInicial); // Establece la región inicial

      setUbicacionTricimotero({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    };

    obtenerUbicacionActual();
  }, []);

  // 🛰️ Enviar ubicación del tricimotero y guardarla en estado
  useEffect(() => {
    let interval;

    const iniciarEnvioUbicacion = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      interval = setInterval(async () => {
        try {
          const { coords } = await Location.getCurrentPositionAsync({});
          setUbicacionTricimotero({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          const token = await getToken();
          await fetch(`${BASE_URL}/api/ubicacion-tricimotero/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitud: coords.latitude,
              longitud: coords.longitude,
            }),
          });
        } catch (err) {
          console.error("❌ Error enviando ubicación:", err);
        }
      }, 5000);
    };

    iniciarEnvioUbicacion();
    return () => clearInterval(interval);
  }, []);

  // 📍 Obtener ubicación del cliente solo una vez
  const fetchUbicacionCliente = async () => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${BASE_URL}/api/ubicacion-cliente/?id=${clienteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const coords = {
          latitude: data.latitud,
          longitude: data.longitud,
          timestamp: data.actualizado,
        };
        setUbicacionCliente(coords);

        if (ubicacionTricimotero) {
          trazarRuta(ubicacionTricimotero, coords);
        }
      }
    } catch (error) {
      console.error("Error ubicando cliente:", error);
    }
  };

  useEffect(() => {
    fetchUbicacionCliente();
    // Solo actualiza la ubicación del cliente en el intervalo si no hemos comenzado el trayecto
    const interval = setInterval(fetchUbicacionCliente, 10000);
    return () => clearInterval(interval);
  }, [ubicacionTricimotero]);

  // 📏 Trazar ruta con Google Directions API
  const trazarRuta = async (origen, destino) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origen.latitude},${origen.longitude}&destination=${destino.latitude},${destino.longitude}&key=${GOOGLE_API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes.length) {
        const puntos = decodePolyline(data.routes[0].overview_polyline.points);
        const duracion = data.routes[0].legs[0].duration.text;
        setRutaCoords(puntos);
        setTiempoEstimado(duracion);
      }
    } catch (err) {
      console.error("❌ Error al trazar ruta:", err);
    }
  };

  // 🔓 Decodificador de polyline
  const decodePolyline = (t, e = 5) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < t.length) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };
  // Manejador de cambio de región (zoom y posición)
  const onRegionChange = (newRegion) => {
    setRegion(newRegion); // Actualiza el estado con la nueva región
  };

  useEffect(() => {
    // Solo sigue al tricimotero
    if (ubicacionTricimotero && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: ubicacionTricimotero.latitude,
        longitude: ubicacionTricimotero.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      });
    }
  }, [ubicacionTricimotero, region]); // Actualiza solo cuando la ubicación del tricimotero cambie

  return (
    <View className="flex-1">
      {ubicacionCliente && (
        <View
          style={{
            position: "absolute",
            top: 40,
            left: 20,
            right: 20,
            backgroundColor: "white",
            borderRadius: 12,
            padding: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1e40af", textAlign: "center" }}>
            Dirígete al cliente
          </Text>

          {ubicacionCliente.timestamp && (
            <Text style={{ fontSize: 13, color: "#4b5563", textAlign: "center", marginTop: 4 }}>
              Última ubicación: {new Date(ubicacionCliente.timestamp).toLocaleTimeString()}
            </Text>
          )}

          {tiempoEstimado && (
            <Text style={{ fontSize: 13, color: "#4b5563", textAlign: "center", marginTop: 2 }}>
              ⏱️ ETA: {tiempoEstimado}
            </Text>
          )}
        </View>
      )}
      {distanciaMetros !== null && (
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 20,
            right: 20,
            backgroundColor: "white",
            padding: 10,
            borderRadius: 10,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 10,
          }}
        >
          <Text style={{ fontSize: 14, color: "#4B5563" }}>
            📍 Distancia al cliente: {distanciaMetros < 1000
              ? `${distanciaMetros.toFixed(1)} metros`
              : `${(distanciaMetros / 1000).toFixed(2)} km`}
          </Text>

          {distanciaMetros < 30 && (
            <Text style={{ fontWeight: "bold", color: "#16a34a", marginTop: 5 }}>
              ✅ dEstas cerca del cliente!
            </Text>
          )}
        </View>
      )}
      {ubicacionCliente && ubicacionTricimotero ? (
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          region={region} // Establece la región controlada por el estado
          onRegionChangeComplete={onRegionChange} // Actualiza la región cuando el usuario la cambia
        >
          <Marker coordinate={ubicacionCliente} title="Cliente" pinColor="blue">
            <Image
              source={icons.point}
              style={{ width: 30, height: 30 }}
            />
          </Marker>
          <Marker coordinate={ubicacionTricimotero} title="Tú" pinColor="green">
            <Image
              source={icons.marker}
              style={{ width: 30, height: 30 }}
            />
          </Marker>
          {rutaCoords.length > 0 && (
            <Polyline coordinates={rutaCoords} strokeColor="#4285F4" strokeWidth={4} />
          )}
        </MapView>
      ) : (
        <ActivityIndicator size="large" color="#60a5fa" className="mt-10" />
      )}
    </View>
  );
};

export default ProcesoDeRecogidaTricimotero;
