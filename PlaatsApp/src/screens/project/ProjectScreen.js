import React, {useCallback, useEffect, useRef, useState} from 'react';

import ContentScreen from './ContentScreen';
import {createDrawerNavigator} from '@react-navigation/drawer';
import DrawerView from './drawer/DrawerView';
import API from '../../services/network/api';
import DiskStore from '../../services/storage/DiskStore';
import Splash from '../../components/Splash';
import AsyncStore from '../../services/storage/AsyncStore';
import {useWindowDimensions, AppState, ScrollView} from 'react-native';
import Toasty from '../../components/Toasty';
import {makeDrawerItem} from '../../utils/drawer';

const Drawer = createDrawerNavigator();
const SAVE_INTERVAL = 60000;
const TIME_SPENT_SAVE_INTERVAL = 30000;

const CustomDrawerContent = (props) => {
  const ref = useRef(null);
  return (
    <ScrollView ref={ref} {...props} style={{paddingTop: 0, marginTop: 0}}>
      <DrawerView
        scrollToTop={() => {
          ref.current.scrollTo({x: 0, y: 0});
        }}
        navigation={props.navigation}
        project={props.project}
        changes={props.changes}
      />
    </ScrollView>
  );
};

const ProjectScreen = ({route, navigation}) => {
  const [project, setProject] = useState(null);
  const [changes, setChanges] = useState(null);
  const [loadingText, setLoadingText] = useState('Ophalen...');
  const [appState, setAppState] = useState('active');
  const dimensions = useWindowDimensions();
  const projectID = route.params.id;

  useEffect(() => {
    const func = (s) => setAppState(s);
    AppState.addEventListener('change', func);
    return () => {
      AppState.removeEventListener('change', func);
    };
  }, []);

  const addTimeSpent = useCallback(() => {
    if (appState === 'active' && changes) {
      changes.mobileTimeSpent = changes.mobileTimeSpent
        ? changes.mobileTimeSpent + TIME_SPENT_SAVE_INTERVAL / 1000
        : TIME_SPENT_SAVE_INTERVAL / 1000;
    }
  }, [appState, changes]);

  useEffect(() => {
    const interval = setInterval(addTimeSpent, TIME_SPENT_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [addTimeSpent]);

  useEffect(() => {
    if (!(changes && project)) {
      return;
    }

    // The addListener returns an unsubscribe method, and we return this to the react which calls it at cleanup
    return navigation.addListener('beforeRemove', (e) => {
      // Store the project one last time when exiting
      storeProject();

      // Only go back when summaries are updated
      e.preventDefault();
      const goBack = () => navigation.dispatch(e.data.action);
      AsyncStore.addOrUpdateSummary(project, changes, projectID).finally(
        goBack,
      );
    });
  }, [changes, project, projectID]);

  useEffect(() => {
    if (route.params.newProject) {
      AsyncStore.getEmptyProject()
        .then((emptyProject) => {
          setProject(emptyProject);
          setChanges(emptyProject);
        })
        .then(() => AsyncStore.addSavedProject(projectID))
        .catch(() => {
          Toasty.error('Er ging iets mis bij het laden van een nieuw project');
        });
      return;
    }

    DiskStore.readProject(projectID)
      .then((projectFromDisk) => {
        setProject(projectFromDisk);
      })
      .catch(() => {
        setLoadingText('Ophalen van server...');
        API.getProject(projectID)
          .then(setProject)
          .then(() => AsyncStore.addSavedProject(projectID))
          .catch(() => {
            navigation.goBack();
            Toasty.error('Ophalen mislukt!');
          });
      });

    DiskStore.readProjectChanges(projectID)
      .then((changesFromDisk) => {
        setChanges(changesFromDisk);
      })
      .catch(() => {
        Toasty.error('Veranderingen niet kunnen ophalen');
        setChanges({});
      });
  }, [route.params.id, route.params.newProject]);

  useEffect(() => {
    const interval = setInterval(() => {
      storeProject();
    }, SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const storeProject = () => {
    if (project == null || changes == null) {
      return;
    }
    Promise.all([
      DiskStore.storeProject(project, projectID),
      DiskStore.storeProjectChanges(changes, projectID),
    ]).catch(() => Toasty.error('Opslaan mislukt!'));
  };

  if (project == null || changes == null) {
    return <Splash text={loadingText} />;
  }
  return (
    <Drawer.Navigator
      drawerStyle={{
        marginTop: -30,
      }}
      drawerType={dimensions.width >= 768 ? 'permanent' : 'front'}
      drawerContent={(props) => (
        <CustomDrawerContent {...props} project={project} changes={changes} />
      )}>
      <Drawer.Screen
        name="Input"
        // drawerItems have the exact right parameters for the ContentScreen/InputScreen
        initialParams={makeDrawerItem('Object', project, changes)}>
        {(props) => (
          <ContentScreen
            {...props}
            projectID={projectID}
            storeProject={storeProject}
            changes={changes}
            refreshDrawer={() => {
              // Trigger refresh with state (loadingText isn't necessary anymore)
              setLoadingText(Date.now().toString());
            }}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

export default ProjectScreen;
