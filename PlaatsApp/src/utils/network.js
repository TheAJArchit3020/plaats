import Toasty from '../components/Toasty';
import AsyncStore from "../services/storage/AsyncStore";
import {NetworkConfigData} from "../services/network/config";

export const handleError = (error, callback, showMsgIfNoConnection = true) => {
  if (error.request) {
    if (showMsgIfNoConnection) {
      Toasty.error('Geen internet verbinding');
    }
  } else {
    callback();
  }
};

export const isNoConnectionError = (error) => {
  return error.request;
}

export const NetworkConfig = async () => {
  let updatedConfig = {}
  let useAddress = BASE[0];
  let address = await AsyncStore.getServerAddress();
  if(address !== null){
    useAddress = address;
  }
  for (let key in NetworkConfigData) {
    updatedConfig[key] = useAddress + NetworkConfigData[key];
  }
  // console.log("Use address: ", useAddress);
  return updatedConfig;
}
