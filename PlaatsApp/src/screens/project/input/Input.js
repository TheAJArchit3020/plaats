import SuggestionInput from './SuggestionInput';
import DateView from './DateView';
import {Text, View, StyleSheet} from 'react-native';
import React from 'react';
import Section from './Section';
import PicturesInput from './PicturesInput';
import {getOrMakeObject} from '../../../utils';
import Dropdown from './Dropdown';

const Input = ({
  projectObj,
  changesObj,
  modelItem,
  projectID,
  nestedSection = false,
}) => {
  const make = () => {
    switch (modelItem.type) {
      case 'suggestion':
      case 'select':
      case 'text':
      case 'number':
      case 'color':
      case 'textarea':
        return (
          <SuggestionInput
            projectObj={projectObj}
            changesObj={changesObj}
            modelItem={modelItem}
          />
        );
      case 'date':
        return (
          <DateView
            projectObj={projectObj}
            changesObj={changesObj}
            modelItem={modelItem}
          />
        );
      case 'image':
        return (
          <PicturesInput
            projectID={projectID}
            projectObj={projectObj}
            changesObj={changesObj}
            modelItem={modelItem}
          />
        );
      case 'section':
        return (
          <View>
            <Section
              modelItem={modelItem}
              nested={nestedSection}
              style={styles.section}>
              {modelItem.content.map((item, key) => (
                <Input
                  projectObj={getOrMakeObject(projectObj, modelItem.name)}
                  changesObj={getOrMakeObject(changesObj, modelItem.name)}
                  projectID={projectID}
                  modelItem={item}
                  key={key}
                  nestedSection={true}
                />
              ))}
            </Section>
          </View>
        );
      case 'dropdown':
        return (
          <Dropdown
            modelItem={modelItem}
            projectItem={projectObj}
            projectID={projectID}
            changes={changesObj}
          />
        );
      default:
        return <View />;
    }
  };

  if (modelItem.type === 'section' || modelItem.type === 'dropdown' || modelItem.type === 'image') {
    return <View style={styles.section}>{make()}</View>;
  } else {
    return (
      <View style={styles.input}>
        <Text style={styles.label}>{modelItem.name}</Text>
        {make()}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  label: {
    fontWeight: '700',
    paddingRight: 30,
    paddingBottom: 11,
    width: 150,
    fontSize: 17,
    textAlign: 'right',
  },
  section: {
    flex: 1,
    paddingTop: 20,
  },
  input: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 25,
  },
});

export default Input;
