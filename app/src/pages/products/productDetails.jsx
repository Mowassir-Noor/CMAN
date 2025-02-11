import { View, Text } from 'react-native'
import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

  

const productDetails = () => {
    
    
   
    const[productDetail,setProductDetail]=useState(null);
    const [loading,setIsLoading]=useState(true);

    
   
   
  


 
     const fetchProductDetails= async(productId)=>{
        try{ 
            const response=await axiosInstance.get(`products/${productId}`);
            setProductDetail(response);
                 }
    catch(error){
        console.log(error);
    }
    finally{
        setIsLoading(false);

    }
}

     fetchProductDetails('674745343204d38040b617fd');

   


  return (
    <View>
      <Text>{productDetail}</Text>
    </View>
  )
}

export default productDetails;