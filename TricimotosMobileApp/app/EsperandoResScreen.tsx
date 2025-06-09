// 📄 EsperandoRespuestaScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";


const EsperandoRespuestaScreen = () => {
  const { origen, destino, hora } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const router = useRouter();

  // 📤 Enviar solicitud al backend cuando se carga
useEffect(() => {
  let interval: NodeJS.Timeout;

  const enviarUbicacionPeriodica = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      interval = setInterval(async () => {
        const { coords } = await Location.getCurrentPositionAsync({});
        const token = await getToken();

        const res = await fetch("http://192.168.10.170:8000/api/ubicacion/", {
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

        if (!res.ok) {
          console.warn("No se pudo actualizar ubicación.");
        } else {
          console.log("📍 Ubicación enviada:", coords);
        }
      }, 5000); // cada 5 segundos
    } catch (err) {
      console.error("Error al obtener ubicación:", err);
    }
  };

  enviarUbicacionPeriodica();

  return () => clearInterval(interval); // limpieza
}, []);
  // ⏱️ Temporizador
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        if (next >= 10) {
          clearInterval(timer);
          setIsAvailable(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View className="flex-1 bg-white justify-center items-center px-5">
      <View className="items-center mb-6">
        {isAvailable ? (
          <>
            <ActivityIndicator size="large" color="#007bff" className="mb-4" />
            <Text className="text-xl font-bold text-gray-800 text-center">
              Buscando tricimoto disponible...
            </Text>
            <Text className="text-base text-gray-600 mt-2">
              Tiempo transcurrido: {seconds} s
            </Text>
          </>
        ) : (
          <>
            <Text className="text-xl font-bold text-red-600 mt-4 text-center">
              No hay conductores disponibles.
            </Text>
            <TouchableOpacity
              className="bg-blue-600 py-3 px-8 rounded mt-6"
              onPress={() => {
                Alert.alert("Intentar de nuevo");
                router.replace("/EsperandoResScreen");
              }}
            >
              <Text className="text-white text-base font-semibold text-center">
                Intentar de nuevo
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <TouchableOpacity
        className="mt-4"
        onPress={() => router.replace("../(tabs)/home")}
      >
        <Text className="text-gray-500 text-base">Omitir</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EsperandoRespuestaScreen;
