import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Dimensions } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { icons } from "@/constants";
import { Image } from 'react-native';
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/env";
const GOOGLE_API_KEY = "AIzaSyCOOfG2mcr3kXZpMaUOk_IKOnRViF6mNaw";

const ProcesoDeRecogida = () => {
    const { tricimotero } = useLocalSearchParams();
    const [ubicacionTricimotero, setUbicacionTricimotero] = useState(null);
    const [ubicacionCliente, setUbicacionCliente] = useState(null);
    const [rutaCoords, setRutaCoords] = useState([]);
    const [tiempoEstimado, setTiempoEstimado] = useState("");
    const { getToken } = useAuth();
    const mapRef = useRef(null);
    const [rideInfo, setRideInfo] = useState<RideInfo | null>(null);
    const [distanciaMetros, setDistanciaMetros] = useState(null);
    const [mostrarModalLlegada, setMostrarModalLlegada] = useState(false);
    const router = useRouter();
    type RideInfo = {
        ride_id: number;
        estado: string;
        origin: string;
        destination: string;
    };
    useEffect(() => {
    if (!rideInfo?.ride_id) return;

    const verificarEstadoRide = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/api/rides/estado/?ride_id=${rideInfo.ride_id}`, {
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
}, [rideInfo]);
    useEffect(() => {
        if (!rideInfo?.ride_id) return;

        consultarDistancia();
        const interval = setInterval(() => {
            consultarDistancia();
        }, 5000);

        return () => clearInterval(interval);
    }, [rideInfo]);

    const consultarDistancia = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/api/distancia-cliente-tricimotero/?ride_id=${rideInfo?.ride_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setDistanciaMetros(data.distancia_metros);
                if (data.distancia_metros < 30 && !mostrarModalLlegada) {
                    setMostrarModalLlegada(true); // 🎯 muestra el modal cuando esté cerca
                }
            } else {
                console.log("No se pudo calcular la distancia");
            }
        } catch (err) {
            console.error("❌ Error consultando distancia:", err);
        }
    };
    useEffect(() => {
        const consultarRideActivo = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${BASE_URL}/api/rides/en-camino/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });


                if (res.ok) {
                    const data = await res.json();
                    console.log("✅ Ride activo encontrado:", data[0]);
                    setRideInfo(data[0]);
                } else {
                    console.log("ℹ️ No hay ride activo para el cliente.");
                }
            } catch (error) {
                console.error("❌ Error al consultar ride activo:", error);
            }
        };

        consultarRideActivo();
    }, []);
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
                await fetch(`${BASE_URL}/api/ubicacion/`, {
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
                `${BASE_URL}/api/ubicacion-tricimotero-info/?id=${tricimotero}`,
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
    const confirmarLlegada = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/api/rides/marcar-ha-llegado/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ride_id: rideInfo?.ride_id }),
            });

            if (res.ok) {
                setMostrarModalLlegada(false);
                console.log("🚀 Ride marcado como 'ha_llegado'");
                // Opcional: redirigir a otra pantalla
            } else {
                console.log("❌ Error al marcar como 'ha_llegado'");
            }
        } catch (err) {
            console.error("❌ Error al confirmar llegada:", err);
        }
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
                        📍 Distancia al tricimotero: {distanciaMetros < 1000
                            ? `${distanciaMetros.toFixed(1)} metros`
                            : `${(distanciaMetros / 1000).toFixed(2)} km`}
                    </Text>

                    {distanciaMetros < 30 && (
                        <Text style={{ fontWeight: "bold", color: "#16a34a", marginTop: 5 }}>
                            ✅ El tricimotero ha llegado
                        </Text>
                    )}
                </View>
            )}
            {mostrarModalLlegada && (
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 20,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "white",
                            padding: 24,
                            borderRadius: 16,
                            alignItems: "center",
                            width: "80%",
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                            ✅ ¡Tu tricimotero ha llegado!
                        </Text>
                        <Text style={{ fontSize: 15, color: "#4B5563", marginBottom: 20, textAlign: "center" }}>
                            ¿Confirmas que ya te recogió?
                        </Text>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <Text
                                style={{
                                    backgroundColor: "#e5e7eb",
                                    padding: 10,
                                    borderRadius: 8,
                                    marginRight: 10,
                                }}
                                onPress={() => setMostrarModalLlegada(false)}
                            >
                                Cancelar
                            </Text>
                            <Text
                                style={{
                                    backgroundColor: "#22c55e",
                                    color: "white",
                                    padding: 10,
                                    borderRadius: 8,
                                }}
                                onPress={confirmarLlegada}
                            >
                                Sí, me recogió
                            </Text>
                        </View>
                    </View>
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
                    <Marker
                        coordinate={ubicacionCliente}  // Debes pasar las coordenadas como una propiedad
                        title="Tú"  // Título del marcador
                        pinColor="green"  // Color del pin (si no usas imagen personalizada)
                    >
                        <Image
                            source={icons.point} // Aquí asignamos el ícono de pin
                            style={{ width: 30, height: 30 }} // Ajusta el tamaño del ícono según sea necesario
                        />
                    </Marker>
                    <Marker
                        coordinate={ubicacionTricimotero}
                        title="Tricimotero"
                        pinColor="blue"
                    >
                        <Image
                            source={icons.marker} // Icono de marker
                            style={{ width: 40, height: 30 }} // Ajusta el tamaño del ícono según lo necesites
                        />
                    </Marker>
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
