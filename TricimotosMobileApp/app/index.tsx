import { Redirect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { View, ActivityIndicator } from "react-native";

const Home = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;

  const role = user?.publicMetadata?.role;

  if (role === "tricimotero") {
    return <Redirect href="/(tabstrici)/home" />;
  } else {
    return <Redirect href="/(tabs)/home" />;
  }
};

export default Home;
