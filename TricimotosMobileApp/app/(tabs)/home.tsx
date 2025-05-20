import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const Home = () => {
  const router = useRouter();
  const [location] = useState({ latitude: -1.046, longitude: -79.460 });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>👋 ¡Bienvenido a GoMoto!</Text>

      <Image
        source={require('../../assets/images/adaptive-icon.png')}
        style={styles.banner}
        resizeMode="cover"
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicación de referencia:</Text>
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} title="Tú estás aquí" />
        </MapView>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/RidesScreen')}>
          <Text style={styles.buttonText}>🚕 Solicitar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => alert('Historial no implementado')}>
          <Text style={styles.buttonText}>📜 Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => alert('Soporte no implementado')}>
          <Text style={styles.buttonText}>🛠 Soporte</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📰 Noticias</Text>
        <View style={styles.newsCard}>
          <Text style={styles.newsText}>Nueva zona habilitada: Barrio El Progreso</Text>
          <Text style={styles.newsDate}>20 de mayo, 2025</Text>
        </View>
        <View style={styles.newsCard}>
          <Text style={styles.newsText}>Atención: mantenimiento en el sistema este sábado</Text>
          <Text style={styles.newsDate}>19 de mayo, 2025</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  greeting: { fontSize: 24, fontWeight: 'bold', margin: 20, textAlign: 'center', color: '#FF5733' },
  banner: { width: '100%', height: 180, borderRadius: 10 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  map: { width: '100%', height: 180, borderRadius: 10 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: width / 3.2,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  newsCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  newsText: { fontSize: 16, color: '#333' },
  newsDate: { fontSize: 12, color: '#888', marginTop: 5 },
});

export default Home;
