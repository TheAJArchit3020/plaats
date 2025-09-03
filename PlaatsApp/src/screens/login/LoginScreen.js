import React, {useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const AuthContext = React.createContext();

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {signIn} = React.useContext(AuthContext);

  return (
    <KeyboardAvoidingView behavior={'padding'} style={styles.container}>
      <Image
        style={styles.image}
        source={require('../../../assets/habicom.png')}
      />
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Gebruikersnaam"
          placeholderTextColor="grey"
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          secureTextEntry
          style={styles.inputText}
          placeholder="Wachtwoord"
          placeholderTextColor="grey"
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => signIn(username, password)}>
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 250,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  inputView: {
    width: '80%',
    backgroundColor: 'lightgrey',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20,
  },
  inputText: {
    height: 50,
    color: 'white',
  },
  loginBtn: {
    width: '80%',
    backgroundColor: '#CFDC00',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  loginText: {
    color: 'white',
  },
});

export {LoginScreen, AuthContext};
