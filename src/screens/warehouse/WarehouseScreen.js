import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const WarehouseScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/orders/processed`);
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
      await axios.post(`${API_URL}/orders/${orderId}/assign`, { StaffID });
      Alert.alert('Thành công', 'Đã phân bố đơn hàng');
      setExpandedOrderId(null);
      fetchOrders();
    } catch (error) {
      Alert.alert('Lỗi', 'Phân bố không thành công');
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
      </TouchableOpacity>

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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>DANH SÁCH ĐƠN</Text>
        <View style={styles.totalOrdersContainer}>
          <Text style={styles.totalOrdersText}>Tổng: {orders.filter(order => order.Order_status !== 'Mới tạo').length} đơn</Text>
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
        data={orders.filter(order => order.Order_status !== 'Mới tạo')}
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
    padding: 15,
    backgroundColor: '#EEEEEE'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  totalOrdersContainer: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  totalOrdersText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  refreshButton: {
    backgroundColor: '#3498db'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  orderCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden'
  },
  cardContent: {
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3498db',
    marginBottom: 5
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d'
  },
  dropdownToggle: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  dropdownText: {
    fontWeight: 'bold',
    color: '#333'
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 5,
    maxHeight: 200
  },
  driverOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
});

export default WarehouseScreen;
