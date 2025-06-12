import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const Home = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botón cerrar sesión */}
      <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
        <Icon name="logout" size={28} color="#2e7d32" />
      </TouchableOpacity>

      {/* Figuras decorativas */}
      <View style={styles.decorativeLine1} />
      <View style={styles.decorativeLine2} />

      {/* Logotipo */}
      <Animatable.Image
        animation="bounceIn"
        duration={1500}
        source={require("../(tabs)/logotrici.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={3000}
        easing="ease-in-out"
        style={styles.titleContainer}
      >
        <Text style={styles.titleText}>COMTRILAMANA</Text>
      </Animatable.View>

      {/* Cuadro: Descripción */}
      <Animatable.View animation="fadeInUp" delay={400} style={styles.textBox}>
        <Text style={styles.description}>
          Nuestra app te conecta con tricimotos seguras, rápidas y económicas
          para moverte por la ciudad sin complicaciones.
        </Text>
      </Animatable.View>

      {/* Cuadro: Funcionalidades */}
      <Animatable.View animation="zoomIn" delay={700} style={styles.textBox}>
        <Text style={styles.featureTitle}>
          ¿Qué puedes hacer con COMTRILAMANA?
        </Text>

        <View style={styles.featureItem}>
          <Icon name="motorbike" size={24} color="#2e7d32" />
          <Text style={styles.featureText}>
            Solicitar una tricimoto en tiempo real.
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="map-marker-path" size={24} color="#2e7d32" />
          <Text style={styles.featureText}>Explorar rutas seguras y rápidas.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="account-clock" size={24} color="#2e7d32" />
          <Text style={styles.featureText}>Reservar tu viaje con anticipación.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="headset" size={24} color="#2e7d32" />
          <Text style={styles.featureText}>Acceder a soporte al cliente 24/7.</Text>
        </View>
      </Animatable.View>

      {/* Íconos destacando valores */}
      <View style={styles.iconsContainer}>
        <Animatable.View animation="bounceIn" delay={1000} style={styles.iconBox}>
          <Icon name="map" size={40} color="#fff" />
          <Text style={styles.iconLabel}>Mapa</Text>
        </Animatable.View>
        <Animatable.View animation="bounceIn" delay={1200} style={styles.iconBox}>
          <Icon name="shield-check" size={40} color="#fff" />
          <Text style={styles.iconLabel}>Seguridad</Text>
        </Animatable.View>
        <Animatable.View animation="bounceIn" delay={1400} style={styles.iconBox}>
          <Icon name="cash-fast" size={40} color="#fff" />
          <Text style={styles.iconLabel}>Económico</Text>
        </Animatable.View>
      </View>

      {/* CTA */}
      <Animatable.View animation="pulse" iterationCount="infinite" delay={2000}>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}></Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  container: {
    backgroundColor: "#e0ffe0",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  logo: {
    width: 187,
    height: 187,
    marginBottom: 10,
    zIndex: 2,
  },
  textBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  titleContainer: {
    backgroundColor: "#ffffffee",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderWidth: 2,
    borderColor: "#2e7d32",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 10,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2e7d32",
    textAlign: "center",
    textShadowColor: "#a5d6a7",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 2,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#333",
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#333",
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 25,
    width: "100%",
  },
  iconBox: {
    backgroundColor: "#fdd835",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: width * 0.25,
    marginHorizontal: 5,
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    color: "#2e7d32",
  },
  ctaButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    marginBottom: 30,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  decorativeLine1: {
    position: "absolute",
    top: 100,
    left: -100,
    width: width * 1.5,
    height: 100,
    backgroundColor: "#c8e6c9",
    transform: [{ rotate: "-10deg" }],
    zIndex: 0,
  },
  decorativeLine2: {
    position: "absolute",
    bottom: 150,
    right: -100,
    width: width * 1.5,
    height: 100,
    backgroundColor: "#f0f4c3",
    transform: [{ rotate: "15deg" }],
    zIndex: 0,
  },
});

export default Home;
