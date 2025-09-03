import React from 'react';
import {Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import InputScreen from './input/InputScreen';
import ProjectHeader from './ProjectHeader';
import {customName} from '../../utils';

const Stack = createStackNavigator();

const ContentScreen = ({route, navigation, storeProject, projectID, changes, refreshDrawer}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Stack"
        options={{
          headerTitle: (
            <Text style={{fontSize: 20}}>{customName(route.params)}</Text>
          ),
          headerRight: (headerProps) => (
            <ProjectHeader
              {...headerProps}
              projectID={projectID}
              drawerItem={route.params}
              changes={changes}
              navigation={navigation}
              refreshDrawer={refreshDrawer}
            />
          ),
        }}>
        {() => (
          <InputScreen
            name={route.params.name}
            projectObj={route.params.projectObj}
            changesObj={route.params.changesObj}
            storeProject={storeProject}
            projectID={projectID}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default ContentScreen;
