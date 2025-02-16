import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "itemsList";

const EditItemScreen = ({ route }) => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [id, setId] = useState(null);
  const [location, setLocation] = useState(null); // Для GPS

  useEffect(() => {
    if (route.params?.editItem) {
      setId(route.params.editItem.id);
      setName(route.params.editItem.name);
      setDescription(route.params.editItem.description);
      setImage(route.params.editItem.image);
      setLocation(route.params.editItem.location); // Получаем GPS-метку
    }
  }, [route.params?.editItem]);

  useEffect(() => {
    navigation.setOptions({ title: "Muokkaa" });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert("Lupa vaaditaan", "Anna sovellukselle lupa käyttää kameraa ja galleriaa.");
      }
    })();
  }, []);

  const pickImageFromGallery = async () => {
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

  const handleDeleteItem = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
      let items = storedItems ? JSON.parse(storedItems) : [];
      items = items.filter((item) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      navigation.goBack();
    } catch (error) {
      console.error("Virhe poistaessa kohdetta:", error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Virhe", "Anna nimi ja kuvaus!");
      return;
    }
  
    // Ограничиваем длину названия до 30 символов
    const trimmedName = name.length > 30 ? name.slice(0, 30) : name;
  
    try {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
      let items = storedItems ? JSON.parse(storedItems) : [];
  
      // Если местоположение не задано, показываем предупреждение, но разрешаем сохранить
      if (!location) {
        Alert.alert("Varoitus", "Sijaintia ei ole saatavilla. Tallenna silti ilman sijaintia.");
      }
  
      const updatedItem = { id, name: trimmedName, description, image, location: location || null };
      const index = items.findIndex((item) => item.id === id);
      if (index !== -1) {
        items[index] = updatedItem;
      }
  
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  
      navigation.reset({
        index: 0,
        routes: [{ name: "ItemList", params: { updated: true } }],
      });
    } catch (error) {
      console.error("Virhe tallennettaessa muutoksia:", error);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Muokkaa kohdetta</Text>

      {/* Счётчик оставшихся символов выше поля ввода */}
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
          <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
            <Text style={styles.removeImageText}>❌</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>📷 Ota kuva</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
        <Text style={styles.buttonText}>🖼 Valitse galleriasta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "green" }]} onPress={handleSave}>
        <Text style={styles.buttonText}>💾 Tallenna muutokset</Text>
      </TouchableOpacity>

      {id && (
        <TouchableOpacity style={[styles.button, { backgroundColor: "red" }]} onPress={handleDeleteItem}>
          <Text style={styles.buttonText}>🗑 Poista kohde</Text>
        </TouchableOpacity>
      )}
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
    alignSelf: "center",
    marginTop: 15,
  },
  image: {
    width: 210,
    height: 210,
    borderRadius: 10,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#4682B4",
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#32CD32",
  },
  deleteButton: {
    backgroundColor: "#DC143C",
  },
});

export default EditItemScreen;
