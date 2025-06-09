import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
<<<<<<< HEAD
import React, { useCallback, useState } from "react";
=======
import { useCallback, useState } from "react";
>>>>>>> df15065904df5640020b1b88635d9963568a3c7f
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";

const SignInTrici = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
<<<<<<< HEAD
    email: "",
=======
    username: "",
>>>>>>> df15065904df5640020b1b88635d9963568a3c7f
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
<<<<<<< HEAD
        identifier: form.email,
=======
        identifier: form.username, // ← username como identificador
>>>>>>> df15065904df5640020b1b88635d9963568a3c7f
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
<<<<<<< HEAD
        router.replace("/(root)/driver"); // Aquí rediriges a pantalla chofer (driver)
      } else {
        Alert.alert("Error", "Error al iniciar sesión. Intenta de nuevo.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.longMessage || "Error desconocido");
    }
  }, [isLoaded, form, signIn, setActive]);
=======
        router.replace("/(root)/(tabstrici)/home");
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Inicio de sesión fallido.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0]?.longMessage || "Ocurrió un error.");
    }
  }, [isLoaded, form]);
>>>>>>> df15065904df5640020b1b88635d9963568a3c7f

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
<<<<<<< HEAD
            label="Correo"
            placeholder="Ingresa tu correo electronico de tricimotero"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
=======
            label="Usuario"
            placeholder="Ingresa tu nombre de usuario"
            icon={icons.profile}
            textContentType="username"
            value={form.username}
            onChangeText={(value) => setForm({ ...form, username: value })}
>>>>>>> df15065904df5640020b1b88635d9963568a3c7f
          />

          <InputField
            label="Contraseña"
<<<<<<< HEAD
            placeholder="Ingresa tu contraseña de tricimotero"
=======
            placeholder="Ingresa tu contraseña"
>>>>>>> df15065904df5640020b1b88635d9963568a3c7f
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

<<<<<<< HEAD
          <CustomButton title="Iniciar Sesión" onPress={onSignInPress} className="mt-6" />

          <Link href="/welcome" className="text-lg text-center text-general-200 mt-10">
            ¿No tienes una cuenta como tricimotero? <Text className="text-primary-500">Ir al inicio</Text>
=======
          <CustomButton
            title="Iniciar Sesión"
            onPress={onSignInPress}
            className="mt-6"
          />

          <Link
            href="/welcome"
            className="text-lg text-center text-general-200 mt-10"
          >
            ¿No tienes una cuenta como tricimotero?{" "}
            <Text className="text-primary-500">Ir al inicio</Text>
>>>>>>> df15065904df5640020b1b88635d9963568a3c7f
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignInTrici;
