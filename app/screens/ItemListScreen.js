import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from 'react-native';

const STORAGE_KEY = "itemsList";

const ItemListScreen = ({ route }) => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: "Muistiinpanot" });
  }, [navigation]);

  useEffect(() => {
    if (route.params?.updated) {
      loadItems();
    }
  }, [route.params?.updated]);

  const loadItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        setItems(parsedItems);

        if (parsedItems.length === 0) {
          navigation.navigate("Entry");
        }
      }
    } catch (error) {
      console.error("Virhe ladattaessa tietoja:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      Alert.alert("Poista", "Haluatko varmasti poistaa tämän kohteen?", [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Poista",
          onPress: async () => {
            const filteredItems = items.filter((item) => item.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems));
            setItems(filteredItems);
            if (filteredItems.length === 0) {
              navigation.navigate("Entry");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Virhe poistettaessa kohdetta:", error);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const openMapScreen = () => {



    if (selectedItem && selectedItem.location) {
      console.log("Selected item location:", selectedItem.location); // Проверка координат
  
      // Переход к экрану карты с передачей координат
      navigation.navigate("MapScreen", {
        coordinates: selectedItem.location,
        title: selectedItem.name,
      });
  
      // Закрытие модального окна
      setModalVisible(false); // Закрываем модальное окно
    } else {
      console.log('Передача в MapScreen:', coordinates, title);
      Alert.alert("Virhe", "Tämän kohteen sijaintia ei löytynyt.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Button title="➕ Lisää uusi" onPress={() => navigation.navigate("AddItem")} />

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Hae nimellä..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => openModal(item)} 
            style={[
              styles.itemContainer, 
              selectedItem?.id === item.id && styles.selectedItem // Если выбран, делаем фон светло-серым
            ]}
          >
            <View style={styles.firstRow}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              )}
            </View>

            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.itemDescription}>
              {item.description}
            </Text>

            <View style={styles.buttonContainer}>
              <Button title="Muokkaa" onPress={() => navigation.navigate("EditItem", { editItem: item })} />
              <Button title="Poista" color="red" onPress={() => deleteItem(item.id)} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Ei tuloksia</Text>}
      />

      {/* Модальное окно */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            
            {/* Заголовок фиксирован сверху */}
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>

            {/* Кнопка GPS фиксирована в углу */}
            {selectedItem?.location && (
              <TouchableOpacity 
                style={styles.gpsButton}
                onPress={openMapScreen} // Вызовем функцию для открытия карты
              >
                <Text style={styles.gpsButtonText}>📍 GPS</Text>
              </TouchableOpacity>
            )}

            {/* Прокручиваемая область (текст + фото) */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {/* Нажатие на изображение открывает экран с фото */}
              {selectedItem?.image && (
                <TouchableOpacity onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("ImageScreen", { imageUri: selectedItem.image });
                }}>
                  <Image source={{ uri: selectedItem.image }} style={styles.modalImage} />
                </TouchableOpacity>
              )}

              <Text style={styles.modalDescription}>{selectedItem?.description}</Text>
            </ScrollView>

            {/* Кнопка закрытия (фиксированная) */}
            <Button title="Sulje" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 7,
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedItem: {
    backgroundColor: "rgb(194, 208, 223)", // Светло-серый фон для выбранного элемента
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: "#555",
    marginVertical: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    resizeMode: "cover",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: '100%',
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginVertical: 10,
  },
  modalImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    resizeMode: "contain",
    borderRadius: 10, // Закругление углов
  },
  gpsButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#FFA07A",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  gpsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ItemListScreen;
