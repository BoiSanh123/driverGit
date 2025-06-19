import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WarehouseDashboard from './src/screens/warehouse/WarehouseDashboard';
import WarehouseOrderScreen from './src/screens/warehouse/WarehouseOrderScreen';
import WarehouseProcessingScreen from './src/screens/warehouse/WarehouseProcessingScreen';
import WarehouseScreen from './src/screens/warehouse/WarehouseScreen';
// import WarehouseOrderDetail from './src/screens/warehouse/WarehouseOrderDetail';
import AssignPickupScreen from './src/screens/warehouse/AssignPickupScreen';
import DriverAssignmentScreen from './src/screens/warehouse/DriverAssignmentScreen';
import DriverAssignedOrders from './src/screens/warehouse/DriverAssignedOrders';
import DriverDashboardScreen from './src/screens/driver/DriverDashboardScreen';
import DeliveryOrdersScreen from './src/screens/driver/DeliveryOrdersScreen';
import PickupOrdersScreen from './src/screens/driver/PickupOrdersScreen';
import ActivePickupScreen from './src/screens/driver/ActivePickupScreen';
import PickupDetailScreen from './src/screens/driver/PickupDetailScreen';
import DeliveryDetailScreen from './src/screens/driver/DeliveryDetailScreen';
import ActiveOrderScreen from './src/screens/driver/ActiveOrderScreen';
import OrderHistoryScreen from './src/screens/driver/OrderHistoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WarehouseDashboard">
        <Stack.Screen name="WarehouseDashboard" component={WarehouseDashboard} initialParams={{ StaffID: 21, WarehouseID: 11 }}  options={{ title: 'Trang chủ' }} />
        <Stack.Screen name="WarehouseOrderScreen" component={WarehouseOrderScreen} initialParams={{ StaffID: 21, WarehouseID: 11 }}  options={{ title: 'Đơn chờ xử lý 1' }} />
        <Stack.Screen name="WarehouseProcessingScreen" component={WarehouseProcessingScreen} initialParams={{ StaffID: 21, WarehouseID: 11 }}  options={{ title: 'Đơn chờ xử lý 2' }} />
        <Stack.Screen name="WarehouseScreen" component={WarehouseScreen} initialParams={{ StaffID: 21, WarehouseID: 11 }}  options={{ title: 'Nhà kho' }} />
        <Stack.Screen name="AssignPickupScreen" component={AssignPickupScreen} initialParams={{ StaffID: 21, WarehouseID: 11 }}  options={{ title: 'Phân đơn lấy' }} />        
        <Stack.Screen name="DriverAssignmentScreen" component={DriverAssignmentScreen} initialParams={{ StaffID: 21, WarehouseID: 11 }}  options={{ title: 'Danh sách tài xế' }} />
        <Stack.Screen name="DriverAssignedOrders" component={DriverAssignedOrders} initialParams={{ StaffID: 21, WarehouseID: 11 }}  options={{ title: 'Danh sách đơn phân bố' }} />

        <Stack.Screen name="DeliveryOrdersScreen" component={DeliveryOrdersScreen} options={{ title: 'Đơn hàng cần giao' }} />
        <Stack.Screen name="DriverDashboardScreen" component={DriverDashboardScreen} initialParams={{ StaffID: 22 }} />
        <Stack.Screen name="DeliveryDetailScreen" component={DeliveryDetailScreen} options={{ title: 'Đơn hàng đang giao' }} />
        <Stack.Screen name="ActiveOrderScreen" component={ActiveOrderScreen} options={{ title: 'Đơn hàng đang giao' }} />
        <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} options={{ title: 'Lịch sử đơn' }} />
        <Stack.Screen name="PickupOrdersScreen" component={PickupOrdersScreen} options={{ title: 'Đơn cần lấy' }} />
        <Stack.Screen name="ActivePickupScreen" component={ActivePickupScreen} options={{ title: 'Đơn cần lấy' }} />
        <Stack.Screen name="PickupDetailScreen" component={PickupDetailScreen} options={{ title: 'Đơn hàng đang lấy' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/*

*/