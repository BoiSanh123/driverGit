/*
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const WarehouseReturnedOrders = () => {
  const [returnedOrders, setReturnedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReturnedOrders = async () => {
    if (__DEV__ && USE_MOCK_DATA) {
      const orders = mockDriverOrders.filter(
        order =>
          order.Order_status === 'Trả về kho' ||
          order.Order_status === 'Giao không thành công'
      );
      setReturnedOrders(orders);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/returned`);
      setReturnedOrders(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng trả về:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnedOrders();
  }, []);

  const assignOrderToDriver = (orderId) => {
    if (__DEV__ && USE_MOCK_DATA) {
      Alert.alert(
        'Chọn tài xế (Mock)',
        null,
        [
          ...mockDrivers.map(driver => ({
            text: `${driver.name} (${driver.phone})`,
            onPress: () => {
              Alert.alert(
                'Phân bố (Mock)',
                `Đã phân bố đơn hàng #${orderId} cho ${driver.name}`
              );
            }
          })),
          { text: 'Hủy', style: 'cancel' }
        ],
        { cancelable: true }
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.8}
        onPress={() => { }}
      >
        <Text style={styles.orderCode}>📦 Đơn hàng #{item.order_code || item.Order_code}</Text>
        <Text style={styles.receiverInfo}>👤 Người nhận: {item.receiver_name}</Text>
        <Text style={styles.receiverInfo}>📍 Địa chỉ: {item.receiver_address}</Text>
        <Text style={styles.receiverInfo}>📞 Điện thoại: {item.receiver_phone}</Text>
        <Text style={styles.returnReason}>❗ Lý do: {item.return_reason || item.Delivery_notes}</Text>
      </TouchableOpacity>

      <View style={styles.assignButtonWrapper}>
        <TouchableOpacity onPress={() => assignOrderToDriver(item.id || item.OrderID)}>
          <Text style={styles.assignButtonText}>Phân bố lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📦 ĐƠN HÀNG TRẢ VỀ KHO</Text>

      <FlatList
        data={returnedOrders}
        renderItem={renderItem}
        keyExtractor={item => item.id?.toString() || item.OrderID?.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có đơn hàng trả về</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#2c3e50'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  orderCard: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderRadius: 8,
    borderWidth: 5,
    borderColor: '#e74c3c',
    overflow: 'visible',
    position: 'relative'
  },
  cardContent: {
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  assignButtonWrapper: {
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 1,
  },
  assignButtonText: {
    color: '#FAFAFA',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#3498db'
  },
  receiverInfo: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555'
  },
  returnReason: {
    fontSize: 14,
    marginTop: 8,
    color: '#e74c3c',
    fontStyle: 'italic'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d'
  },
  listContainer: {
    paddingBottom: 30
  }
});

export default WarehouseReturnedOrders;
*/