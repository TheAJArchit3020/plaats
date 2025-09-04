import React, {useRef} from 'react';
import {View, TouchableOpacity} from 'react-native';
import RNFS from 'react-native-fs';

import {SketchCanvas} from '@sourcetoad/react-native-sketch-canvas';
import Icon from 'react-native-vector-icons/AntDesign';
import uuid from 'react-native-uuid';
import {pictureLocation} from './Camera';

const EditPicture = ({picture, projectID, onSave}) => {
  const canvas = useRef(null);

  const save = () => {
    canvas.current.getBase64('jpg', false, true, true, true, onSaved);
  };

  const onSaved = async (error, base64) => {
    const name = uuid.v4() + '.jpg';
    const path = pictureLocation(projectID, name);
    await RNFS.writeFile(path, base64, 'base64');
    onSave(name);
  };

  return (
    <View style={{flex: 1, flexDirection: 'row', position: 'relative'}}>
      <SketchCanvas
        ref={canvas}
        style={{flex: 1, backgroundColor: 'black'}}
        strokeColor={'#CFDC00'}
        strokeWidth={7}
        localSourceImage={{filename: picture.uri.replace('file://', '')}}
      />
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          flex: 1,
          justifyContent: 'center',
        }}>
        <View>
          <TouchableOpacity style={{padding: 20}} onPress={save}>
            <Icon name={'check'} size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{padding: 20}}
            onPress={() => canvas.current.undo()}>
            <Icon name={'back'} size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default EditPicture;
