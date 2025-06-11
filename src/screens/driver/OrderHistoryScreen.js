
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const OrderHistoryScreen = ({ route }) => {
  const { StaffID } = route.params;
  const [currentMonthOrders, setCurrentMonthOrders] = useState([]);
  const [previousMonthOrders, setPreviousMonthOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const fetchHistoryOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/drivers/${StaffID}/assigned-orders`);
      const rawData = response.data;

      const filteredOrders = rawData.filter(order =>
        order.Order_status === 'Hoàn thành' || order.Order_status === 'Thất bại'
      );
      // Giữ bản ghi mới nhất nếu trùng OrderID
      const uniqueOrders = Object.values(
        filteredOrders.reduce((acc, item) => {
          const existing = acc[item.OrderID];
          if (!existing || new Date(item.assigned_at) > new Date(existing.assigned_at)) {
            acc[item.OrderID] = item;
          }
          return acc;
        }, {})
      );

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const current = [];
      const previous = [];

      uniqueOrders.forEach(order => {
        const date = new Date(order.assigned_at);
        const month = date.getMonth();
        const year = date.getFullYear();

        if (month === currentMonth && year === currentYear) {
          current.push(order);
        } else if (
          (month === currentMonth - 1 && year === currentYear) ||
          (currentMonth === 0 && month === 11 && year === currentYear - 1)
        ) {
          previous.push(order);
        }
      });

      setCurrentMonthOrders(current);
      setPreviousMonthOrders(previous);
    } catch (err) {
      console.error('❌ Lỗi khi lấy đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryOrders();
  }, []);

  const countOrdersByStatus = (orders) => {
    return orders.reduce((acc, order) => {
      if (order.Order_status === 'Hoàn thành') {
        acc.completed++;
      } else if (order.Order_status === 'Thất bại') {
        acc.failed++;
      }
      return acc;
    }, { completed: 0, failed: 0 });
  };

  const renderOrderItem = (order) => (
    <View
      key={order.OrderID}
      style={[
        styles.orderCard,
        order.Order_status === 'Thất bại' && styles.failedCard
      ]}
    >
      <Text style={styles.orderCode}>📦 Mã đơn: {order.Order_code || order.order_code}</Text>
      <Text style={styles.info}>👤 Người nhận: {order.Receiver_name || order.receiver_name}</Text>
      <Text style={styles.info}>📍 Địa chỉ: {order.Receiver_address || order.receiver_address}</Text>
      <Text style={styles.info}>📞 SĐT: {order.Receiver_phone || order.receiver_phone}</Text>
      <Text style={[
        styles.statusText,
        order.Order_status === 'Thất bại' && { color: '#E53935' },
        order.Order_status === 'Hoàn thành' && { color: '#7CB342' }
      ]}>
        📝 Trạng thái: {order.Order_status}
      </Text>
    </View>
  );

  const renderTabContent = () => {
    const data = activeTab === 0 ? currentMonthOrders : previousMonthOrders;
    const counts = countOrdersByStatus(data);

    if (data.length === 0) {
      return <Text style={styles.noOrdersText}>Không có đơn hàng trong mục này</Text>;
    }

    return (
      <View>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryText, styles.completedText]}>
              ✅ Hoàn thành: {counts.completed}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryText, styles.failedText]}>
              ❌ Thất bại: {counts.failed}
            </Text>
          </View>
        </View>

        {data.map(order => renderOrderItem(order))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📜 LỊCH SỬ GIAO HÀNG</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={styles.tabText}>Tháng này ({currentMonthOrders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={styles.tabText}>Tháng trước ({previousMonthOrders.length})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD54F" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {renderTabContent()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#2c3e50',
    textAlign: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  tabButton: {
    padding: 10,
    marginHorizontal: 15,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#FFD54F'
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  orderCard: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderLeftColor: '#4CAF50'
  },
  failedCard: {
    borderLeftColor: '#F44336'
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    color: '#3498db'
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555'
  },
  statusText: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#333'
  },
  noOrdersText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  completedText: {
    color: '#4CAF50'
  },
  failedText: {
    color: '#F44336'
  }
});

export default OrderHistoryScreen;
