import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import { getClientLocation } from '../../utils/location/locationFunc'
import { getAuthToken, getUserUID } from '../../utils/userAuth'

const Home = () => {
  const [userInfo, setUserInfo] = useState({
    uid: null,
    token: null
  });
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [todayStats, setTodayStats] = useState({
    salesCount: 157,
    revenue: 12580,
    newCustomers: 24,
    pendingOrders: 8
  });
  
  // Load user info when component mounts
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchUserInfo();
      await fetchWeatherData();
      setLoading(false);
    };
    
    initialize();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const uid = await getUserUID();
      const token = await getAuthToken();
      
      setUserInfo({
        uid: uid,
        token: token
      });
      
      console.log("User UID:", uid);
      console.log("Auth Token:", token);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };
  
  const fetchWeatherData = async () => {
    try {
      const location = await getClientLocation();
      const API_KEY = '8a993a23f3f549e4ae7205037232310';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };
  
  const sendlocation = () => {
    
    getClientLocation()
      .then((res) => {
        
      
      })
      .catch((err) => {
        console.log('error', err)
      })
  }

  const getIdToken = async () => {
    try {
      const token = await getAuthToken();
      const uid = await getUserUID();
      
      console.log("Auth Token:", token);
      console.log("User UID:", uid);
      
      // Update state with the latest values
      setUserInfo({
        uid: uid,
        token: token
      });
    } catch (error) {
      console.error("Error getting token:", error);
    }
  }
  
  const renderWeatherInfo = () => {
    if (!weatherData) return null;
    
    return (
      // Replace LinearGradient with a regular View with background color
      <View style={styles.weatherCard}>
        <View style={styles.weatherContent}>
          <View>
            <Text style={styles.weatherTemp}>{Math.round(weatherData.main.temp)}°C</Text>
            <Text style={styles.weatherDesc}>{weatherData.weather[0].description}</Text>
            <Text style={styles.weatherLocation}>{weatherData.name}</Text>
          </View>
          <View>
            <Image 
              source={{ uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png` }}
              style={styles.weatherIcon}
            />
          </View>
        </View>
        <View style={styles.weatherDetails}>
          <View style={styles.weatherDetail}>
            <Ionicons name="water-outline" size={18} color="white" />
            <Text style={styles.weatherDetailText}>{weatherData.main.humidity}%</Text>
          </View>
          <View style={styles.weatherDetail}>
            <FontAwesome5 name="wind" size={18} color="white" />
            <Text style={styles.weatherDetailText}>{weatherData.wind.speed} m/s</Text>
          </View>
          <View style={styles.weatherDetail}>
            <MaterialCommunityIcons name="weather-sunny" size={18} color="white" />
            <Text style={styles.weatherDetailText}>
              {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  const StatCard = ({ icon, title, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5b6ceb" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Admin</Text>
          <Text style={styles.subGreeting}>Welcome to your dashboard</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={40} color="#5b6ceb" />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderWeatherInfo()}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard 
            icon={<MaterialCommunityIcons name="cart-outline" size={24} color="#5b6ceb" />}
            title="Sales"
            value={todayStats.salesCount}
            color="#5b6ceb"
          />
          <StatCard 
            icon={<MaterialCommunityIcons name="currency-usd" size={24} color="#28a745" />}
            title="Revenue"
            value={`$${todayStats.revenue.toLocaleString()}`}
            color="#28a745"
          />
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard 
            icon={<Ionicons name="people-outline" size={24} color="#fd7e14" />}
            title="New Customers"
            value={todayStats.newCustomers}
            color="#fd7e14"
          />
          <StatCard 
            icon={<MaterialCommunityIcons name="clock-outline" size={24} color="#dc3545" />}
            title="Pending Orders"
            value={todayStats.pendingOrders}
            color="#dc3545"
          />
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={getIdToken}
          >
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.actionButtonText}>Refresh Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.successButton]} 
            onPress={sendlocation}
          >
            <Ionicons name="location" size={24} color="white" />
            <Text style={styles.actionButtonText}>Send Location</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Authentication Info</Text>
          <Text style={styles.infoText}>UID: {userInfo.uid || 'Not available'}</Text>
          <Text style={styles.infoText}>Token Status: {userInfo.token ? 'Active' : 'Inactive'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#5b6ceb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    borderRadius: 20,
  },
  weatherCard: {
    backgroundColor: '#4da7db', // Set a solid color instead of gradient
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  weatherDesc: {
    fontSize: 16,
    color: 'white',
    textTransform: 'capitalize',
  },
  weatherLocation: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    color: 'white',
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#5b6ceb',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#5b6ceb',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#5b6ceb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
});

export default Home;