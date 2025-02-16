import React, { useRef, useState, useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

const ImageScreen = ({ route, navigation }) => {
  const [scale, setScale] = useState(1);
  const pinchRef = useRef(null);
  const [validUri, setValidUri] = useState(null);

  useEffect(() => {
    const { imageUri } = route.params || {};

    if (!imageUri) {
      Alert.alert("Virhe", "Kuvaa ei löydy."); // Ошибка, если URI не передан
      navigation.goBack();
      return;
    }

    console.log("Получен imageUri:", imageUri);
    setValidUri(imageUri);
  }, [route.params]);

  const onPinchGestureEvent = (event) => {
    setScale(event.nativeEvent.scale);
  };

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setScale(1);
    }
  };

  const handleImagePress = () => {
    navigation.goBack(); // Закрываем экран при нажатии на изображение
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        maximumZoomScale={3}
        minimumZoomScale={1}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <PinchGestureHandler
          ref={pinchRef}
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchHandlerStateChange}
        >
          <View style={styles.imageWrapper}>
            {validUri ? (
              <TouchableOpacity onPress={handleImagePress}>
                <Image source={{ uri: validUri }} style={[styles.image, { transform: [{ scale }] }]} />
              </TouchableOpacity>
            ) : (
              <Text style={styles.errorText}>Kuvaa ei voitu ladata</Text>
            )}
          </View>
        </PinchGestureHandler>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  errorText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
});

export default ImageScreen;
