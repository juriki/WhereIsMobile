import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EntryScreen from "../screens/EntryScreen";
import AddItemScreen from "../screens/AddItemScreen";
import ItemListScreen from "../screens/ItemListScreen";
import ItemDetailsScreen from "../screens/ItemDetailsScreen";
import EditItemScreen from "../screens/EditItemScreen";
import { ActivityIndicator, View } from "react-native";
import ImageScreen from "../screens/ImageScreen"; // Добавляем импорт
import MapScreen from "../screens/MapScreen";
const Stack = createStackNavigator();
const STORAGE_KEY = "itemsList";

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkItems = async () => {
      try {
        const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedItems && JSON.parse(storedItems).length > 0) {
          setInitialRoute("ItemList");
        } else {
          setInitialRoute("Entry");
        }
      } catch (error) {
        console.error("Ошибка при проверке данных:", error);
        setInitialRoute("Entry");
      }
    };

    checkItems();
  }, []);

  // Показываем загрузку, пока не определился стартовый экран
  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Entry" component={EntryScreen} />
        <Stack.Screen name="ItemList" component={ItemListScreen} />
        <Stack.Screen name="AddItem" component={AddItemScreen} />
        <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
        <Stack.Screen name="EditItem" component={EditItemScreen} />
        <Stack.Screen name="ImageScreen" component={ImageScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

