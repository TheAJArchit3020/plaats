import React, {useState} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {duplicateItem, makeOptionList, removeItem} from "../../../utils/drawer";
import {DrawerItem} from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/AntDesign";
import OptionModal from "../../../components/modals/OptionModal";
import EditModal from "../../../components/modals/EditModal";
import {customName} from "../../../utils";

const {TouchableOpacity} = Platform.select({
    ios: () => require('react-native'),
    android: () => require('react-native-gesture-handler'),
})();

const DrawerItemList = ({list, onPress, options, object, changes, refresh, roomPart, additionText}) => {
    const [longPressModalVisible, setLongPressModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [additionModalVisible, setAdditionModalVisible] = useState(false);
    const [room, setRoom] = useState(null);

    let roomLine;
    let customCSS = {paddingLeft: 30};
    if(roomPart){
        roomLine = <View style={{borderBottomColor: 'lightgrey', borderBottomWidth: 1}} />;
        customCSS = {};
    }

    return (
      <>
        <View style={{flexDirection: 'row'}}>
          <DrawerItem
              key={additionText}
              style={[styles.drawerItem, customCSS]}
              labelStyle={styles.drawerItemLabel}
              label={({color, size}) => (
                  <View>
                      <Text style={styles.drawerItemLabel}>{additionText}</Text>
                      <Icon
                          color={color}
                          size={size}
                          name={'plus'}
                          style={[styles.drawerIcon, styles.drawerItemLabel]}
                      />
                  </View>
              )}
              onPress={() => {
                  setAdditionModalVisible(!additionModalVisible);
              }}
          />
        </View>
        {roomLine}
        {list.map((item, key) => (
          <TouchableOpacity
            onLongPress={() => {
                setRoom(item);
                setLongPressModalVisible(!longPressModalVisible);
            }}
            key={key}
            onPress={() => {
                onPress(item);
            }}
          >
            <DrawerItem
              style={[styles.drawerItem, customCSS]}
              labelStyle={styles.drawerItemLabel}
              label={customName(item)}
              onPress={() => {}}
            />
          </TouchableOpacity>
        ))}
        <OptionModal
          modalVisible={additionModalVisible}
          setModalVisible={setAdditionModalVisible}
          content={makeOptionList(
              options,
              () => {
                  setAdditionModalVisible(!additionModalVisible);
                  refresh();
              },
              object,
          )}
        />
        <EditModal
          modalVisible={editModalVisible}
          setModalVisible={setEditModalVisible}
          changeName={(name) => {
              room.projectObj.CustomName = name;
              room.changesObj.CustomName = name;
          }}
          itemName={room ? room.name : ''}
        />
        <OptionModal
            modalVisible={longPressModalVisible}
            setModalVisible={setLongPressModalVisible}
            content={[
                {
                    name: 'Item verwijderen',
                    press: () => {
                        removeItem(room, changes);
                        setLongPressModalVisible(!longPressModalVisible);
                        refresh();
                    },
                },
                {
                    name: 'Item hernoemen',
                    press: () => {
                        setEditModalVisible(!editModalVisible);
                        setLongPressModalVisible(!longPressModalVisible);
                    },
                },
                {
                    name: 'Item dupliceren',
                    press: () => {
                        duplicateItem(room);
                        setLongPressModalVisible(!longPressModalVisible);
                        refresh();
                    },
                },
            ]}
        />
      </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingLeft: 40,
        paddingRight: 10,
    },
    drawerItemLabel: {
        fontSize: 18,
        letterSpacing: 3,
        color: 'black',
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    drawerItem: {
        width: '100%',
        flex: 1,
    },
    drawerIcon: {
        position: 'absolute',
        right: 0,
    },
});

export default DrawerItemList;
