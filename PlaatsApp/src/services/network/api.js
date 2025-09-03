import axios from 'axios';
import AsyncStore from '../storage/AsyncStore';
import {pictureLocation} from '../../components/camera/Camera';
import RNFS from 'react-native-fs';
import orderedJSON from 'json-order';
import {NetworkConfig} from "../../utils";

const API = {
  async getProjects() {
    return API.get((await NetworkConfig()).PROJECT);
  },
  async getProject(id) {
    return API.get((await NetworkConfig()).PROJECT + '/' + id).then((res) => res.data);
  },
  async postProjectSync(projects) {
    return API.post((await NetworkConfig()).PROJECT_SYNC, {
      projects: projects,
    }).then((res) => res.data);
  },
  async getProjectSummaries() {
    return API.get((await NetworkConfig()).GET_PROJECT_SUMMARIES);
  },
  async getModels() {
    return API.getFetch((await NetworkConfig()).GET_MODELS)
      .catch(() => {throw Error('Network')})
      .then((res) => res.text())
      .then((txt) => orderedJSON.parse(txt).object);
  },
  async getReportStatus(id) {
    return API.get((await NetworkConfig()).REPORT_STATUS + '/' + id).then(
      (res) => res.data.status,
    );
  },
  async startReportGeneration(id, printVersion = false) {
    return API.get(
      (await NetworkConfig()).GENERATE_REPORT + '/' + id + '/' + printVersion,
    );
  },
  async getMissingPicturesOnServer(projectData) {
    return API.post((await NetworkConfig()).IMAGES_PRESENT, projectData).then((res) => res.data);
  },
  async imageTryLocal(id, projectID, token) {
    const path = pictureLocation(projectID, id);
    if (await RNFS.exists(path)) {
      return {uri: 'file://' + path};
    } else {
      return API.image(id, token);
    }
  },
  async image(id, token) {
    return {
      uri: (await NetworkConfig()).IMAGE + '/' + id,
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
  },
  async get(url, body = {}) {
    return axios.get(url, {
      params: body,
      headers: {
        Authorization: 'Bearer ' + (await AsyncStore.getToken()),
      },
    });
  },
  async getFetch(url) {
    return fetch(url, {
      headers: {
        Authorization: 'Bearer ' + (await AsyncStore.getToken()),
      },
    });
  },
  async postChanges(data) {
    return API.post((await NetworkConfig()).POST_CHANGES, data);
  },
  async postBackups(data) {
    return API.post((await NetworkConfig()).POST_BACKUPS, data);
  },
  async postPicture(pic, projectID) {
    const file = {
      uri: 'file://' + pictureLocation(projectID, pic),
      type: 'image/jpeg',
      name: pic,
    };

    if (!(await RNFS.exists(file.uri))) {
      file.uri = 'file://' + pictureLocation('undefined', pic);
      if (!(await RNFS.exists(file.uri))) {
        throw new Error("Picture doesn't exist");
      }
    }

    console.log('post', file);

    let data = new FormData();
    data.append('file', file);
    return fetch((await NetworkConfig()).POST_IMAGE, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + (await AsyncStore.getToken()),
      },
    });
  },
  async post(url, data) {
    return axios.post(url, data, {
      headers: {
        Authorization: 'Bearer ' + (await AsyncStore.getToken()),
      },
    });
  },
};

export default API;
