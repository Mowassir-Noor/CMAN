import { Link, Stack } from 'expo-router';
import { StyleSheet,Text } from 'react-native';

import { ThemedText } from 'app/src/components/ThemedText';
import { ThemedView } from 'app/src/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Text className='flex-1 justify-center items-center'>page not found</Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
