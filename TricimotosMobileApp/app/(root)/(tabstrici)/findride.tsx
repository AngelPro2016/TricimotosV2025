import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useNavigation } from "expo-router";
import { useNavigationContainerRef } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const SolicitudesTricimoteroScreen = () => {
  const { getToken } = useAuth();
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();

  useEffect(() => {

    return () => {
      navigation.setOptions?.({ tabBarStyle: undefined }); // Restaurar al salir
    };
  }, [navigation]);

  const fetchSolicitudes = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://192.168.8.64:8000/api/solicitud/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data);
      setSolicitudes(data);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
      Alert.alert("Error", "No se pudieron obtener las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  const aceptarSolicitud = async (id: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`http://192.168.10.170:8000/api/solicitud/aceptar/${id}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Error al aceptar solicitud");
      Alert.alert("Solicitud aceptada", "Has aceptado la carrera correctamente.");
      fetchSolicitudes();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const renderItem = ({ item }: any) => (
    <View className="bg-white p-4 mb-4 rounded-2xl shadow-md">
      <Text className="text-lg font-bold text-green-800 mb-2">
        Cliente: {item.cliente_clerk_id || "Desconocido"}
      </Text>
      <Text className="text-sm text-gray-700 mb-1">📍 Origen: {item.origen}</Text>
      <Text className="text-sm text-gray-700 mb-1">🎯 Destino: {item.destino}</Text>
      <Text className="text-sm text-gray-700 mb-3">
        🕒 Hora: {new Date(item.hora_programada).toLocaleString()}
      </Text>

      <TouchableOpacity
        onPress={() => aceptarSolicitud(item.id)}
        className="bg-green-700 py-2 rounded-lg items-center"
      >
        <Text className="text-white font-bold">Aceptar Solicitud</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      className="flex-1 bg-gray-50 px-4"
      style={{ paddingTop: insets.top, paddingBottom: Platform.OS === "ios" ? tabBarHeight : 20 }}
    >
      <Text className="text-2xl font-bold text-center text-green-800 mt-4 mb-4">
        Solicitudes Pendientes
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" className="mt-20" />
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              No hay solicitudes disponibles por ahora.
            </Text>
          }
        />
      )}
    </View>
  );
};

export default SolicitudesTricimoteroScreen;
