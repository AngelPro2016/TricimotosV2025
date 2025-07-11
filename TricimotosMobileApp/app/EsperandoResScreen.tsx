import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import LottieView from "lottie-react-native";  // Para usar la animación de JSON
import animationData from "@/assets/animations/waiting.json";  // Ruta de la animación JSON
import { BASE_URL } from "@/constants/env";
const EsperandoRespuestaScreen = () => {
  const { origen, destino, hora } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const router = useRouter();
  // ⏱️ Temporizador
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        if (next >= 300) {
          clearInterval(timer);
          setIsAvailable(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/estado-solicitud/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.estado === "aceptada") {
          Alert.alert("Solicitud aceptada por un conductor.");
          console.log("✅ Solicitud aceptada por:", data.asignado);
          clearInterval(interval);  // Detener polling
          router.replace({
            pathname: "/ProcesoDeRecogida",
            params: {
              tricimotero: data.asignado,
              origen,
              destino,
              hora,
            },
          });
        }
      }
    } catch (err) {
      console.error("Error al verificar estado de la solicitud:", err);
    }
  }, 5000); // cada 5 segundos

  return () => clearInterval(interval);
}, []);

  return (
    <View
      className="flex-1 justify-center items-center px-5"
      style={{ backgroundColor: "#e0ffe0" }} // Fondo verde claro
    >
      <LottieView
        source={animationData} // Ruta de la animación
        autoPlay
        loop
        style={{
          top: -70,
          width: 250,
          height: 250,
          marginBottom: -50,
        }}
      />
      <View className="items-center mb-6">
        {isAvailable ? (
          <>
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
        <Text className="text-gray-500 text-base">OMITIR</Text>
      </TouchableOpacity>
    </View>
  );
};

// Opción para ocultar el encabezado (barra de nombre de la pantalla)
EsperandoRespuestaScreen.options = {
  headerShown: false, // Esto ocultará la barra de título
};

export default EsperandoRespuestaScreen;
