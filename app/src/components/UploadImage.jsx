import React, { useState } from 'react';
import { Button, Image } from 'react-native';
import ImagePicker from 'react-native-image-picker';

const UploadImage = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setSelectedImage(response.uri);
        onImageSelected(response.uri);
      }
    });
  };

  return (
    <>
      <Button title="Choose Image" onPress={handleImagePicker} />
      {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200 }} />}
    </>
  );
};

export default UploadImage;