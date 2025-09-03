import React, {useEffect, useState} from 'react';
import {Button, Modal, StyleSheet, Text, View, Pressable} from 'react-native';

import Toasty from '../../../components/Toasty';
import AsyncStore from '../../../services/storage/AsyncStore';
import {cleanItem, getOrMakeObject} from '../../../utils';

import Input from './Input';
import Section from './Section';
import {makeName} from '../../../utils/drawer';

const Dropdown = ({projectItem, modelItem, projectID, changes}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [children, setChildren] = useState([]);
  const [templates, setTemplates] = useState(null);

  useEffect(() => {
    AsyncStore.getTemplates()
      .then(setTemplates)
      .catch(() => Toasty.error('Opgeslagen data niet geladen!'));
  }, []);

  useEffect(() => {
    if (templates) {
      setInitialChildren();
    }
  }, [projectItem, templates]);

  const setInitialChildren = () => {
    setChildren(
      Object.keys(projectItem)
        .filter((key) => key !== '')
        .map((key) => {
          return {
            name: key,
            type: 'section',
            content: templates[cleanItem(key)],
          };
        }),
    );
  };

  const addItem = (item) => {
    const [newName, indexToInsert] = makeName(
      item,
      children.map((i) => i.name),
    );
    setChildren([
      ...children,
      {
        name: newName,
        type: 'section',
        content: templates[cleanItem(item)],
      },
    ]);
  };

  const removeItem = (item) => {
    delete projectItem[item.name];
    delete changes[item.name];
    setChildren(children.filter((oldItem) => oldItem.name !== item.name));
  };

  return (
    <View style={{flex: 1}}>
      <Button
        title={'Voeg Vaststelling Toe'}
        onPress={() => setModalVisible(!modalVisible)}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {modelItem.options.map((item, key) => (
              <Pressable
                style={[styles.button, {}]}
                key={key}
                onPress={() => {
                  addItem(item);
                  setModalVisible(!modalVisible);
                }}>
                <Text>{item}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.button, {backgroundColor: 'lightgrey'}]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text>Sluiten</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={{flex: 1, marginTop: 20}}>
        {children.map((elem, key) => (
          <Section
            modelItem={elem}
            nested={true}
            style={styles.section}
            cross={true}
            onPressCross={() => removeItem(elem)}
            key={key}>
            {elem.content.map((item, key) => (
              <Input
                projectObj={getOrMakeObject(projectItem, elem.name)}
                changesObj={getOrMakeObject(changes, elem.name)}
                modelItem={item}
                projectID={projectID}
                key={key}
                nestedSection={true}
              />
            ))}
          </Section>
        ))}
      </View>
    </View>
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
  },
  section: {
    flex: 1,
    paddingVertical: 20,
  },
});

export default Dropdown;
