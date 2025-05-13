import { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import { icons } from '@/constants';
import { GoogleInputProps } from '@/types/type';

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    };

    fetchLocation();
  }, []);

  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <GooglePlacesAutocomplete
        fetchDetails={true}
        placeholder="Search"
        debounce={200}
        styles={{
          textInputContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            marginHorizontal: 20,
            position: 'relative',
            shadowColor: '#d4d4d4',
          },
          textInput: {
            backgroundColor: textInputBackgroundColor || 'white',
            fontSize: 16,
            fontWeight: '600',
            marginTop: 5,
            width: '100%',
            borderRadius: 200,
          },
          listView: {
            backgroundColor: textInputBackgroundColor || 'white',
            position: 'relative',
            top: 0,
            width: '100%',
            borderRadius: 10,
            shadowColor: '#d4d4d4',
            zIndex: 99,
          },
        }}
        onPress={(data, details = null) => {
          handlePress({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            address: data.description,
          });
        }}
        query={{
          key: googlePlacesApiKey,
          language: 'es',
          location: currentLocation ? `${currentLocation.latitude},${currentLocation.longitude}` : undefined,
          radius: 10000, // Ajustar el radio según sea necesario
        }}
        renderLeftButton={() => (
          <View className="justify-center items-center w-6 h-6">
            <Image
              source={icon || icons.search}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
        )}
        textInputProps={{
          placeholderTextColor: 'gray',
          placeholder: initialLocation ?? "¿A dónde quieres ir?",
        }}
      />
    </View>
  );
};

export default GoogleTextInput;
