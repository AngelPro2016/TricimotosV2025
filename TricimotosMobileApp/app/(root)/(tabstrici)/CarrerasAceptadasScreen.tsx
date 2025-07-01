import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CarrerasAceptadasScreen = () => {
  const { getToken } = useAuth();
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const token = await getToken();
        const response = await fetch('http://192.168.10.170:8000/api/carreras/aceptadas/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('No se pudieron cargar las carreras');
        }
        const data = await response.json();
        setCarreras(data);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarreras();
  }, []);
  

  const renderItem = ({ item }: any) => (
    <View style={{ backgroundColor: 'white', padding: 10, marginBottom: 10, borderRadius: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Origen: {item.origen}</Text>
      <Text>Destino: {item.destino}</Text>
      <Text>Hora Programada: {new Date(item.hora_programada).toLocaleString()}</Text>
      <Text>Estado: {item.estado}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        Carreras Aceptadas
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" />
      ) : (
        <FlatList
          data={carreras}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No tienes carreras aceptadas por ahora.</Text>}
        />
      )}
    </View>
  );
};

export default CarrerasAceptadasScreen;
