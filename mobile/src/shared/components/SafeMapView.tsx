import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';

interface SafeMapViewProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
    onPress?: () => void;
  }>;
  style?: object;
  onPress?: (e: any) => void;
  onLongPress?: (e: any) => void;
}

export function SafeMapView({ initialRegion, markers = [], style, onPress, onLongPress }: SafeMapViewProps) {
  const [loading, setLoading] = useState(true);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.fallback, style]}>
        <View style={styles.fallbackIconWrap}>
          <Text style={styles.fallbackIcon}>{"\uD83D\uDCCD"}</Text>
        </View>
        <Text style={styles.fallbackTitle}>Map View</Text>
        <Text style={styles.fallbackText}>
          {markers.length > 0
            ? `${markers.length} doctor(s) in this area`
            : 'Map not supported on web yet'}
        </Text>
      </View>
    );
  }

  const markersJson = JSON.stringify(markers.map(m => ({
    id: m.id,
    lat: m.latitude,
    lng: m.longitude,
    title: m.title
  })));

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { padding: 0; margin: 0; background-color: #F5F8FB; }
          html, body, #map { height: 100%; width: 100%; }
          .leaflet-control-container { display: none; }
          .brand-pin {
            width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
            background: linear-gradient(135deg, #07274D, #00A896);
            transform: rotate(-45deg);
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(7,39,77,0.35);
          }
          .brand-pin::after {
            content: '';
            position: absolute; top: 7px; left: 7px;
            width: 12px; height: 12px; border-radius: 50%;
            background: #FFFFFF;
          }
          .leaflet-popup-content-wrapper { border-radius: 10px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([${initialRegion.latitude}, ${initialRegion.longitude}], 13);

          L.tileLayer('https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          var brandIcon = L.divIcon({
            className: 'brand-pin',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -28]
          });

          var markersData = ${markersJson};
          markersData.forEach(function(m) {
            var marker = L.marker([m.lat, m.lng], { icon: brandIcon }).addTo(map);
            if (m.title) {
              marker.bindPopup(m.title);
            }
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: m.id }));
            });
          });

          map.on('click', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapPress',
              lat: e.latlng.lat,
              lng: e.latlng.lng
            }));
          });

          map.on('contextmenu', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLongPress',
              lat: e.latlng.lat,
              lng: e.latlng.lng
            }));
          });
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapPress' && onPress) {
        onPress({ nativeEvent: { coordinate: { latitude: data.lat, longitude: data.lng } } });
      } else if (data.type === 'mapLongPress' && onLongPress) {
        onLongPress({ nativeEvent: { coordinate: { latitude: data.lat, longitude: data.lng } } });
      } else if (data.type === 'markerPress') {
        const marker = markers.find(m => m.id === data.id);
        if (marker && marker.onPress) {
          marker.onPress();
        }
      }
    } catch (err) { }
  };

  return (
    <View style={style || styles.defaultMap}>
      <WebView
        source={{ html }}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => setLoading(false)}
        style={{ flex: 1, opacity: loading ? 0 : 1 }}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultMap: {
    flex: 1,
    minHeight: 250,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill as any,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  fallback: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  fallbackIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.tintAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  fallbackIcon: {
    fontSize: 24,
  },
  fallbackTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  fallbackText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});