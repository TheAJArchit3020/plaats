import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStore from '../../services/storage/AsyncStore';
import {NetworkConfig} from "../../utils";

const login = async (username, password) => {
  let address = await NetworkConfig();
  return axios
    .post(address.LOGIN, {
      username: username,
      password: password,
    })
    .then((response) => {
      AsyncStore.setServerAddress(response.data.address);
      return response.data.access_token;
    })
    .catch(loginErrorHandling);
};

const loginErrorHandling = (error) => {
  if (error.response) {
    Toast.show({
      type: 'error',
      text1: 'Wachtwoord/gebruikersnaam is verkeerd',
    });
  } else if (error.request) {
    Toast.show({
      type: 'error',
      text1: 'Geen verbinding',
    });
  } else {
    console.log(error);
    Toast.show({
      type: 'error',
      text1: 'Er ging iets verkeerd',
    });
  }
};

export default login;
