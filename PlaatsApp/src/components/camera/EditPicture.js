// EditPicture.js
import React, {useMemo, useRef, useState} from 'react';
import {
  View,
  Image,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';
import Svg, {Path} from 'react-native-svg';
import Icon from 'react-native-vector-icons/AntDesign';
import uuid from 'react-native-uuid';
import {pictureLocation} from './Camera';

const {width: SCREEN_W} = Dimensions.get('window');

const EditPicture = ({picture, projectID, onSave}) => {
  const shotRef = useRef(null);
  const [paths, setPaths] = useState([]); // each path: { d, color, width }
  const [current, setCurrent] = useState(null); // { points: [x,y,...] }

  const strokeColor = '#CFDC00';
  const strokeWidth = 7;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          const {locationX, locationY} = evt.nativeEvent;
          setCurrent({points: [locationX, locationY]});
        },
        onPanResponderMove: evt => {
          const {locationX, locationY} = evt.nativeEvent;
          setCurrent(prev =>
            prev ? {points: [...prev.points, locationX, locationY]} : prev,
          );
        },
        onPanResponderRelease: () => {
          if (!current || current.points.length < 2) {
            setCurrent(null);
            return;
          }
          const d = pointsToPath(current.points);
          setPaths(prev => [
            ...prev,
            {d, color: strokeColor, width: strokeWidth},
          ]);
          setCurrent(null);
        },
        onPanResponderTerminate: () => setCurrent(null),
      }),
    [current, strokeColor, strokeWidth],
  );

  const pointsToPath = pts => {
    if (!pts || pts.length < 4) return '';
    // simple polyline-to-path
    let d = `M ${pts[0]} ${pts[1]}`;
    for (let i = 2; i < pts.length; i += 2) {
      d += ` L ${pts[i]} ${pts[i + 1]}`;
    }
    return d;
  };

  const undo = () => setPaths(prev => prev.slice(0, -1));

  const save = async () => {
    try {
      const uri = await shotRef.current.capture(); // base64 by default? We'll request file uri
      // ViewShot default is 'png' + returns file:// path if 'file' result
      // Explicitly request 'file' so we can copy it to our app dir:
    } catch (e) {
      // re-run with explicit options
    }
  };

  const saveExplicit = async () => {
    try {
      const temp = await shotRef.current.capture({
        format: 'png',
        quality: 1,
        result: 'tmpfile', // returns a file:// path
      });
      const name = `${uuid.v4()}.png`;
      const destPath = pictureLocation(projectID, name);
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/pictures/${projectID}/`);
      await RNFS.copyFile(temp, destPath);
      onSave(name);
    } catch (e) {
      console.warn(e);
      Alert.alert('Opslaan mislukt');
    }
  };

  // Scale image to screen width to keep touch coords aligned
  // (Assumes picture.width/height are available. If not, Image.getSize)
  const [imgW, setImgW] = useState(SCREEN_W);
  const [imgH, setImgH] = useState(SCREEN_W);
  const onImgLayout = () => {
    if (picture?.width && picture?.height) {
      const ratio = picture.width / picture.height;
      const w = SCREEN_W;
      const h = w / ratio;
      setImgW(w);
      setImgH(h);
    }
  };

  const currentPathD = current ? pointsToPath(current.points) : '';

  return (
    <View style={{flex: 1, backgroundColor: 'black'}}>
      <ViewShot
        ref={shotRef}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black',
        }}>
        <View onLayout={onImgLayout} {...pan.panHandlers}>
          <Image
            source={{uri: picture.uri}}
            style={{width: imgW, height: imgH, resizeMode: 'contain'}}
          />
          <Svg
            style={StyleSheet.absoluteFill}
            width={imgW}
            height={imgH}
            viewBox={`0 0 ${imgW} ${imgH}`}>
            {paths.map((p, idx) => (
              <Path
                key={idx}
                d={p.d}
                stroke={p.color}
                strokeWidth={p.width}
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
            ))}
            {currentPathD ? (
              <Path
                d={currentPathD}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
          </Svg>
        </View>
      </ViewShot>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.btn} onPress={undo}>
          <Icon name="back" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={saveExplicit}>
          <Icon name="check" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  btn: {padding: 20},
});

export default EditPicture;
