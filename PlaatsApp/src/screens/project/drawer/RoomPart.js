import React from 'react';
import {View} from 'react-native';
import DrawerItemList from "./DrawerItemList";

const RoomPart = ({
  roomDrawerItem,
  name,
  items,
  onPress,
  color,
  options,
  refreshDrawer,
  changes,
}) => {
  if (options.length === 0 && items.length === 0) {
    return <View />;
  }

  return (
    <View style={{borderLeftWidth: 10, borderColor: color}}>
      <DrawerItemList
          list={items}
          onPress={onPress}
          options={options}
          object={roomDrawerItem}
          changes={changes}
          refresh={refreshDrawer}
          roomPart={true}
          additionText={name}
      />
    </View>
  );
};

export default RoomPart;
