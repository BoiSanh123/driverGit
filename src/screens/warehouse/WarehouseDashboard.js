import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const data = [
  {
    id: '1',
    label: 'Chờ xử lý',
    image: require('../../../assets/img/icons/storage2.png'),
    screen: 'WarehouseOrderScreen',
  },
  {
    id: '2',
    label: 'Trong kho',
    image: require('../../../assets/img/icons/storage1.png'),
    screen: 'WarehouseScreen',
  },
  {
    id: '3',
    label: 'Phân phối cho tài xế',
    image: require('../../../assets/img/icons/storageCarrier.png'),
    screen: 'DriverAssignmentScreen',
  },
  /*
  {
    id: '4',
    label: 'Đơn hàng bị trả về',
    image: require('../../../assets/img/icons/storage3.png'),
    screen: 'WarehouseReturnedOrders',
  },
  */
];

const WarehouseDashboard = ({ route }) => {
  const navigation = useNavigation();
  const { staffId } = route.params; 

  const renderCard = ({ item }) => (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate(item.screen, { staffId })}
      >
        <View style={styles.iconContainer}>
          <Image source={item.image} style={styles.icon} />
        </View>
        <Text style={styles.label}>{item.label}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        <Text style={styles.bannerText}>QUẢN LÝ KHO</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderCard}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.gridContainer}
        ListHeaderComponent={<View style={{ height: 20 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 10,
    height: 140,
    position: 'relative',
    backgroundColor: '#FFD54F',
    width: '100%',
  },

  bannerText: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    transform: [{ translateY: -40 }],
  },
  gridContainer: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  cardWrapper: {
    width: '48%',
    height: 130,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: 'relative',
    paddingTop: 40,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -35,
    borderWidth: 3,
    borderColor: '#FFD54F',
    zIndex: 2,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default WarehouseDashboard;
