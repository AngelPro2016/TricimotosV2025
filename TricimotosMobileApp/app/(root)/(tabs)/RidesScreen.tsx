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

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        className="bg-white px-5 py-11"
      >
        <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
          Solicitar Carrera
        </Text>

        {address && (
          <>
            <Text className="text-center text-sm text-gray-700 mb-1">
              📍 Dirección: {address}
            </Text>
            <Text className="text-center text-xs text-gray-600 mb-4">
              Coordenadas: {location?.latitude.toFixed(5)},{" "}
              {location?.longitude.toFixed(5)}
            </Text>
          </>
        )}

        <TouchableOpacity
          onPress={getLocation}
          className="bg-green-600 py-3 rounded-lg mb-4 items-center"
        >
          <Text className="text-white font-semibold">
            📍 Obtener Ubicación Actual
          </Text>
        </TouchableOpacity>

        <TextInput
          className="h-12 border border-gray-300 bg-gray-50 px-4 rounded-lg mb-4"
          placeholder="Número de personas"
          keyboardType="numeric"
          value={numPeople}
          onChangeText={setNumPeople}
        />

        <TouchableOpacity
          onPress={showDatePicker}
          className="h-12 border border-gray-300 bg-gray-50 px-4 rounded-lg justify-center mb-4"
        >
          <Text className="text-gray-700">
            {time
              ? `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`
              : "Seleccionar hora de salida"}
          </Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="time"
          date={time || new Date()}
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />

        {location && (
          <MapView
            style={{ height: 220, borderRadius: 10, marginBottom: 20 }}
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
        )}

        <TouchableOpacity
          onPress={handleRequestRide}
          disabled={loading}
          className={`py-4 rounded-lg items-center ${
            loading ? "bg-gray-400" : "bg-orange-600"
          }`}
        >
          <Text className="text-white font-bold text-base">
            {loading ? "Solicitando..." : "Solicitar Carrera"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RidesScreen;
