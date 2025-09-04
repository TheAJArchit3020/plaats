import React, {useEffect, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import API from '../services/network/api';

const Card = ({
  img,
  token,
  projectID,
  title,
  description,
  isSaved,
  onPress,
}) => {
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    if (img) {
      API.imageTryLocal(img, projectID, token).then(setImageSource);
    } else {
      setImageSource(require('../../assets/house.png'));
    }
  }, [img, projectID, token]);

  const width = 250;
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 25,
        marginBottom: 25,
      }}>
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 10,
          shadowColor: '#111111',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 2,
        }}>
        <View>
          <FastImage
            source={imageSource}
            style={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              height: width - 50,
              width: width,
            }}
          />
        </View>
        <View style={{padding: 15, width: width, position: 'relative'}}>
          <Text style={{color: 'black', fontWeight: '400'}}>{description}</Text>
          <Text numberOfLines={1} style={{}}>
            {title}
          </Text>
          {isSaved && <View style={styles.savedIndicator} />}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  savedIndicator: {
    position: 'absolute',
    right: 10,
    bottom: 35,
    height: 15,
    width: 15,
    backgroundColor: '#219921',
    borderRadius: 10,
  },
});

export default Card;
