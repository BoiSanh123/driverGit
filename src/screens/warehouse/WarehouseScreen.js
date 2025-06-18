import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const WarehouseScreen = ({ route, navigation }) => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { WarehouseID } = route.params;

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/orders/processed`, {
        params: { warehouseId: WarehouseID }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL}/drivers`);
      setDrivers(response.data);
    } catch (error) {
      console.error('Lỗi lấy tài xế:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  const handleAssignToDriver = async (orderId, StaffID) => {
    try {
      await axios.post(`${API_URL}/orders/${orderId}/assign`, {
        StaffID,
        warehouseId: WarehouseID
      });
      Alert.alert('Thành công', 'Đã phân bố đơn hàng');
      setExpandedOrderId(null);
      fetchOrders();
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Phân bố không thành công');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() =>
          navigation.navigate('WarehouseOrderDetail', { orderId: item.OrderID })
        }
        activeOpacity={0.8}
      >
        <Text style={styles.orderCode}>#{item.Order_code}</Text>
        <Text>Người gửi: {item.Sender_name}</Text>
        <Text>Khối lượng: {item.Weight} kg</Text>
        <Text>Phí vận chuyển: {parseFloat(item.Ship_cost).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VND</Text>
        <Text>Dịch vụ: {item.Service_name}</Text>
        <Text>Trạng thái Package: {item.Package_status}</Text>
      </TouchableOpacity>

      {item.Package_status === 'Đang xử lý' && (
        <View style={{ paddingHorizontal: 15, marginBottom: 10 }}>
          <TouchableOpacity
            style={styles.dropdownToggle}
            onPress={() => {
              setExpandedOrderId(expandedOrderId === item.OrderID ? null : item.OrderID);
            }}
          >
            <Text style={styles.dropdownText}>Phân bố ▼</Text>
          </TouchableOpacity>

          {expandedOrderId === item.OrderID && (
            <View style={styles.dropdownMenu}>
              {drivers.map(driver => (
                <TouchableOpacity
                  key={driver.StaffID}
                  style={styles.driverOption}
                  onPress={() => handleAssignToDriver(item.OrderID, driver.StaffID)}
                >
                  <Text>{driver.Name} ({driver.Phone})</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>DANH SÁCH ĐƠN CHỜ PHÂN BỐ</Text>
        <View style={styles.totalOrdersContainer}>
          <Text style={styles.totalOrdersText}>Tổng: {orders.length} đơn</Text>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={fetchOrders}
        >
          <Text style={styles.buttonText}>🔄LÀM MỚI</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item.OrderID.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có đơn hàng nào trong kho</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalOrdersContainer: {
    backgroundColor: '#e0e0e0',
    padding: 5,
    borderRadius: 10,
  },
  totalOrdersText: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    marginBottom: 10,
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  dropdownToggle: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  dropdownText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdownMenu: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  driverOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

export default WarehouseScreen;