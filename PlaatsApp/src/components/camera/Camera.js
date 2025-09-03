import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import uuid from 'react-native-uuid';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/AntDesign';
import {
  Camera as VisionCamera,
  useCameraDevice,
} from 'react-native-vision-camera';
import CameraRoll from '@react-native-camera-roll/camera-roll';

const pictureLocation = (projectID, pictureID) => {
  return `${RNFS.DocumentDirectoryPath}/pictures/${projectID}/${pictureID}`;
};

async function ensurePermissions() {
  // Camera
  const camStatus = await VisionCamera.requestCameraPermission();
  if (camStatus !== 'granted') throw new Error('Camera permission denied');

  // Media (Android)
  if (Platform.OS === 'android') {
    const api = Number(Platform.Version);
    // Android 13+ uses READ_MEDIA_IMAGES
    const READ_MEDIA_IMAGES =
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES ||
      'android.permission.READ_MEDIA_IMAGES';

    if (api >= 33) {
      await PermissionsAndroid.request(READ_MEDIA_IMAGES);
    } else {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      if (api < 29) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
      }
    }
  }
}

async function takePicture(cameraRef, projectID) {
  if (!cameraRef.current) throw new Error('Camera not ready');

  const projectDir = `${RNFS.DocumentDirectoryPath}/pictures/${projectID}/`;
  await RNFS.mkdir(projectDir);

  const name = `${uuid.v4()}.jpg`;
  const destPath = projectDir + name;

  // capture
  const photo = await cameraRef.current.takePhoto({
    qualityPrioritization: 'quality',
    flash: 'off',
    enableShutterSound: Platform.OS === 'android',
  });

  // move/copy into your app folder
  await RNFS.copyFile(photo.path, destPath);

  // save to gallery (fire-and-forget)
  const rollPath = photo.path.startsWith('file://')
    ? photo.path
    : `file://${photo.path}`;
  CameraRoll.save(rollPath, {type: 'photo'}).catch(() => {});

  return name;
}

const Camera = ({onCapture, close, projectID}) => {
  const cameraRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [ready, setReady] = useState(false);

  const device = useCameraDevice('back');

  useEffect(() => {
    (async () => {
      try {
        await ensurePermissions();
        setReady(true);
      } catch (e) {
        Alert.alert('Permission required', 'Please grant camera permissions.');
      }
    })();
  }, []);

  const canShowCamera = useMemo(() => !!device && ready, [device, ready]);
  return (
    <View style={styles.container}>
      {canShowCamera ? (
        <VisionCamera
          ref={cameraRef}
          style={styles.preview}
          device={device}
          isActive={true}
          photo={true}
        />
      ) : (
        <View style={[styles.preview, {justifyContent: 'center'}]}>
          <Text style={{color: 'white'}}>Loading Camera</Text>
        </View>
      )}

      <View style={styles.controls}>
        <View style={{alignItems: 'center'}}>
          <TouchableOpacity
            style={[
              styles.capture,
              {backgroundColor: isCapturing ? 'black' : 'white'},
            ]}
            disabled={!canShowCamera || isCapturing}
            onPress={async () => {
              if (isCapturing || !canShowCamera) return;
              try {
                setIsCapturing(true);
                const fileName = await takePicture(cameraRef, projectID);
                onCapture(fileName);
              } catch (e) {
                console.warn(e);
                Alert.alert('Foto mislukt');
              } finally {
                setIsCapturing(false);
              }
            }}
          />
          <TouchableOpacity onPress={close} style={{marginTop: 8}}>
            <Icon name="arrowleft" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, flexDirection: 'row', backgroundColor: 'black'},
  preview: {flex: 1, justifyContent: 'flex-end', alignItems: 'center'},
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  capture: {margin: 30, height: 80, width: 80, borderRadius: 40},
  close: {},
});

export {Camera, pictureLocation};
