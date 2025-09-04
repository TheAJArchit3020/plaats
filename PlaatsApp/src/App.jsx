import React from 'react';
import Toast from 'react-native-toast-message';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {LoginScreen, AuthContext} from './screens/login/LoginScreen';
import login from './screens/login/login';
import Splash from './components/Splash';
import HomeScreen from './screens/home/HomeScreen';
import AsyncStore from './services/storage/AsyncStore';
import ProjectScreen from './screens/project/ProjectScreen';
import migrate from './services/migrations';

const Stack = createStackNavigator();
import AntDesign from 'react-native-vector-icons/AntDesign';
AntDesign.loadFont();
function App() {
  migrate();

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    },
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStore.getToken();
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps
      // TODO

      dispatch({type: 'RESTORE_TOKEN', token: userToken});
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (username, password) => {
        let token = await login(username, password);
        if (token) {
          try {
            await AsyncStore.saveToken(token);
            dispatch({type: 'SIGN_IN', token: token});
            Toast.show({text1: 'Ingelogd!'});
          } catch (e) {
            Toast.show({
              type: 'error',
              text1: 'Lokale opslag fout',
            });
          }
        }
      },
      signOut: async () => {
        dispatch({type: 'SIGN_OUT'});
        await AsyncStore.setServerAddress(BASE[0]);
      },
    }),
    [],
  );

  if (state.isLoading) {
    // We haven't finished checking for the token yet
    return <Splash />;
  }
  return (
    <>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}>
            {/* {state.userToken == null ? (
              <Stack.Screen
                name="SignIn"
                component={LoginScreen}
                options={{
                  title: 'Sign in',
                  animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                }}
              />
            ) : ( */}
            <Stack.Screen name="Home" component={HomeScreen} />
            {/* )} */}
            <Stack.Screen
              name="Project"
              component={ProjectScreen}
              navigation={Stack}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
      <Toast />
    </>
  );
}

// function App() {
//   return (
//     <>
//       <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//         <Text>Welcome to PlaatsApp</Text>
//       </View>
//     </>
//   );
// }

export default App;
