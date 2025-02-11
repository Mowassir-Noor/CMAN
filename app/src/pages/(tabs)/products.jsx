import { View, SafeAreaView, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
import {  ProgressBar } from 'react-native-paper';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ProductCard from '../../components/ProductCard';
import { SearchBar } from '@rneui/themed';
import { BlurView } from 'expo-blur';
// import { FAB } from '@rneui/themed';
import { Link, router } from 'expo-router';
import { FAB, Portal, PaperProvider } from 'react-native-paper';
import { icons } from '../../constants';
// import { SearchBar } from 'react-native-elements';
// import {SearchBar} from 'react-native-paper';

const Products = () => {
 const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;



  const [visible, setVisible] = React.useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

 
  const fetchAllProducts = async (pageNumber = 1) => {
    if (!hasMore && pageNumber !== 1) return;
    setIsLoading(true);
  
    try {
      const response = await axiosInstance.get(`products?page=${pageNumber}`);
      const newProducts = response.data.data.products; // Ensure this is the correct structure
  
      setProducts(prevProducts => 
        pageNumber === 1 ? newProducts : [...prevProducts, ...newProducts]
      );
  
      setHasMore(newProducts.length > 0);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchAllProducts(1);
  };

  

  const loadMoreProducts = () => {
    if (!hasMore || loading) return;  // Prevent multiple calls
    fetchAllProducts(page + 1);
  };
  

  useEffect(() => {
    fetchAllProducts();
  }, []);
  
  


  return (

    <SafeAreaView className="flex-1 relative">
      
      <View>
        <SearchBar
          platform="default"
      containerStyle={{backgroundColor: 'black',paddingTop: 20}}
      inputContainerStyle={{}}
      inputStyle={{}}
      leftIconContainerStyle={{}}
      rightIconContainerStyle={{}}
      loadingProps={{}}
          onChangeText={newVal => setSearchQuery(newVal)}
      onClearText={() => console.log(onClearText())}
          placeholder="Type query here..."
          placeholderTextColor="#888"
      round={true}
      cancelButtonTitle="Cancel"
      cancelButtonProps={{}}
      onCancel={() => console.log(onCancel())}
          value={searchQuery}
      
        />
    


      </View>
  

  <View className="flex-1 relative">
     
      <View className=' bg-black w-full h-full absolute '>
        {loading && <ProgressBar indeterminate color="purple" />}
      
        <FlatList

        
          data={products}
          keyExtractor={(item) => item._id}
          

          // ******************Search query trial***********************

          renderItem={({ item }) => {
            if(searchQuery==""){
              
              return(
                <ProductCard
                  productId={item._id}
                  imageSource={item.bannerImage}
                  productName={item.name}
                  productPrice={item.price}
                  discountedPrice={item.discountedPrice}
                  otherStyle={'pt-4'}
                  quantity={item.quantity}
                  availability={item.availability}
                refreshPage={fetchAllProducts} // Pass fetchAllProducts as refreshPage
                onDelete={fetchAllProducts} // Trigger refresh on delete
                />
                
                

                
              )
            }

            // if(searchQuery!="" && searchQuery.length!=0 && ((item.name).toLowerCase()).includes(searchQuery.toLowerCase())){
              if(searchQuery!="" && searchQuery.length!=0 && (item.name).includes(searchQuery)){
              return(
                <ProductCard
                productId={item._id}
                imageSource={item.bannerImage}
                productName={item.name}
                productPrice={item.price}
                discountedPrice={item.discountedPrice}
                otherStyle={'pt-4'}
                quantity={item.quantity}
                availability={item.availability}
                refreshPage={fetchAllProducts} // Pass fetchAllProducts as refreshPage
                onDelete={fetchAllProducts}
                 /> // Trigger refresh on delete
                )
                
                
            }
          }







  // ******************Search query trial***********************        
        
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.1}  // Trigger pagination earlier
          ListFooterComponent={loading && <ActivityIndicator size="large" color="#0000ff"  />}
        
        
                    
          />
          

    
          


      
           </View>



           
           <View className="flex-1 relative">
        
    {/* ------------------------------- Floating Action Button----------------------*/}
         <PaperProvider>
              <Portal>
                <FAB.Group
             
              style={{
          
               
                position: 'absolute',
                zIndex: 1000, // Ensure FAB is always on top
                elevation:100,
              }}
              color='white'
                fabStyle={(open?{borderRadius:50,backgroundColor:'purple'}:{backgroundColor: 'purple',borderRadius:50})}
               
               
                backdropColor='rgba(0, 0, 0, 0.8);' 
                rippleColor={open?'purple':'white'} 
                open={open}
                  visible
                  icon={open ? 'close' : 'plus'}
                  actions={[
                    { icon: icons.category, 
                      label:"Add New Category",
                      labelTextColor:'white',
                      size:50,
                      rippleColor:'purple',
                      style:{backgroundColor:'white'},
                      onPress: () =>router.push('../category/viewCategory'),},
                    {
                      icon: icons.addProduct,
                      label: 'Add New Product',
                      labelTextColor:'white',
                      size:50,
                      rippleColor:'purple',
                      style:{backgroundColor:'white'},
                      onPress: () => router.push('../products/addProducts'),
                    },

                    
                  ]}

                  // labelStyle={{color:'white'}}
                  // labelTextColor='white'
                 
                  onStateChange={onStateChange}
                  onPress={() => {
                    if (open) {
                      // do something if the speed dial is open
                    }
                  }}
                />
                
              </Portal>
            </PaperProvider>

           


 {/* -------------------------------***************************---------------------------------------            */}
            </View>
       
            </View>



      
      
    </SafeAreaView>
  );
};

export default Products;

