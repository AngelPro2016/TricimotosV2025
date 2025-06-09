import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSignIn, useClerk } from "@clerk/clerk-expo";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

const ResetPasswordModal = ({ visible, onClose }) => {
  const { signIn, setActive } = useSignIn();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const sendCode = async () => {
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep(2);
    } catch (err) {
      Alert.alert("Error", err?.errors?.[0]?.message || "No se pudo enviar el código.");
    }
  };

  const confirmReset = async () => {
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Alert.alert("Éxito", "Contraseña actualizada.");
        onClose();
        setStep(1);
        setEmail("");
        setCode("");
        setNewPassword("");
      }
    } catch (err) {
      Alert.alert("Error", err?.errors?.[0]?.message || "Código o contraseña inválida.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <StyledView className="flex-1 bg-black/50 justify-center items-center">
        <StyledView className="bg-white w-11/12 p-6 rounded-2xl">
          {step === 1 ? (
            <>
              <StyledText className="text-xl font-bold text-center mb-4">
                Recuperar contraseña
              </StyledText>
              <StyledTextInput
                placeholder="Correo electrónico"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                className="border border-gray-300 px-4 py-2 rounded-lg mb-4"
                placeholderTextColor="#999"
              />
              <StyledTouchableOpacity
                onPress={sendCode}
                className="bg-blue-500 py-3 rounded-lg items-center"
              >
                <StyledText className="text-white font-semibold">Enviar código</StyledText>
              </StyledTouchableOpacity>
            </>
          ) : (
            <>
              <StyledText className="text-xl font-bold text-center mb-4">
                Ingresar código y nueva contraseña
              </StyledText>
              <StyledTextInput
                placeholder="Código recibido"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                className="border border-gray-300 px-4 py-2 rounded-lg mb-4"
                placeholderTextColor="#999"
              />
              <StyledTextInput
                placeholder="Nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                className="border border-gray-300 px-4 py-2 rounded-lg mb-4"
                placeholderTextColor="#999"
              />
              <StyledTouchableOpacity
                onPress={confirmReset}
                className="bg-green-600 py-3 rounded-lg items-center"
              >
                <StyledText className="text-white font-semibold">Reiniciar</StyledText>
              </StyledTouchableOpacity>
            </>
          )}

          <StyledTouchableOpacity
            onPress={() => {
              setStep(1);
              onClose();
            }}
            className="mt-4 items-center"
          >
            <StyledText className="text-gray-500">Cancelar</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </Modal>
  );
};

export default ResetPasswordModal;
