import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // Добавляем карту
import { useNavigation } from '@react-navigation/native'; // Импортируем useNavigation

const MapScreen = ({ route }) => {
    const { coordinates, title } = route.params; // Получаем координаты и название элемента
    const navigation = useNavigation(); // Получаем объект навигации

    useEffect(() => {
        // Устанавливаем заголовок на финском
        navigation.setOptions({
            title: 'Kartta', // Название на финском
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            {/* Карта занимает весь экран */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker
                    coordinate={{ latitude: coordinates.latitude, longitude: coordinates.longitude }}
                    title="Sijainti"
                    description="Tämä on valitun kohteen sijainti."
                />
            </MapView>

            {/* Контейнер для отображения названия */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    map: {
        flex: 1,
    },
    titleContainer: {
        position: 'absolute', // Абсолютное позиционирование
        top: 0, 
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Полупрозрачный фон
        padding: 10,
        textAlign: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default MapScreen;
