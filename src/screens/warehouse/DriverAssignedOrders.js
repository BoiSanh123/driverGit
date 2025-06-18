import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const DriverAssignedOrders = ({ route }) => {
  const { StaffID } = route.params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/drivers/${StaffID}/assigned-orders`);

      // Loại trùng theo OrderID
      const rawData = response.data;
      const uniqueOrders = Object.values(
        rawData.reduce((acc, item) => {
          acc[item.OrderID] = item;
          return acc;
        }, {})
      );

      setOrders(uniqueOrders);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignOrder = async (orderId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn chắc chắn muốn hủy phân bố đơn hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await axios.put(`${API_URL}/orders/${orderId}/unassign`);
              await fetchAssignedOrders();
              Alert.alert('Thành công', 'Đã hủy phân bố đơn hàng');
            } catch (error) {
              Alert.alert('Lỗi', error.response?.data?.error || 'Không thể hủy phân bố');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderCode}>📦 Đơn #{item.Order_code}</Text>
      <Text style={styles.receiverInfo}>👤 {item.Receiver_name}</Text>
      <Text style={styles.receiverInfo}>📍 {item.Receiver_address}</Text>
      <Text style={styles.receiverInfo}>📞 {item.Receiver_phone}</Text>
      <Text style={styles.receiverInfo}>⚖️ Khối lượng: {item.Weight} kg</Text>
      <Text style={styles.receiverInfo}>🏭 Kho xuất phát: {item.Warehouse_name}</Text>
      <Text style={styles.receiverInfo}>🕐 Thời gian phân bố: {new Date(item.assigned_at).toLocaleString()}</Text>

      <TouchableOpacity
        style={styles.unassignButton}
        onPress={() => handleUnassignOrder(item.OrderID)}
      >
        <Text style={styles.buttonText}>HỦY PHÂN BỐ</Text>
      </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.title}>📦 ĐƠN HÀNG ĐÃ PHÂN BỐ</Text>
        <TouchableOpacity onPress={fetchAssignedOrders} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄 LÀM MỚI</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item.OrderID.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có đơn hàng nào đã phân bố</Text>
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
    alignItems: 'center',
    marginBottom: 15
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  refreshButton: {
    backgroundColor: '#3498db',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 8,
    borderLeftColor: '#FFD54F',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3498db',
    marginBottom: 5
  },
  receiverInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3
  },
  unassignButton: {
    marginTop: 10,
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#7f8c8d'
  },
  listContainer: {
    paddingBottom: 20
  }
});

export default DriverAssignedOrders;
