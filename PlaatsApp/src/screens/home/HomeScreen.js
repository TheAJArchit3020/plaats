import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  LogBox,
} from 'react-native';

import Icon from 'react-native-vector-icons/AntDesign';
import Toasty from '../../components/Toasty';

import Card from '../../components/Card';

import AsyncStore from '../../services/storage/AsyncStore';
import {sync} from '../../services/network/sync';
import {ObjectId, useInterval} from '../../utils';

import {AuthContext} from '../login/LoginScreen';
import Splash from '../../components/Splash';

const PER_PAGE = 9;
const SYNC_INTERVAL = 120 * 1000;

const HomeScreen = ({navigation}) => {
  const [page, setPage] = useState(1);
  const [token, setToken] = useState('');
  const [projects, setProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isSynchronizing, setSynchronizing] = useState(false);
  const {signOut} = React.useContext(AuthContext);

  LogBox.ignoreLogs(['Setting a timer for a long period of time']);

  const retrieve = async () => {
    // Gets data from local storage
    Promise.all([
      AsyncStore.getToken().then(setToken),
      AsyncStore.getSavedProjects().then(setSavedProjects),
      AsyncStore.getProjectSummaries().then(setProjects),
    ])
      .catch(() => {
        Toasty.error(
          'Gegevens niet van toestel kunnen ophalen, probeer te synchroniseren',
        );
      })
      .finally(() => setLoading(false));
  };

  const synchronize = (manuallyCalled = true) => {
    console.log(isSynchronizing);
    if (isSynchronizing) {
      return;
    }
    console.log('sync');
    setSynchronizing(true);
    sync(manuallyCalled)
      .then(retrieve)
      .finally(() => setSynchronizing(false));
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  const nextPage = () => {
    const pages = Math.floor(projects.length / PER_PAGE) + 1;
    if (page < pages) {
      setPage(page + 1);
    }
  };
  const newProject = () => {
    navigation.navigate('Project', {
      id: ObjectId(),
      newProject: true,
    });
  };

  useEffect(() => {
    // Refresh when coming back from project
    return navigation.addListener('focus', () => {
      retrieve();
    });
  }, [navigation]);

  useEffect(() => {
    retrieve();
  }, []);

  useEffect(() => {
    // First time that app is loaded, synchronize automatically
    if (projects === null && !isLoading) {
      synchronize();
    }
  }, [projects, isLoading]);

  useInterval(() => synchronize(false), SYNC_INTERVAL);

  if (isLoading) {
    return <Splash text={'Laden'} />;
  }

  return (
    <ScrollView style={{backgroundColor: 'white', flex: 1}}>
      <View style={{width: '100%'}}>
        <Image
          style={styles.image}
          source={require('../../../assets/habicom.png')}
        />
      </View>
      <View style={styles.container}>
        <View style={styles.iconsContainer}>
          <TouchableIcon onPress={previousPage} name={'left'} />
          <Text style={{fontSize: 30, padding: 10}}>{page}</Text>
          <TouchableIcon onPress={nextPage} name={'right'} />
        </View>
        <View style={styles.iconsContainer}>
          <TouchableIcon onPress={newProject} name={'plus'} />
          <View style={{width: 30}} />
          {isSynchronizing ? (
            <ActivityIndicator color={'lightgrey'} />
          ) : (
            <TouchableIcon onPress={synchronize} name={'sync'} />
          )}
          <View style={{width: 30}} />
          <TouchableIcon onPress={signOut} name={'logout'} color={'red'} />
        </View>
      </View>

      <Cards
        navigation={navigation}
        projects={projects}
        savedProjects={savedProjects}
        page={page}
        token={token}
      />
    </ScrollView>
  );
};

const TouchableIcon = ({onPress, name, color = 'black'}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon name={name} size={30} color={color} />
    </TouchableOpacity>
  );
};

const Cards = ({projects, savedProjects, token, page, navigation}) => {
  return (
    <View style={styles.cards}>
      {projects &&
        projects
          .slice(PER_PAGE * (page - 1), PER_PAGE * page)
          .map((project, id) => (
            <Card
              onPress={() =>
                navigation.navigate('Project', {
                  id: project._id,
                  newProject: false,
                })
              }
              key={`card-${id}`}
              title={project.adres}
              description={project.stad}
              isSaved={savedProjects.includes(project._id)}
              img={project.foto}
              token={token}
              projectID={project._id}
            />
          ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  image: {
    width: 250,
    marginBottom: 10,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  container: {
    marginHorizontal: 50,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});

export default HomeScreen;
