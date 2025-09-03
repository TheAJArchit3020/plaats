import React from 'react';
import {Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import { Icon } from 'react-native-elements'


const OptionModal = ({modalVisible, setModalVisible, content}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={{position:'absolute', right: 12, top: 12}}>
            <Icon name='close' type='antdesign' size={20} iconStyle={{}} onPress={() => setModalVisible(!modalVisible)}/>
          </View>
          <ScrollView
            style={{
              maxHeight: Math.min(400, 50 * (content.length + 1) + 40),
            }}
            contentContainerStyle={{
              paddingVertical: 10,
              alignSelf: 'center',
              flexGrow: 1
            }}
          >
            {content.map((item, key) => {
              return (
                  <Pressable
                      key={key}
                      style={[styles.button]}
                      onPress={item.press}>
                    <Text>{item.name}</Text>
                  </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    backgroundColor: '#fff',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 0.2,
    padding: 10,
  },
});

export default OptionModal;
