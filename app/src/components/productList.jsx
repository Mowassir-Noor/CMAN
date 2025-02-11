import { FlatList } from "react-native-web"




const Item = ({title}) => (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

const productList=(name,price,image,stock,discount)=>{
    // Image  name  price discoun stock
    // use flatlist for that
    <FlatList
        data={data}
        renderItem={({item}) => <Item title={item.title} />}
        keyExtractor={item => item.id}
      />

}

export default productList;