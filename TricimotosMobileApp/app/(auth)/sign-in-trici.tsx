import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";

const SignInTrici = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/driver"); // Aquí rediriges a pantalla chofer (driver)
      } else {
        Alert.alert("Error", "Error al iniciar sesión. Intenta de nuevo.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.longMessage || "Error desconocido");
    }
  }, [isLoaded, form, signIn, setActive]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Bienvenido Tricimotero 👋
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Correo"
            placeholder="Ingresa tu correo electronico de tricimotero"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Contraseña"
            placeholder="Ingresa tu contraseña de tricimotero"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton title="Iniciar Sesión" onPress={onSignInPress} className="mt-6" />

          <Link href="/welcome" className="text-lg text-center text-general-200 mt-10">
            ¿No tienes una cuenta como tricimotero? <Text className="text-primary-500">Ir al inicio</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignInTrici;
