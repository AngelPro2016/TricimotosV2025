import { useUser, useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import CustomButton from "@/components/CustomButton";
import { BASE_URL } from "@/constants/env";
const RidesScreen = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se requiere acceso a la ubicación.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);

      const [placemark] = await Location.reverseGeocodeAsync(current.coords);
      if (placemark) {
        setAddress(`${placemark.name}, ${placemark.city}`);
      }
    } catch (error) {
      Alert.alert("Error de ubicación", error.message);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleRequestRide = async () => {
    if (!location) {
      Alert.alert("Ubicación no disponible", "Asegúrate de haber otorgado permisos.");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const payload = {
        origen: address,
        destino: destinationAddress || "Destino pendiente",
        hora_programada: new Date().toISOString(),
        cliente_clerk_id: user?.id,
        cliente_first_name: user?.firstName,
        cliente_last_name: user?.lastName,
      };

      const res = await fetch(`${BASE_URL}/api/solicitud/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Error al solicitar.");

      router.push({
        pathname: "/EsperandoResScreen",
        params: {
          ...payload,
          solicitud_id: data.id,
        },
      });
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-general-500 px-5 pt-10"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-JakartaExtraBold mb-5 text-center">
          Solicitar Carrera
        </Text>

        <View className="bg-white p-4 rounded-2xl shadow-md shadow-neutral-300 mb-4">
          <Text className="text-gray-600 mb-2 font-semibold">Destino (opcional)</Text>
          <TextInput
            className="text-base text-gray-900"
            placeholder="Ingresa dirección del destino..."
            placeholderTextColor="#999"
            value={destinationAddress}
            onChangeText={setDestinationAddress}
          />
        </View>
        <View className="mt-6">
          <Text className="font-semibold text-md mb-1">Ubicación actual:</Text>
          <Text className="text-gray-700">{address || "Obteniendo ubicación..."}</Text>
        </View>

        {location ? (
          <MapView
            style={{ height: 180, marginVertical: 20, borderRadius: 12 }}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker coordinate={location} />
          </MapView>
        ) : (
          <ActivityIndicator className="mt-4" />
        )}

        <CustomButton
          title={loading ? "Solicitando..." : "Solicitar Carrera"}
          onPress={handleRequestRide}
          disabled={loading}
          className="mt-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RidesScreen;
