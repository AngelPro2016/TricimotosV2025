import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const EsperandoResScreen = () => {
  const [seconds, setSeconds] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev + 1 >= 30) {
          clearInterval(timer);
          setIsAvailable(false);
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const goToHome = () => {
    router.push('/(tabs)/home'); // 👈 Regresa a la pantalla principal del cliente
  };

  const handleSimulateAsignacion = () => {
    router.push('/(driver)/CarreraAsignadaScreen'); // 👈 Simulación de chofer asignado
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {isAvailable ? (
          <>
            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            <Text style={styles.title}>Buscando tricimoto disponible...</Text>
            <Text style={styles.subtitle}>Tiempo transcurrido: {seconds} s</Text>
          </>
        ) : (
          <>
            <Text style={styles.errorText}>No hay conductores disponibles.</Text>
            <TouchableOpacity style={styles.button} onPress={goToHome}>
              <Text style={styles.buttonText}>Regresar al Home</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#555', marginTop: 10 },
  loader: { marginBottom: 20 },
  errorText: { fontSize: 20, color: 'red', fontWeight: 'bold', marginTop: 20 },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
});

export default EsperandoResScreen;
