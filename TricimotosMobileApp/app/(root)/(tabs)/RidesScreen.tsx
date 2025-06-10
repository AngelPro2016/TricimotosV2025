import React, { useState, useEffect } from "react";
import {
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { DateTimePickerModal } from "react-native-modal-datetime-picker";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";  // Importar useFocusEffect

const RidesScreen = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [numPeople, setNumPeople] = useState("");
  const [time, setTime] = useState<Date | null>(new Date());
  const [location, setLocation] = useState<any>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se requiere acceso a la ubicación.");
      return;
    }
    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);

    const [placemark] = await Location.reverseGeocodeAsync(
      currentLocation.coords
    );
    if (placemark) {
      const { street, city, region } = placemark;
      setAddress(`${street}, ${city}, ${region}`);
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);

  const handleConfirm = (date: Date) => {
    setTime(date);
    setDatePickerVisibility(false);
  };

  const handleRequestRide = async () => {
    if (!location || !numPeople || !time || !address) {
      Alert.alert("Faltan datos", "Completa todos los campos para continuar.");
      return;
    }

    const now = new Date();
    const minValidTime = new Date(now.getTime() + 10 * 60000);
    if (time < minValidTime) {
      Alert.alert("Hora inválida", "La hora debe ser al menos 10 minutos en el futuro.");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      const payload = {
        origen: address,
        destino: "Destino pendiente",  // Puedes reemplazarlo por otro input en el futuro
        hora_programada: time.toISOString(),
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
      console.log("✅ Respuesta backend:", data);

      if (!res.ok) throw new Error(data?.detail || "Error al solicitar.");

      router.push({
        pathname: "/EsperandoResScreen",
        params: payload,  // reenvía origen, destino y hora
      });

    } catch (err: any) {
      console.error("❌ Error al enviar solicitud:", err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  // Reiniciar las animaciones al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // Aquí se reinician las animaciones
      console.log("Pantalla enfocada, reiniciando animaciones...");
      // Puedes realizar acciones adicionales para reiniciar el estado de las animaciones aquí
      return () => {
        console.log("Pantalla no está activa");
      };
    }, [])
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        className="bg-white px-5 py-11"
      >
        {/* Fondo animado con figuras geométricas */}
        <Animatable.View
          animation="fadeInDownBig"
          delay={200}
          style={styles.backgroundFigure1}
        />
        <Animatable.View
          animation="fadeInUpBig"
          delay={400}
          style={styles.backgroundFigure2}
        />

        {/* Título animado como el de COMTRILAMANA */}
        <Animatable.Text
          animation="bounceIn"
          className="text-4xl font-extrabold text-center text-green-700 mb-6"
          style={styles.title}
        >
          Solicitar Carrera
        </Animatable.Text>

        {address && (
          <>
            <Animatable.View animation="fadeInUp" delay={500} style={styles.container}>
              <Text className="text-center text-lg text-gray-700 mb-2">
                📍 Dirección: {address}
              </Text>
              <Text className="text-center text-sm text-gray-500 mb-6">
                Coordenadas: {location?.latitude.toFixed(5)}, {location?.longitude.toFixed(5)}
              </Text>
            </Animatable.View>
          </>
        )}

        {/* Botón para obtener ubicación */}
        <Animatable.View animation="zoomIn" delay={600}>
          <TouchableOpacity
            onPress={getLocation}
            className="bg-green-600 py-3 rounded-lg mb-6 items-center"
          >
            <Text className="text-white font-semibold">
              <Icon name="map-marker" size={24} color="white" /> Obtener Ubicación Actual
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Input de número de personas */}
        <Animatable.View animation="fadeIn" delay={700}>
          <TextInput
            className="h-14 border border-gray-300 bg-gray-50 px-5 rounded-lg mb-6 text-lg"
            placeholder="Número de personas"
            keyboardType="numeric"
            value={numPeople}
            onChangeText={setNumPeople}
          />
        </Animatable.View>

        {/* Seleccionar hora */}
        <Animatable.View animation="fadeIn" delay={800}>
          <TouchableOpacity
            onPress={showDatePicker}
            className="h-14 border border-gray-300 bg-gray-50 px-5 rounded-lg justify-center mb-6"
          >
            <Text className="text-gray-700 text-lg">
              {time
                ? `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`
                : "Seleccionar hora de salida"}
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* DateTime Picker */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="time"
          date={time || new Date()}
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />

        {/* Mapa de ubicación */}
        {location && (
          <Animatable.View animation="fadeIn" delay={900}>
            <MapView
              style={{ height: 240, borderRadius: 15, marginBottom: 20 }}
              region={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
              />
            </MapView>
          </Animatable.View>
        )}

        {/* Botón de solicitar carrera */}
        <Animatable.View animation="bounceIn" delay={1000}>
          <TouchableOpacity
            onPress={handleRequestRide}
            disabled={loading}
            className={`py-5 rounded-lg items-center ${loading ? "bg-gray-400" : "bg-orange-600"}`}
          >
            <Text className="text-white font-bold text-xl">
              {loading ? "Solicitando..." : "Solicitar Carrera"}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
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
    fontSize: 40,
  },
  container: {
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "#ffffffcc",
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  backgroundFigure1: {
    position: "absolute",
    top: 0,
    left: -100,
    width: 300,
    height: 300,
    backgroundColor: "#c8e6c9",
    transform: [{ rotate: "-30deg" }],
    opacity: 0.3,
    zIndex: 0,
  },
  backgroundFigure2: {
    position: "absolute",
    bottom: 0,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: "#f0f4c3",
    transform: [{ rotate: "15deg" }],
    opacity: 0.3,
    zIndex: 0,
  },
};

export default RidesScreen;
