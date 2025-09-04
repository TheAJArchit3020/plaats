import React, {useEffect, useState} from 'react';
import {
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';

import EditPicture from '../../../components/camera/EditPicture';
import Camera from '../../../components/camera/Camera';

import {pictureLocation} from '../../../components/camera/Camera';

import AsyncStore from '../../../services/storage/AsyncStore';
import API from '../../../services/network/api';
import Icon from 'react-native-vector-icons/AntDesign';
import FastImage from '@d11/react-native-fast-image';
import Toast from 'react-native-toast-message';

const PicturesInput = ({projectObj, changesObj, modelItem, projectID}) => {
  const [token, setToken] = useState(null);
  const [index, setIndex] = useState(0);
  const [pictures, setPictures] = useState([]);
  const [pictureLocations, setPictureLocations] = useState([]);
  const [isCapturing, setCapturing] = useState(false);
  const [isViewing, setViewing] = useState(false);
  const [isEditing, setEditing] = useState(false);

  useEffect(() => {
    AsyncStore.getToken().then(setToken);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    const getLocations = async pics => {
      const locations = [];
      for (const pic of pics) {
        locations.push(await API.imageTryLocal(pic, projectID, token));
      }
      setPictureLocations(locations);
    };
    let pics;
    if (projectObj && projectObj[modelItem.name]) {
      pics = projectObj[modelItem.name];
    } else {
      pics = [];
    }
    getLocations(pics);
    setPictures(pics);
  }, [projectObj, modelItem, token]);

  const viewPicture = index => {
    setIndex(index);
    setViewing(true);
  };

  const updatePictures = pics => {
    changesObj[modelItem.name] = pics;
    projectObj[modelItem.name] = pics;
    setPictures(pics);
  };

  const addImageToBeUploaded = pic => {
    return AsyncStore.addImageToBeUploaded(pic, projectID).catch(() =>
      Toast.show({type: 'error', text1: 'Er ging iets mis met de foto'}),
    );
  };

  const replacePicture = (index, pic) => {
    const newPictures = [...pictures];
    newPictures[index] = pic;
    updatePictures(newPictures);

    const newLocations = [...pictureLocations];
    newLocations[index] = {uri: `file://${pictureLocation(projectID, pic)}`};
    setPictureLocations(newLocations);

    addImageToBeUploaded(pic);
  };

  const addPicture = async img => {
    await addImageToBeUploaded(img);
    updatePictures([...pictures, img]);
    const newLocation = {uri: `file://${pictureLocation(projectID, img)}`};
    setPictureLocations([...pictureLocations, newLocation]);
  };

  const removePicture = index => {
    const newPictures = [...pictures];
    newPictures.splice(index, 1);
    updatePictures(newPictures);

    const newLocations = [...pictureLocations];
    newLocations.splice(index, 1);
    setPictureLocations(newLocations);
  };

  if (isCapturing) {
    return (
      <Modal>
        <Camera
          projectID={projectID}
          onCapture={addPicture}
          close={() => setCapturing(false)}
        />
      </Modal>
    );
  } else if (isEditing) {
    return (
      <Modal>
        <EditPicture
          picture={pictureLocations[index]}
          projectID={projectID}
          onSave={pic => {
            replacePicture(index, pic);
            setEditing(false);
          }}
        />
      </Modal>
    );
  } else if (isViewing) {
    const isLocal = !pictureLocations[index].headers;
    return (
      <Modal>
        <FastImage
          style={{height: '100%', width: '100%', backgroundColor: 'black'}}
          resizeMode={'contain'}
          source={pictureLocations[index]}
        />
        <View
          style={{
            bottom: 0,
            top: 0,
            right: 0,
            position: 'absolute',
            zIndex: 9999,
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <View>
              {isLocal && (
                <TouchableOpacity
                  style={{padding: 20}}
                  onPress={() => {
                    setEditing(true);
                  }}>
                  <Icon name={'edit'} size={30} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{padding: 20}}
                onPress={() => setViewing(false)}>
                <Icon name={'back'} size={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Button
        style={{width: 10}}
        onPress={() => setCapturing(true)}
        title={'Open Camera'}
      />
      <ScrollView contentContainerStyle={styles.picturesContainer}>
        {pictureLocations.map((location, index) => (
          <TouchableOpacity
            style={{position: 'relative', marginTop: 20}}
            key={index}
            onPress={() => {
              viewPicture(index);
            }}>
            <FastImage
              style={{height: 120, width: 120}}
              resizeMode={'contain'}
              source={location}
            />
            <TouchableOpacity
              onPress={() => {
                removePicture(index);
              }}
              style={{position: 'absolute', right: 20, top: 25}}>
              <FastImage
                source={require('../../../../assets/remove.png')}
                style={styles.removeIcon}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  picturesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  removeIcon: {
    width: 20,
    height: 20,
    alignSelf: 'flex-end',
  },
});

export default PicturesInput;
