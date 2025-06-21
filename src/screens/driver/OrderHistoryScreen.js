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
  const [thisMonthOrders, setThisMonthOrders] = useState([]);
  const [lastMonthOrders, setLastMonthOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

const fetchHistoryOrders = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${API_URL}/drivers/${StaffID}/assigned-orders`);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Bước 1: Nhóm các bản ghi Tracking theo OrderID, lấy bản ghi mới nhất
    const ordersMap = response.data.reduce((acc, order) => {
      const existing = acc[order.OrderID];
      const currentTimestamp = new Date(order.Timestamp);
      
      if (!existing || currentTimestamp > new Date(existing.Timestamp)) {
        acc[order.OrderID] = order;
      }
      return acc;
    }, {});

    const uniqueOrders = Object.values(ordersMap);

    // Bước 2: Lọc các đơn Hoàn thành/Thất bại
    const filtered = uniqueOrders.filter(order => {
      return order.Order_status === 'Hoàn thành' || order.Order_status === 'Thất bại';
    });

    // Bước 3: Phân loại theo tháng
    const thisMonth = [];
    const lastMonth = [];

    filtered.forEach(order => {
      const orderDate = new Date(order.Timestamp);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();

      // Kiểm tra tháng hiện tại
      if (orderMonth === currentMonth && orderYear === currentYear) {
        thisMonth.push(order);
      } 
      // Kiểm tra tháng trước (xử lý cả trường hợp năm mới)
      else if (
        (orderMonth === currentMonth - 1 && orderYear === currentYear) ||
        (currentMonth === 0 && orderMonth === 11 && orderYear === currentYear - 1)
      ) {
        lastMonth.push(order);
      }
    });

    setThisMonthOrders(thisMonth);
    setLastMonthOrders(lastMonth);
  } catch (err) {
    console.error('❌ Lỗi khi lấy đơn hàng:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchHistoryOrders();
  }, []);

  const renderOrderItem = (order, index) => (
    <View
      key={`${order.OrderID}-${index}`}
      style={[
        styles.orderCard,
        order.Order_status === 'Thất bại' && styles.failedCard
      ]}
    >
      <Text style={styles.orderCode}>📦 Mã đơn: {order.Order_code}</Text>
      <Text style={styles.info}>👤 Người nhận: {order.Receiver_name}</Text>
      <Text style={styles.info}>📍 Địa chỉ: {order.Receiver_address}</Text>
      <Text style={styles.info}>📞 SĐT: {order.Receiver_phone}</Text>
      <Text style={[
        styles.statusText,
        order.Order_status === 'Thất bại' ? { color: '#E53935' } : { color: '#4CAF50' }
      ]}>
        Trạng thái: {order.Order_status}
        {order.Order_status === 'Thất bại' && order.notes && ` (${order.notes})`}
      </Text>
    </View>
  );

  const getStats = (orders) => {
    return orders.reduce((acc, order) => {
      if (order.Order_status === 'Hoàn thành') acc.completed++;
      else if (order.Order_status === 'Thất bại') acc.failed++;
      return acc;
    }, { completed: 0, failed: 0 });
  };

  const monthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber);
    return `Tháng ${monthNumber + 1}`;
  };

  const currentOrders = activeTab === 0 ? thisMonthOrders : lastMonthOrders;
  const { completed, failed } = getStats(currentOrders);
  const currentMonthIndex = new Date().getMonth();
  const lastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LỊCH SỬ GIAO HÀNG</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={styles.tabText}>{monthName(currentMonthIndex)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={styles.tabText}>{monthName(lastMonthIndex)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryText, styles.completedText]}>
            🟢 Hoàn thành: {completed}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryText, styles.failedText]}>
            🔴 Thất bại: {failed}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD54F" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {currentOrders.length > 0 ? (
            currentOrders
              .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))
              .map(renderOrderItem)
          ) : (
            <Text style={styles.noOrdersText}>Không có đơn hàng trong mục này</Text>
          )}
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
    fontWeight: 'bold'
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
