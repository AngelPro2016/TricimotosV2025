import React, { useState, useEffect } from "react";
import {
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { DateTimePickerModal } from "react-native-modal-datetime-picker";
import { useRouter } from "expo-router";
import { useAuth,useUser } from "@clerk/clerk-expo";
import LottieView from "lottie-react-native";  // Para usar la animación de JSON
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Llamar al archivo JSON de animación para el fondo
import animationData from "../(tabs)/Animation - 1749685777879.json"; // Asegúrate de que esta ruta apunte al archivo correcto

const RidesScreen = () => {
  const router = useRouter();
  const { getToken} = useAuth();
  const { user } = useUser();
  const [numPeople, setNumPeople] = useState("");
  const [time, setTime] = useState<Date | null>(new Date());
  const [location, setLocation] = useState<any>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [mapType, setMapType] = useState("standard"); // Estado para controlar el tipo de mapa

  const getLocation = async () => {
    console.log("Solicitando permisos de ubicación...");
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permiso denegado para ubicación");
      Alert.alert("Permiso denegado", "Se requiere acceso a la ubicación.");
      return;
    }

    console.log("Obteniendo ubicación...");
    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);

    console.log("Ubicación obtenida:", currentLocation.coords);

    const [placemark] = await Location.reverseGeocodeAsync(currentLocation.coords);
    if (placemark) {
      const { street, city, region } = placemark;
      setAddress(`${street}, ${city}, ${region}`);
      console.log("Dirección obtenida:", `${street}, ${city}, ${region}`);
    }
  };

  const showDatePicker = () => {
    console.log("Mostrando selector de fecha...");
    setDatePickerVisibility(true);
  };

  const handleConfirm = (date: Date) => {
    console.log("Hora seleccionada:", date);
    setTime(date);
    setDatePickerVisibility(false);
  };

  const handleRequestRide = async () => {
    if (!location || !numPeople || !time || !address) {
      console.log("Faltan datos: ", { location, numPeople, time, address });
      Alert.alert("Faltan datos", "Completa todos los campos para continuar.");
      return;
    }

    const now = new Date();
    const minValidTime = new Date(now.getTime() + 10 * 60000);
    if (time < minValidTime) {
      console.log("Hora seleccionada es inválida:", time);
      Alert.alert("Hora inválida", "La hora debe ser al menos 10 minutos en el futuro.");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      console.log("Token obtenido:", token);

      // Obtener el user.id de Clerk
      const userId = user?.id;
      console.log("User ID de Clerk:", userId);

      const payload = {
        origen: address,
        destino: "Destino pendiente",  // Puedes reemplazarlo por otro input en el futuro
        hora_programada: time.toISOString(),
        cliente_clerk_id: userId,  // Incluir el user.id de Clerk en el payload
      };

      console.log("📦 Payload:", payload);

      const res = await fetch("http://192.168.10.170:8000/api/solicitud/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Respuesta del backend:", data);

      if (!res.ok) throw new Error(data?.detail || "Error al solicitar.");

      console.log("Redirigiendo a la pantalla de espera...");
      router.push({
        pathname: "/EsperandoResScreen",
        params: payload,  // Reenvía origen, destino, hora y user_id
      });

    } catch (err: any) {
      console.error("Error al enviar solicitud:", err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
      console.log("Proceso de solicitud terminado.");
    }
  };

  useEffect(() => {
    console.log("Componente montado, obteniendo ubicación...");
    getLocation();
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        className="px-5 py-11"
        style={{ backgroundColor: "#e0ffe0" }} // Fondo verde claro
      >
        {/* Fondo animado de Lottie (JSON) */}
        <LottieView
          source={animationData} // Ruta de la animación
          autoPlay
          loop
          style={{
            position: "absolute",
            width: "100%",
            height: 400, // Ajustado para que cubra la parte superior de la pantalla
            top: 100,
            left: 0,
            zIndex: -1, // Coloca la animación detrás del contenido
          }}
        />

        {/* Título de la pantalla */}
        <Text
          className="text-4xl font-bold text-center text-green-700 mb-4"
          style={styles.title}
        >
          Solicitar Carrera
        </Text>

        {/* Dirección y coordenadas */}
        {address && (
          <View style={styles.container}>
            <Text className="text-center text-lg text-black font-semibold mb-2">
              <Icon name="map-marker" size={20} color="red" /> Dirección: {address}
            </Text>
            <Text className="text-center text-sm text-gray-700 mb-6">
              Coordenadas: {location?.latitude.toFixed(5)}, {location?.longitude.toFixed(5)}
            </Text>
          </View>
        )}

        {/* Botón de obtener ubicación */}
        <TouchableOpacity
          onPress={getLocation}
          className="bg-yellow-500 py-2 rounded-lg mb-4 items-center"
        >
          <Text className="text-white font-semibold">
            <Icon name="map-marker" size={24} color="white" /> Obtener Ubicación Actual
          </Text>
        </TouchableOpacity>

        {/* Input de número de personas */}
        <TextInput
          className="h-12 border border-gray-300 bg-gray-50 px-4 rounded-lg mb-4 text-lg"
          placeholder="Número de personas"
          keyboardType="numeric"
          value={numPeople}
          onChangeText={setNumPeople}
        />

        {/* Seleccionar hora */}
        <TouchableOpacity
          onPress={showDatePicker}
          className="h-12 border border-gray-300 bg-gray-50 px-4 rounded-lg justify-center mb-4"
        >
          <Text className="text-gray-700 text-lg">
            {time
              ? `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`
              : "Seleccionar hora de salida"}
          </Text>
        </TouchableOpacity>

        {/* DateTime Picker */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="time"
          date={time || new Date()}
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />

        {/* Mapa de ubicación con tamaño ajustado y vista satelital o de calles */}
        {location && (
          <MapView
            style={{ height: 180, borderRadius: 12, marginBottom: 10 }} // Mapa más pequeño
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,  // Ajusta el zoom para acercarse más
              longitudeDelta: 0.005,
            }}
            zoomEnabled={true} // Habilita el zoom
            scrollEnabled={true} // Habilita el desplazamiento
            mapType={mapType} // Tipo de mapa (satellite o standard)
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
            />
          </MapView>
        )}

        {/* Botones para cambiar el tipo de mapa */}
        <View className="flex-row justify-center space-x-4 mb-4">
          <TouchableOpacity
            className="bg-green-600 py-2 px-6 rounded-lg"
            onPress={() => setMapType("standard")}
          >
            <Text className="text-white font-semibold">Calles</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-600 py-2 px-6 rounded-lg"
            onPress={() => setMapType("satellite")}
          >
            <Text className="text-white font-semibold">Satélite</Text>
          </TouchableOpacity>
        </View>

        {/* Botón de solicitar carrera */}
        <TouchableOpacity
          onPress={handleRequestRide}
          disabled={loading}
          className={`py-3 rounded-lg items-center ${loading ? "bg-gray-400" : "bg-green-600"}`}
        >
          <Text className="text-white font-bold text-xl">
            {loading ? "Solicitando..." : "Solicitar Carrera"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  title: {
    textShadowColor: "#a5d6a7",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 3,
    fontSize: 32,
  },
  container: {
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9", // Color de fondo más claro para la dirección
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
};

export default RidesScreen;
