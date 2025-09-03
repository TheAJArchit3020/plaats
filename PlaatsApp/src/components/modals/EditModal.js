import React, {useEffect} from 'react';
import { KeyboardAvoidingView } from 'react-native';
import {Modal, StyleSheet, Text, TextInput, View} from 'react-native';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';

const EditModal = ({modalVisible, setModalVisible, changeName, itemName}) => {
  const [text, setText] = React.useState('');

  useEffect(() => {
    setText(itemName);
  }, [itemName]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <KeyboardAvoidingView behavior={'padding'}>
          <View style={styles.modalView}>
            <TextInput style={styles.input} onChangeText={setText} value={text} />
            <View style={{flexDirection: 'row'}}>
              <Pressable
                style={[styles.button, {backgroundColor: 'grey', marginRight: 10}]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textWhite}>Sluiten</Text>
              </Pressable>
              <Pressable
                style={[styles.button, {backgroundColor: '#CFDC00'}]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  changeName(text);
                }}>
                <Text style={styles.textWhite}>Opslaan</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  textWhite: {
    color: 'white',
  },
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
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 0.2,
    padding: 10,
    fontSize: 18,
  },
});

export default EditModal;
