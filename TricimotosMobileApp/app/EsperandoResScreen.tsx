import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import LottieView from "lottie-react-native";
import animationData from "@/assets/animations/waiting.json";
import { BASE_URL } from "@/constants/env";

const EsperandoRespuestaScreen = () => {
  const { origen, destino, hora,solicitud_id  } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [rideInfo, setRideInfo] = useState(null);
  const router = useRouter();
  console.log("ID de solicitud:", solicitud_id);
  // 🔁 Temporizador de espera
  useEffect(() => {
    let timer = setInterval(() => {
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

  // 📡 Polling de estado
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
            clearInterval(interval);
            router.replace({
              pathname: "/ProcesoDeRecogida",
              params: { tricimotero: data.asignado, origen, destino, hora },
            });
          }
        }
      } catch (err) {
        console.error("Error al verificar estado de la solicitud:", err);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔎 Consultar el Ride activo para tener el ID
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
          setRideInfo(data[0]);
          console.log("ride activo:", data[0]);
        }
      } catch (error) {
        console.error("❌ Error al consultar ride activo:", error);
      }
    };

    consultarRideActivo();
  }, []);

const handleCancelar = async () => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/api/solicitud/${solicitud_id}/cancelar/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data?.detail || "Error al cancelar.");

    Alert.alert("Solicitud cancelada");
    router.replace("../(tabs)/home");
  } catch (err) {
    Alert.alert("Error", err.message);
  }
};

  // ⏳ Esperar más tiempo
  const esperarMas = () => {
    setIsAvailable(true);
    setSeconds(0); // reinicia temporizador
  };

  return (
    <View
      className="flex-1 justify-center items-center px-5"
      style={{ backgroundColor: "#e0ffe0" }}
    >
      <LottieView
        source={animationData}
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
              className="bg-green-600 py-3 px-8 rounded mt-6"
              onPress={esperarMas}
            >
              <Text className="text-white text-base font-semibold text-center">
                Esperar 5 minutos más
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity
        className="mt-4"
        onPress={handleCancelar}
      >
        <Text className="text-gray-500 text-base">CANCELAR</Text>
      </TouchableOpacity>
    </View>
  );
};

EsperandoRespuestaScreen.options = {
  headerShown: false,
};

export default EsperandoRespuestaScreen;
