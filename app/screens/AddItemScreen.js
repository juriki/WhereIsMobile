import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, Image, Alert, StyleSheet, 
  Platform, ScrollView, TouchableOpacity 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location"; // Импорт GPS

const STORAGE_KEY = "itemsList";

const AddItemScreen = ({ route, navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [id, setId] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (route.params?.editItem) {
      setId(route.params.editItem.id);
      setName(route.params.editItem.name);
      setDescription(route.params.editItem.description);
      setImage(route.params.editItem.image);
      setLocation(route.params.editItem.location);
    }
  }, [route.params?.editItem]);

  useEffect(() => {
    navigation.setOptions({
      title: id ? "Muokkaa kohdetta" : "Lisää uusi kohde",
    });
  }, [navigation, id]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

        if (cameraStatus !== "granted" || galleryStatus !== "granted") {
          Alert.alert("Virhe", "Anna sovellukselle lupa käyttää kameraa ja galleriaa.");
        }

        if (locationStatus === "granted") {
          let currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        } else {
          Alert.alert("Virhe", "Anna sovellukselle lupa käyttää sijaintia.");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Virhe", "Anna nimi ja kuvaus!");
      return;
    }
  
    try {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
      let items = storedItems ? JSON.parse(storedItems) : [];
  
      // Показываем предупреждение, если местоположение недоступно, но не блокируем сохранение
      if (!location) {
        Alert.alert("Varoitus", "Sijaintia ei ole saatavilla. Tallenna silti ilman sijaintia.");
      }
  
      const newItem = {
        id: id || Date.now().toString(),
        name,
        description,
        image,
        location: location || null,  // Если местоположение отсутствует, сохраняем null
      };
  
      console.log("Saving new item:", newItem);
  
      if (id) {
        const index = items.findIndex((item) => item.id === id);
        if (index !== -1) {
          items[index] = newItem;
        }
      } else {
        items.push(newItem);
      }
  
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  
      // Полностью сбрасываем стек и переходим на ItemList
      navigation.reset({
        index: 0,
        routes: [{ name: "ItemList", params: { updated: true } }],
      });
  
    } catch (error) {
      console.error("Virhe tallennettaessa:", error);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{id ? "Muokkaa" : "Lisää uusi"}</Text>

      {/* Счётчик оставшихся символов для имени */}
      <View style={styles.charCountContainer}>
        <Text style={styles.charCount}>{30 - name.length} / 30</Text>
      </View>

      <TextInput
        placeholder="Nimi"
        value={name}
        onChangeText={(text) => {
          if (text.length <= 30) {
            setName(text);
          }
        }}
        style={styles.input}
      />

      <TextInput
        placeholder="Kuvaus"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.inputDescription}
      />

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity onPress={removeImage} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>❌</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={takePhoto} style={styles.button}>
        <Text style={styles.buttonText}>📷 Ota kuva</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>🖼 Valitse galleriasta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>💾 Tallenna</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  charCountContainer: {
    alignItems: "flex-end", // Выравниваем счётчик по правому краю
    marginBottom: 10,
  },
  charCount: {
    color: "#888",
    fontSize: 14,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  inputDescription: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    textAlignVertical: "top",
    maxHeight: 100,
  },
  imageContainer: {
    position: "relative",
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4682B4",
    padding: 12,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#32CD32",
    padding: 12,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddItemScreen;
