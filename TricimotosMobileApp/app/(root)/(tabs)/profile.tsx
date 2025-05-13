import { useUser, useAuth } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // Reemplaza el historial para que el usuario no regrese al perfil
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="text-2xl font-JakartaBold my-5">Mi perfil</Text>

        <View className="flex items-center justify-center my-5">
          <Image
            source={{
              uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
            }}
            style={{ width: 110, height: 110, borderRadius: 55 }}
            className="border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>

        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <InputField
            label="First name"
            placeholder={user?.firstName || "Not Found"}
            containerStyle="w-full"
            inputStyle="p-3.5"
            editable={false}
          />
          <InputField
            label="Last name"
            placeholder={user?.lastName || "Not Found"}
            containerStyle="w-full"
            inputStyle="p-3.5"
            editable={false}
          />
          <InputField
            label="Email"
            placeholder={
              user?.primaryEmailAddress?.emailAddress || "Not Found"
            }
            containerStyle="w-full"
            inputStyle="p-3.5"
            editable={false}
          />
          <InputField
            label="Phone"
            placeholder={user?.primaryPhoneNumber?.phoneNumber || "Not Found"}
            containerStyle="w-full"
            inputStyle="p-3.5"
            editable={false}
          />
        </View>

        {/* Botón de Cerrar Sesión */}
        <CustomButton
          title="Cerrar sesión"
          onPress={handleSignOut}
          className="mt-8"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
