import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Dimensions } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import Constants from "expo-constants";

const GOOGLE_API_KEY = "AIzaSyCOOfG2mcr3kXZpMaUOk_IKOnRViF6mNaw";

const ProcesoDeRecogida = () => {
    const { tricimotero } = useLocalSearchParams();
    const [ubicacionTricimotero, setUbicacionTricimotero] = useState(null);
    const [ubicacionCliente, setUbicacionCliente] = useState(null);
    const [rutaCoords, setRutaCoords] = useState([]);
    const [tiempoEstimado, setTiempoEstimado] = useState("");
    const { getToken } = useAuth();
    const mapRef = useRef(null);

    // 🛰️ Enviar ubicación del cliente cada 5s
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const iniciarEnvioUbicacion = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            interval = setInterval(async () => {
                const { coords } = await Location.getCurrentPositionAsync({});
                setUbicacionCliente({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });

                const token = await getToken();
                await fetch("http://192.168.10.170:8000/api/ubicacion/", {
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
            }, 5000);
        };

        iniciarEnvioUbicacion();
        return () => clearInterval(interval);
    }, []);

    // 📡 Obtener ubicación del tricimotero
    const fetchUbicacionTricimotero = async () => {
        try {
            const token = await getToken();
            const res = await fetch(
                `http://192.168.10.170:8000/api/ubicacion-tricimotero-info/?id=${tricimotero}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.ok) {
                const data = await res.json();
                const coords = {
                    latitude: data.latitud,
                    longitude: data.longitud,
                };
                setUbicacionTricimotero(coords);

                if (ubicacionCliente) {
                    trazarRuta(ubicacionCliente, coords);
                }
            }
        } catch (err) {
            console.error("Error ubicando al tricimotero:", err);
        }
    };

    useEffect(() => {
        fetchUbicacionTricimotero();
        const interval = setInterval(fetchUbicacionTricimotero, 10000);
        return () => clearInterval(interval);
    }, [ubicacionCliente]);

    // 📍 Obtener ruta con Directions API
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
            console.error("Error al trazar la ruta:", err);
        }
    };

    // 🔓 Decodificador de polylines
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

    return (
        <View className="flex-1">
            {tiempoEstimado && (
                <View
                    style={{
                        position: "absolute",
                        top: 40,
                        left: 20,
                        right: 20,
                        backgroundColor: "white",
                        padding: 12,
                        borderRadius: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                        zIndex: 10,
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#047857", textAlign: "center" }}>
                        Tricimotero en camino
                    </Text>
                    <Text style={{ fontSize: 14, color: "#4B5563", textAlign: "center", marginTop: 6 }}>
                        ⏱️ Tiempo estimado: {tiempoEstimado}
                    </Text>
                </View>
            )}
            {ubicacionCliente && ubicacionTricimotero ? (
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={{
                        width: "100%", height: "100%"
                    }}
                    region={{
                        latitude: ubicacionCliente.latitude,
                        longitude: ubicacionCliente.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.002,
                    }}
                >
                    <Marker coordinate={ubicacionCliente} title="Tú" pinColor="green" />
                    <Marker coordinate={ubicacionTricimotero} title="Tricimotero" pinColor="blue" />
                    {rutaCoords.length > 0 && (
                        <Polyline coordinates={rutaCoords} strokeColor="#4285F4" strokeWidth={4} />
                    )}
                </MapView>
            ) : (
                <ActivityIndicator size="large" color="#4ade80" className="mt-10" />
            )}
        </View>
    );
};

export default ProcesoDeRecogida;
