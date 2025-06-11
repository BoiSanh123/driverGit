// Đơn cần lấy hàng
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';

const PickupOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/orders`);
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

  const handleStartPickup = (order) => {
    setActiveOrder(order);
    setCurrentStep(1);
  };

  const handlePickedUp = () => {
    setCurrentStep(2);
  };

  const handleDeliverToWarehouse = async () => {
    try {
      await axios.post(`${API_URL}/tracking`, {
        order_id: activeOrder.OrderID,
        staff_id: staffId,
        status: "Đã giao cho kho",
        location: "Kho trung tâm",
        timestamp: new Date().toISOString()
      });
      await axios.put(`${API_URL}/orders/${activeOrder.OrderID}/status`, {
        newStatus: "Đang giao"
      });
      setCurrentStep(0);
      setActiveOrder(null);
      fetchOrders(); 
    } catch (error) {
      console.error('Lỗi khi giao kho:', error);
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderCode}>Mã đơn: {item.Order_code}</Text>
      <Text style={styles.customerName}>Người gửi: Khách hàng #{item.Sender_id}</Text>
      <Text style={styles.customerPhone}>SĐT: [Số điện thoại]</Text>
      <Text style={styles.customerAddress}>Địa chỉ: [Địa chỉ người gửi]</Text>
      
      {activeOrder?.OrderID === item.OrderID ? (
        <View style={styles.buttonGroup}>
          {currentStep >= 1 && (
            <TouchableOpacity 
              style={[styles.button, styles.disabledButton]}
              disabled
            >
              <Text style={styles.buttonText}>Đã bắt đầu lấy</Text>
            </TouchableOpacity>
          )}
          {currentStep === 1 && (
            <TouchableOpacity 
              style={styles.button}
              onPress={handlePickedUp}
            >
              <Text style={styles.buttonText}>Đã lấy hàng</Text>
            </TouchableOpacity>
          )}
          {currentStep === 2 && (
            <TouchableOpacity 
              style={[styles.button, styles.deliverButton]}
              onPress={handleDeliverToWarehouse}
            >
              <Text style={styles.buttonText}>Giao cho kho</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleStartPickup(item)}
          disabled={activeOrder !== null}
        >
          <Text style={styles.buttonText}>Bắt đầu lấy hàng</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ĐƠN HÀNG CẦN LẤY</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.OrderID.toString()}
        renderItem={renderOrderItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchOrders} 
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3498db',
  },
  customerName: {
    fontSize: 14,
    marginBottom: 5,
    color: '#2c3e50',
  },
  customerPhone: {
    fontSize: 14,
    marginBottom: 5,
    color: '#2c3e50',
  },
  customerAddress: {
    fontSize: 14,
    marginBottom: 10,
    color: '#2c3e50',
  },
  buttonGroup: {
    marginTop: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  deliverButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PickupOrdersScreen;