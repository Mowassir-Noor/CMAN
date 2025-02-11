import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const orders = () => {
   const [value, setIsValue] = useState("");
   const [isFocused, setIsFocused] = useState(false);
   const [data, setData] = useState([]);

   useEffect(() => {
     const fetchCategories = async () => {
       try {
         const response = await axiosInstance.get('category');
         const categories = response.data.data.map(category => ({
           label: category.name,
           value: category.name
         }));
         setData(categories);
       } catch (error) {
         console.error(error);
       }
     };

     fetchCategories();
   }, []);

  //  const renderLabel = () => {
  //   if(value || isFocused){
  //     return(
  //       <Text className="absolute top-0 left-0 bg-white px-2 text-blue-500">
  //         Category
  //       </Text>
  //     );
  //   }
  //   return null;
  // }

  return (
    <View className="p-4 bg-gray-100 min-h-full">
      {/* {renderLabel()} */}
      <Dropdown
      className="border border-gray-300 rounded p-2 bg-white shadow-md"
      data={data}
      search
      maxHeight={300}
      labelField={"label"}
      valueField={"value"}
      placeholder={!isFocused?"Select Item":"..."}
      searchPlaceholder='Search...'
      value={value}
      onFocus={()=>setIsFocused(true)}
      onBlur={()=>setIsFocused(false)}
      onChange={item=>{setIsValue(item.value);
        setIsFocused(false);
      }}/>
    </View>
  )
}

export default orders;