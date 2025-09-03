import React, {useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

const Section = ({
  modelItem,
  children,
  nested = false,
  cross = false,
  onPressCross = () => {},
}) => {
  const [isExpanded, setExpanded] = useState(false);
  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <Text
          style={[styles.section, nested ? {paddingLeft: nested ? 40 : 0} : {}]}
          onPress={() => setExpanded(!isExpanded)}>
          {modelItem.name}
        </Text>
        {cross && (
          <TouchableOpacity onPress={onPressCross} style={{marginLeft: 10}}>
            <Text style={styles.section}>X</Text>
          </TouchableOpacity>
        )}
      </View>
      {isExpanded && <View style={{flex: 1}}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    fontSize: 18,
    letterSpacing: 3,
    color: 'black',
    textTransform: 'uppercase',
    fontWeight: '700',
    paddingVertical: 5,
  },
});

export default Section;
