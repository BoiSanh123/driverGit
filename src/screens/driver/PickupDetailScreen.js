import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PanResponder,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import API_URL from '../../config/apiconfig';
import { useIsFocused } from '@react-navigation/native';

const { height } = Dimensions.get('window');
const MIN_HEIGHT = height * 0.4;
const MAX_HEIGHT = height * 0.8;

const PickupDetailScreen = ({ navigation, route }) => {
  const { order, StaffID } = route.params || {};
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 10.8231,
    longitude: 106.6297,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const isFocused = useIsFocused();
  const panY = useRef(new Animated.Value(MIN_HEIGHT)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập vị trí để sử dụng');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        return gestureState.y0 < (height - MIN_HEIGHT + 40);
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = MIN_HEIGHT - gestureState.dy;
        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          panY.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          Animated.spring(panY, {
            toValue: MIN_HEIGHT,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy < -50) {
          Animated.spring(panY, {
            toValue: MAX_HEIGHT,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleSuccess = async () => {
    try {
      await axios.post(`${API_URL}/update-tracking`, {
        orderId: order.OrderID,
        staffId: StaffID,
        status: 'Đã lấy'
      });
      navigation.navigate('DriverDashboardScreen', {
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Xác nhận thất bại');
    }
  };

  const handleFailure = async () => {
    try {
      await axios.post(`${API_URL}/update-tracking`, {
        orderId: order.OrderID,
        staffId: StaffID,
        status: 'Cần lấy'
      });
      navigation.navigate('DriverDashboardScreen');
    } catch (error) {
      Alert.alert('Lỗi', 'Xác nhận thất bại');
    }
  };

  if (!order) {
    return (
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text style={styles.errorText}>Không có đơn hàng nào đang lấy</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Quay lại</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Đang lấy vị trí...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.mapContainer, { height: Animated.subtract(height, panY) }]}
      >
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude
              }}
              title="Vị trí của bạn"
            />
          )}
        </MapView>
        <TouchableOpacity
          style={[styles.homeButton, styles.homeButtonContainer]}
          onPress={() => navigation.navigate('DriverDashboardScreen')}
        >
          <Text style={styles.homeButtonText}>🏠 Về trang chủ</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[styles.infoPanel, { height: panY }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandle} />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.header}>
            ĐANG LẤY: Đơn hàng #{order.Order_code || order.order_code}
          </Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>👤 Người gửi: {order.Sender_name}</Text>
            <Text style={styles.infoText}>📍 Địa chỉ: {order.Sender_address}</Text>
            <Text style={styles.infoText}>📞 Điện thoại: {order.Sender_phone}</Text>
            <Text style={styles.infoText}>📦 Dịch vụ: {order.Service_name}</Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={handleSuccess}
            >
              <Text style={styles.buttonText}>Lấy đơn thành công</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.failureButton]}
              onPress={handleFailure}
            >
              <Text style={styles.buttonText}>Lấy đơn thất bại</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mapContainer: { width: '100%' },
  map: StyleSheet.absoluteFillObject,
  header: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    margin: 15, 
    color: '#2c3e50', 
    textAlign: 'center' 
  },
  infoContainer: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD54F'
  },
  infoText: { fontSize: 16, marginBottom: 10, color: '#555' },
  buttonGroup: { margin: 15 },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15
  },
  successButton: { backgroundColor: '#FFD54F' },
  failureButton: { backgroundColor: '#FFD54F' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  homeButtonContainer: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 1,
  },
  homeButton: {
    backgroundColor: '#FFD54F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#2c3e50'
  },
  backButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: 'center'
  }
});

export default PickupDetailScreen;