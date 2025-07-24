import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Dimensions, Modal, TouchableOpacity, Vibration, Alert } from "react-native";
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
    const [countdown, setCountdown] = useState(10);
    const router = useRouter();
    type RideInfo = {
        ride_id: number;
        estado: string;
        origin: string;
        destination: string;
    };
    useEffect(() => {
        if (!mostrarModalLlegada) return;

        setCountdown(10); // reiniciar cada vez que se muestre

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    confirmarLlegada(); // autoconfirmar
                    clearInterval(interval);
                    return 0;
                }
                if (prev === 4) {
                    Vibration.vibrate(500); // vibra cuando faltan 3 segundos
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [mostrarModalLlegada]);
    useEffect(() => {
        if (!rideInfo?.ride_id) return;

        const verificarEstadoRide = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${BASE_URL}/api/rides/estado/?ride_id=${rideInfo?.ride_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();

                    if (data.estado === "hallegado") {
                        router.replace("/confirmacion");
                    } else if (data.estado === "cancelado") {
                        Alert.alert("Viaje cancelado", "El viaje ha sido cancelado.");
                        router.replace("../(tabs)/home");
                    }
                }
            } catch (error) {
                console.error("❌ Error consultando estado del ride:", error);
            }
        };


        const interval = setInterval(verificarEstadoRide, 10000);
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
            }, 15000);
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
    const handleCancelarRide = async () => {
        if (!rideInfo?.ride_id) return;

        Alert.alert(
            "Cancelar viaje",
            "¿Estás seguro que deseas cancelar este viaje?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            const res = await fetch(`${BASE_URL}/api/rides/${rideInfo.ride_id}/cancelar/`, {
                                method: "PATCH",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });

                            const data = await res.json();

                            if (!res.ok) throw new Error(data?.detail || "Error al cancelar ride");

                            Alert.alert("✅ Viaje cancelado");
                            router.replace("../(tabs)/home");
                        } catch (err) {
                            Alert.alert("Error", err.message);
                        }
                    },
                },
            ]
        );
    };
    return (
        <View className="flex-1 bg-white">

            {tiempoEstimado && (
                <View className="absolute top-10 left-5 right-5 bg-white p-4 rounded-xl shadow-md z-10 items-center">
                    <Text className="text-center text-lg font-semibold text-emerald-700">
                        🚘 Tricimotero en camino
                    </Text>
                    <Text className="text-center text-sm text-gray-600 mt-1 mb-3">
                        ⏱️ Tiempo estimado: {tiempoEstimado}
                    </Text>

                    <TouchableOpacity
                        onPress={handleCancelarRide}
                        className="bg-red-500 px-4 py-2 rounded-lg"
                    >
                        <Text className="text-white font-medium">Cancelar viaje</Text>
                    </TouchableOpacity>
                </View>
            )}



            {distanciaMetros !== null && (
                <View className="absolute bottom-10 left-5 right-5 bg-white p-4 rounded-xl shadow-md items-center z-10">
                    <Text className="text-gray-700 text-sm">
                        📍 Distancia al tricimotero:{" "}
                        {distanciaMetros < 1000
                            ? `${distanciaMetros.toFixed(1)} metros`
                            : `${(distanciaMetros / 1000).toFixed(2)} km`}
                    </Text>

                    {distanciaMetros < 30 && (
                        <Text className="text-emerald-600 font-semibold mt-1">
                            ✅ El tricimotero ha llegado
                        </Text>
                    )}

                </View>
            )}

            {mostrarModalLlegada && (
                <Modal transparent visible={mostrarModalLlegada} animationType="fade">
                    <View className="flex-1 bg-black/50 justify-center items-center z-20">
                        <View className="bg-white p-6 rounded-2xl items-center w-11/12 shadow-lg">
                            <Text className="text-xl font-bold text-center">
                                ✅ ¡Tu tricimotero ha llegado!
                            </Text>
                            <Text className="text-gray-600 text-center mt-2">
                                ¿Confirmas que ya te recogió?
                            </Text>

                            <Text className="text-red-500 text-sm mt-3">
                                Confirmando automáticamente en {countdown} segundos...
                            </Text>

                            <View className="flex-row gap-4 mt-6">
                                <TouchableOpacity
                                    className="bg-gray-200 px-5 py-2 rounded-lg"
                                    onPress={() => setMostrarModalLlegada(false)}
                                >
                                    <Text className="text-gray-800 font-medium">Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="bg-emerald-600 px-5 py-2 rounded-lg"
                                    onPress={confirmarLlegada}
                                >
                                    <Text className="text-white font-medium">Sí, me recogió</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {ubicacionCliente && ubicacionTricimotero ? (
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    className="w-full h-full"
                    region={{
                        latitude: ubicacionCliente.latitude,
                        longitude: ubicacionCliente.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.002,
                    }}
                >
                    <Marker coordinate={ubicacionCliente} title="Tú" pinColor="green">
                        <Image source={icons.point} style={{ width: 30, height: 30 }} />
                    </Marker>
                    <Marker coordinate={ubicacionTricimotero} title="Tricimotero" pinColor="blue">
                        <Image source={icons.marker} style={{ width: 40, height: 30 }} />
                    </Marker>
                    {rutaCoords.length > 0 && (
                        <Polyline coordinates={rutaCoords} strokeColor="#22c55e" strokeWidth={4} />
                    )}
                </MapView>
            ) : (
                <ActivityIndicator size="large" color="#22c55e" className="mt-10" />
            )}

        </View>
    );
};

export default ProcesoDeRecogida;
