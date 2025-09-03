import Toast from 'react-native-toast-message';

export default {
  error: (txt) => {
    Toast.show({type: 'error', text1: txt});
  },
  success: (txt) => {
    Toast.show({type: 'success', text1: txt});
  },
  info: (txt) => {
    Toast.show({type: 'info', text1: txt});
  },
};
