import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Toasty from '../../components/Toasty';
import API from '../../services/network/api';
import EditModal from '../../components/modals/EditModal';
import {handleError, NetworkConfig, verifyAndSendMissingPictures} from '../../utils';
import {removeItem} from '../../utils/drawer';

const ProjectHeader = ({
  projectID,
  drawerItem,
  changes,
  navigation,
  refreshDrawer,
}) => {
  const [downloadStatus, setDownloadStatus] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (downloadStatus) {
      Toasty.info(downloadStatus);
    }
  }, [downloadStatus]);

  const downloadPDF = useCallback(() => {
    setIsDownloading(true);
    verifyAndSendMissingPictures(projectID).then(() => {
      const intervalID = setInterval(() => {
        API.getReportStatus(projectID).then(setDownloadStatus);
      }, 2000);
      API.startReportGeneration(projectID)
        .then(async () => {
          Linking.openURL(
            (await NetworkConfig()).REPORT + '/' + projectID + '_opt.pdf',
          ).catch(() => Toasty.error('Geen app gevonden om de pdf te openen'));
        })
        .catch((e) =>
          handleError(e, () =>
            Toasty.error('Er ging iets mis bij het downloaden'),
          ),
        )
        .finally(() => {
          clearInterval(intervalID);
          setIsDownloading(false);
        });
    });
  }, [projectID]);

  const edit = (name) => {
    drawerItem.projectObj.CustomName = name;
    drawerItem.changesObj.CustomName = name;
    refreshDrawer();
  };

  const remove = () => {
    const algemeen = drawerItem.parentDrawerItem.content[0];
    removeItem(drawerItem, changes);
    refreshDrawer();
    navigation.navigate('Input', algemeen);
  };

  return (
    <>
      <View style={[styles.viewStyle, {marginRight: 10}]}>
        <View style={[styles.viewStyle]}>
          {drawerItem.isEditable && (
            <>
              <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
                <Icon name={'edit'} size={22} style={styles.iconStyle} />
              </TouchableOpacity>
              <TouchableOpacity onPress={remove}>
                <Icon name={'delete'} size={22} style={styles.iconStyle} />
              </TouchableOpacity>
            </>
          )}
          {isDownloading ? (
            <ActivityIndicator
              color={'lightgrey'}
              style={{marginHorizontal: 5}}
            />
          ) : (
            <TouchableOpacity onPress={downloadPDF}>
              <Icon name={'pdffile1'} size={22} style={styles.iconStyle} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <EditModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        changeName={edit}
        itemName={drawerItem.name}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
  },
  iconStyle: {
    paddingRight: 5,
    paddingLeft: 10,
  },
  viewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    backgroundColor: '#fff',
    marginTop: 10,
  },
});

export default ProjectHeader;
