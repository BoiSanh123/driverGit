import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const WarehouseOrderScreen = ({ route }) => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { WarehouseID } = route.params;

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/warehouse-new-orders`, {
        params: { warehouseId: WarehouseID }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('WarehouseProcessingScreen', {
        order: item,
        WarehouseID
      })}
    >
      <Text style={styles.orderCode}>📦 #{item.Order_code}</Text>
      <Text style={styles.infoText}>📅 {new Date(item.Created_at).toLocaleDateString()}</Text>
      <Text style={styles.infoText}>🚚 Dịch vụ: {item.Service_name}</Text>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>DANH SÁCH ĐƠN HÀNG CHỜ XỬ LÝ</Text>
      <FlatList
        data={orders.filter(order => order.Order_status === 'Mới tạo')}
        keyExtractor={(item) => item.OrderID.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3498db',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#34495e',
  },
  paidStatus: {
    color: '#27ae60',
    fontWeight: '600',
  },
  unpaidStatus: {
    color: '#e74c3c',
    fontWeight: '600',
  },
});

export default WarehouseOrderScreen;