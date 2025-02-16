import React, { useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const EntryScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      title: "Tervetuloa",  // Устанавливаем заголовок
      headerLeft: () => null,  // Убираем кнопку "Назад" на навигационной панели
      headerShown: false, // Скрываем навигационную панель на этом экране
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tervetuloa Where Is? -sovellukseen</Text>
      <Text style={styles.subtitle}>
        Sovellus auttaa sinua luomaan muistiinpanoja ja liittämään ne GPS-sijainteihin.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#32CD32' }]}  // Цвет кнопки: зелёный
        onPress={() => navigation.navigate("AddItem")}
      >
        <Text style={styles.buttonText}>Lisää uusi kohde</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",  // Светлый фон
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",  // Тёмный цвет текста для контраста
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
    color: "#555",  // Более светлый текст для подзаголовка
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 15,
    width: '80%',  // Ограничиваем ширину кнопок
  },
  buttonText: {
    color: "white",  // Цвет текста на кнопках
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default EntryScreen;
