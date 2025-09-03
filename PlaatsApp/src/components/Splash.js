import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

const Splash = ({text = ''}) => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('../../assets/habicom.png')}
      />
      <Text>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 250,
    resizeMode: 'contain',
  },
});

export default Splash;
