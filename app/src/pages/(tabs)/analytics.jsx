import * as React from 'react';
import { FAB, Portal, PaperProvider } from 'react-native-paper';
import { icons } from '../../constants';
import { router } from 'expo-router';

const Analytics = () => {
  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
    <PaperProvider>
      <Portal>
        <FAB.Group
        fabStyle={open?{borderRadius:50}:{backgroundColor: 'purple',borderRadius:50}}
          open={open}
          visible
          icon={open ? 'close' : 'plus'}
          actions={[
            { icon: icons.category, 
              label:"Add New Category",
              onPress: () => console.log('Pressed add') },
            {
              icon: icons.addProduct,
              label: 'Add New Product',
              onPress: () => router.push('../products/addProducts'),
            },
            
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>
    </PaperProvider>
  );
};

export default Analytics;