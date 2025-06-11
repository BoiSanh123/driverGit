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
  ScrollView
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Camera from 'expo-camera';
import { Camera as CameraComponent } from 'expo-camera';

console.log('Is Camera a function?', typeof Camera === 'function');
console.log('MapView:', MapView);
console.log('Camera:', Camera);

import { useNavigation } from '@react-navigation/native';
import API_URL from '../../config/apiconfig';

const { height } = Dimensions.get('window');
const MIN_HEIGHT = height * 0.4;
const MAX_HEIGHT = height * 0.8;


const DeliveryDetailScreen = ({ route }) => {
  const { order, StaffID } = route.params;
  const navigation = useNavigation();

  const cameraRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 10.8231,
    longitude: 106.6297,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const panY = useRef(new Animated.Value(MIN_HEIGHT)).current;

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
        } else {
          Animated.spring(panY, {
            toValue: panY._value,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('CAMERA PERMISSION:', status);
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập vị trí để sử dụng tính năng này');
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

  // hàm chụp ảnh và lưu vào bộ nhớ đệm ứng dụng
  const takePictureAndCache = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const fileName = `delivery_${Date.now()}.jpg`;
      const newPath = FileSystem.cacheDirectory + fileName;
      await FileSystem.moveAsync({
        from: photo.uri,
        to: newPath
      });
      return newPath;
    }
    return null;
  };

  const handleDeliverySuccess = async () => {
    if (!hasCameraPermission) {
      Alert.alert('Cảnh báo', 'Chưa được cấp quyền sử dụng camera');
      return;
    }

    try {
      const uri = await takePictureAndCache();
      if (!uri) {
        Alert.alert('Lỗi', 'Không thể chụp ảnh');
        return;
      }
      Alert.alert(
        'Xác nhận',
        'Xác nhận đơn đã giao thành công?',
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'Xác nhận',
            onPress: async () => {
              try {
                await axios.put(`${API_URL}/orders/${order.OrderID}/status`, {
                  newStatus: 'Hoàn thành',
                  proof_image: uri
                });
                Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
                navigation.goBack();
              } catch (error) {
                Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý');
    }
  };

  const handleDeliveryFailure = () => {
    Alert.alert(
      'Giao hàng thất bại',
      'Vui lòng chọn lý do',
      [
        {
          text: 'Không gặp khách',
          onPress: () => updateStatus('Thất bại', 'Không gặp khách')
        },
        {
          text: 'Khách từ chối nhận',
          onPress: () => updateStatus('Thất bại', 'Khách từ chối nhận')
        },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const updateStatus = async (status, notes) => {
    try {
      await axios.put(`${API_URL}/orders/${order.OrderID}/status`, {
        newStatus: status,
        notes: notes
      });

      if (status === 'Thất bại') {
        // Quay về tab "Đơn thất bại"
        navigation.navigate('DriverDashboardScreen', {
          StaffID: StaffID,
          initialTab: 2
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Cập nhật trạng thái thất bại');
    }
  };

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
          onPress={() => navigation.navigate('DriverDashboardScreen', { StaffID })}
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
            ĐANG GIAO: Đơn hàng #{order.Order_code || order.order_code}
          </Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>👤 Người nhận: {order.receiver_name}</Text>
            <Text style={styles.infoText}>📍 Địa chỉ: {order.receiver_address}</Text>
            <Text style={styles.infoText}>📞 Điện thoại: {order.receiver_phone}</Text>
            <Text style={styles.infoText}>⚖️ Cân nặng: {order.Weight} kg</Text>
            <Text style={styles.infoText}>📦 Dịch vụ: {order.Service_name}</Text>
            <Text style={styles.infoText}>
              💰 Tổng tiền: {parseFloat(order.Ship_cost).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VND
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={handleDeliverySuccess}
            >
              <Text style={styles.buttonText}>✔️ GIAO HÀNG THÀNH CÔNG</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.failureButton]}
              onPress={handleDeliveryFailure}
            >
              <Text style={styles.buttonText}>✖️ GIAO HÀNG THẤT BẠI</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {hasCameraPermission && (
          <CameraComponent
            ref={cameraRef}
            style={{ height: 1, width: 1, position: 'absolute', bottom: -1000 }}
          />
        )}
      </Animated.View>
    </View>
  );

};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mapContainer: { height: 300, width: '100%' },
  map: { ...StyleSheet.absoluteFillObject },
  header: { fontSize: 18, fontWeight: 'bold', margin: 15, color: '#2c3e50', textAlign: 'center' },
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
  }

});

export default DeliveryDetailScreen;
