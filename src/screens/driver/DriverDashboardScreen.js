import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function DriverDashboardScreen({ route }) {
  const navigation = useNavigation();
  const { driverId } = route.params;

  const handlePickupPress = () => {
    navigation.navigate('PickupOrdersScreen', { driverId });
  };

  const handleDeliveryPress = () => {
    navigation.navigate('DeliveryOrdersScreen', { driverId });
  };

  const handleActiveOrdersPress = () => {
    navigation.navigate('ActiveOrderScreen', { driverId });
  };

  const handleOrderHistoryPress = () => {
    navigation.navigate('OrderHistoryScreen', { driverId });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orangeBox}>
          <Image
            source={require('../../../assets/img/avatars/5.png')}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {/* Khung Lấy hàng */}
        <TouchableOpacity style={styles.menuItem} onPress={handlePickupPress}>
          <View style={styles.iconCircle}>
            <Image 
              source={require('../../../assets/img/icons/driver1.png')} 
              style={styles.iconImage}
            />
          </View>
          <Text style={styles.menuText}>Lấy hàng</Text>
        </TouchableOpacity>

        {/* Khung Giao hàng */}
        <TouchableOpacity style={styles.menuItem} onPress={handleDeliveryPress}>
          <View style={styles.iconCircle}>
            <Image 
              source={require('../../../assets/img/icons/driver3.png')} 
              style={styles.iconImage}
            />
          </View>
          <Text style={styles.menuText}>Giao hàng</Text>
        </TouchableOpacity>

        {/* Khung Đang giao */}
        <TouchableOpacity style={styles.menuItem} onPress={handleActiveOrdersPress}>
          <View style={styles.iconCircle}>
            <Image 
              source={require('../../../assets/img/icons/driver2.png')} 
              style={styles.iconImage}
            />
          </View>
          <Text style={styles.menuText}>Đang giao</Text>
        </TouchableOpacity>

        {/* Khung lịch sử */}
        <TouchableOpacity style={styles.menuItem} onPress={handleOrderHistoryPress}>
          <View style={styles.iconCircle}>
            <Image 
              source={require('../../../assets/img/icons/driver4.png')} 
              style={styles.iconImage}
            />
          </View>
          <Text style={styles.menuText}>Lịch sử giao</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#FFD54F',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 30,
  },
  orangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  logoutButton: {
    paddingVertical: 4,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    alignItems: 'center',
    width: '20%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFD54F',
  },
  iconImage: {
    width: 30,
    height: 30,
  },
  menuText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});