import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';

import {DrawerItem} from '@react-navigation/drawer';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/AntDesign';

import AsyncStore from '../../../services/storage/AsyncStore';
import Toasty from '../../../components/Toasty';

import {
  makeDrawerContent,
  getDrawerItems,
  cleanItem,
  customName,
} from '../../../utils';
import ExpandableItem from './ExpandableItem';
import RoomPart from './RoomPart';

const DrawerView = ({project, changes, navigation, scrollToTop}) => {
  const [content, setContent] = useState(null);
  const [roomDrawerItem, setRoomDrawerItem] = useState(null);
  const [categories, setCategories] = useState(null);
  const [itemOptions, setItemOptions] = useState(null);
  const [roomOptions, setRoomOptions] = useState({});
  const [isLoading, setLoading] = useState(true);
  const items = getDrawerItems(content, roomDrawerItem, categories);

  useEffect(() => {
    Promise.all([
      AsyncStore.getDrawerOptions().then(setItemOptions),
      AsyncStore.getRoomItems().then(setRoomOptions),
      AsyncStore.getCategories().then(setCategories),
      AsyncStore.getOrderModel().then((orderModel) => {
        setContent(makeDrawerContent(project, changes, orderModel));
      }),
    ])
      .then(() => setLoading(false))
      .catch(() => Toasty.error('Kan opties niet laden!'));
  }, []);

  const onPressItem = (drawerItem) => {
    if (drawerItem.content) {
      // It's a room
      setRoomDrawerItem(drawerItem);
      scrollToTop();
      // Click on Algemeen
      onPressItem(drawerItem.content[0]);
    } else {
      navigation.navigate('Input', drawerItem);
    }
  };

  const refreshDrawerContent = () => {
    setCategories({...categories});
  };

  const exitRoom = () => {
    setRoomDrawerItem(null);
    // Open Object item (second in drawerContent)
    navigation.navigate('Input', content[1]);
  };

  if (isLoading) {
    return <View style={{backgroundColor: 'white'}} />;
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: '#CFDC00',
          height: 200,
          flex: 1,
          padding: 15,
          justifyContent: 'flex-end',
        }}>
        {!roomDrawerItem && (
          <Text style={{color: 'white', fontSize: 20, fontWeight: '600'}}>
            {project ? project.Object.Stad : ''}
          </Text>
        )}
        <Text style={{color: 'white', fontSize: 23, fontWeight: '700'}}>
          {roomDrawerItem
            ? customName(roomDrawerItem)
            : project
            ? project.Object.Adres
            : ''}
        </Text>
      </View>

      {roomDrawerItem ? (
        <>
          <TouchableOpacity onPress={exitRoom}>
            <View style={styles.backButton}>
              <Icon name={'arrowleft'} size={30} color="black" />
              <Text style={styles.drawerItemLabel}>Terug</Text>
            </View>
          </TouchableOpacity>
          <View style={{borderLeftWidth: 10, borderColor: '#31A1ED'}}>
            <DrawerItem
              style={[styles.drawerItem]}
              labelStyle={styles.drawerItemLabel}
              label={'Algemeen'}
              onPress={() => onPressItem(items.algemeen)}
            />
          </View>
          <RoomPart
            roomDrawerItem={roomDrawerItem}
            items={items.base}
            color={'#ED7D31'}
            onPress={onPressItem}
            name={'Basis'}
            options={categories.base}
            refreshDrawer={refreshDrawerContent}
            changes={changes}
          />
          <RoomPart
            roomDrawerItem={roomDrawerItem}
            items={items.specific}
            color={'#325490'}
            onPress={onPressItem}
            name={'Specifiek'}
            options={roomOptions[cleanItem(roomDrawerItem.name)]}
            refreshDrawer={refreshDrawerContent}
            changes={changes}
          />
          <RoomPart
            roomDrawerItem={roomDrawerItem}
            items={items.conformity}
            color={'#70AD47'}
            onPress={onPressItem}
            name={'Conformiteit'}
            options={categories.conformity}
            refreshDrawer={refreshDrawerContent}
            changes={changes}
          />
        </>
      ) : (
        items.map((item, key) => {
          if (item.content && !roomDrawerItem) {
            return (
              <ExpandableItem
                key={key}
                item={item}
                onPress={onPressItem}
                options={itemOptions[item.name]}
                changes={changes}
                refreshDrawer={refreshDrawerContent}
              />
            );
          } else {
            return (
              <DrawerItem
                key={key}
                style={[styles.drawerItem]}
                labelStyle={[styles.drawerItemLabel]}
                label={customName(item)}
                onPress={() => onPressItem(item)}
              />
            );
          }
        })
      )}
    </View>
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
  backButton: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 10,
    paddingRight: 30,
  },
});

export default DrawerView;
