import React from 'react';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

const MapScreen = ({ route }) => {
    const { coordinates, title } = route.params;

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                mapType="none"
            >
                <UrlTile 
                    urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                />
                <Marker
                    coordinate={coordinates}
                    title={title}
                />
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default MapScreen;
