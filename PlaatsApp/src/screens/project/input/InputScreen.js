import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import AsyncStore from '../../../services/storage/AsyncStore';
import Input from './Input';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {cleanItem} from '../../../utils';
import Toasty from '../../../components/Toasty';

const InputScreen = ({
  name,
  projectObj,
  changesObj,
  storeProject,
  projectID,
}) => {
  const [model, setModel] = useState(null);

  useEffect(() => {
    setModel(null);
    AsyncStore.getTemplates()
      .then((result) => {
        const newModel = result[cleanItem(name)];
        if (newModel['data-type']) {
          newModel.content = newModel.content.concat(result.Uniform.content);
        }
        setModel(newModel);
      })
      .catch(() => Toasty.error('Er ging iets mis bij het input scherm'));

    // Store project gets called on cleanup
    return storeProject;
  }, [name]);

  if (!model) {
    return (
      <View
        style={{
          flex: 1,
          paddingLeft: 30,
          paddingRight: 30,
          height: '100%',
          width: '100%',
          backgroundColor: 'white',
          position: 'relative',
        }}
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingLeft: 30,
        paddingRight: 30,
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        position: 'relative',
      }}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps={'handled'}>
        {model.content.map((modelItem, index) => (
          <Input
            projectObj={projectObj}
            changesObj={changesObj}
            modelItem={modelItem}
            key={index}
            projectID={projectID}
          />
        ))}
        <View style={{height: 210}} />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default InputScreen;
