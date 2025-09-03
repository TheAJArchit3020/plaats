import React, {useState} from 'react';
import {StyleSheet} from 'react-native';

import {DrawerItem} from '@react-navigation/drawer';

import DrawerItemList from "./DrawerItemList";


const ExpandableItem = ({item, onPress, options, changes, refreshDrawer, }) => {
  const [isExpanded, setExpanded] = useState(Boolean(item.isExpanded));

  return (
    <>
      <DrawerItem
        style={styles.drawerItem}
        labelStyle={[styles.drawerItemLabel, {paddingLeft: 0}]}
        label={item.name}
        onPress={() => {
          item.isExpanded = !isExpanded;
          setExpanded(!isExpanded);
        }}
      />
      {isExpanded && (
        <>
          <DrawerItemList
              list={item.content}
              object={item}
              onPress={onPress}
              options={options}
              changes={changes}
              refresh={refreshDrawer}
              additionText={'Voeg Toe'}
              roomPart={false}
          />
        </>
      )}
    </>
  )};

const styles = StyleSheet.create({
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
});

export default ExpandableItem;
