import React from "react";
import { View, Text } from "react-native";
import LottieView from "lottie-react-native";

const Confirmacion = () => {
    return (
        <View style={{ flex: 1, backgroundColor: "#ffffff", justifyContent: "center", alignItems: "center" }}>
            <LottieView
                source={require("@/assets/animations/Success.json")}
                autoPlay
                loop={true}
                style={{ width: 200, height: 200, marginBottom: 20 }}
            />
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#22c55e", textAlign: "center" }}>
                ¡Gracias por usar nuestros servicios!
            </Text>
        </View>
    );
};

export default Confirmacion;
