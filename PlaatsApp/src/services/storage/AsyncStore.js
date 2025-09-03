import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageError from './StorageError';
import {isObject, parseJSON} from '../../utils';
import orderedJSON from 'json-order';

const TOKEN_KEY = 'TOKEN';
const PROJECTS_KEY = 'PROJECT_SUMMARIES';
const COLORS_KEY = 'COLORS';
const TEMPLATES_KEY = 'TEMPLATES';
const DATA_TEMPLATES_KEY = 'DATA_TEMPLATES';
const ROOMS_KEY = 'ROOMS';
const SPECIFIC_ITEMS_KEY = 'SPECIFIC_ITEMS';
const ALL_SPECIFIC_ITEMS_KEY = 'ALL_SPECIFIC_ITEMS';
const CONFORMITY_ITEMS_KEY = 'CONFORMITY_ITEMS';
const BASE_ITEMS_KEY = 'BASE_ITEMS';
const SAVED_PROJECTS_KEY = 'SAVED_PROJECTS_KEY';
const IMAGES_TO_BE_UPLOADED_KEY = 'IMAGES_TO_BE_UPLOADED';
const EMPTY_PROJECT_KEY = 'EMPTY_PROJECT';
const DRAWER_OPTIONS_KEY = 'DRAWER_OPTIONS_KEY';
const MIGRATION1_KEY = 'MIGRATION1_KEY';
const SERVER_ADDRESS_KEY = 'SERVER_ADDRESS_KEY';

const AsyncStore = {
  saveRooms(templates) {
    return AsyncStore.set(ROOMS_KEY, templates, true);
  },
  getRooms() {
    return AsyncStore.get(ROOMS_KEY, true);
  },
  saveRoomItems(items) {
    return AsyncStore.set(SPECIFIC_ITEMS_KEY, items, true);
  },
  getRoomItems() {
    return AsyncStore.get(SPECIFIC_ITEMS_KEY, true);
  },
  getSpecificItems() {
    return AsyncStore.get(ALL_SPECIFIC_ITEMS_KEY, true);
  },
  saveSpecificItems(items) {
    return AsyncStore.set(ALL_SPECIFIC_ITEMS_KEY, items, true);
  },
  getConformityItems() {
    return AsyncStore.get(CONFORMITY_ITEMS_KEY, true);
  },
  saveConformityItems(items) {
    return AsyncStore.set(CONFORMITY_ITEMS_KEY, items, true);
  },
  getBaseItems() {
    return AsyncStore.get(BASE_ITEMS_KEY, true);
  },
  async getCategories() {
    return {
      base: await AsyncStore.getBaseItems(),
      conformity: await AsyncStore.getConformityItems(),
      specific: await AsyncStore.getSpecificItems(),
    };
  },
  saveBaseItems(items) {
    return AsyncStore.set(BASE_ITEMS_KEY, items, true);
  },
  saveTemplates(templates) {
    return AsyncStore.set(TEMPLATES_KEY, templates, true);
  },
  getTemplates() {
    return AsyncStore.get(TEMPLATES_KEY, true);
  },
  saveDataTemplates(templates) {
    return AsyncStore.set(DATA_TEMPLATES_KEY, templates, true);
  },
  getDataTemplates() {
    return AsyncStore.get(DATA_TEMPLATES_KEY, true);
  },
  getOrderModel() {
    return Promise.all([AsyncStore.getTemplates(), AsyncStore.getRooms()]).then(
      ([templates, rooms]) => {
        const orderModel = {};
        Object.entries(templates).forEach(([key, value]) => {
          if (isObject(value) && 'order' in value) {
            orderModel[key] = value.order;
          }
        });
        rooms.Interieur.concat(rooms.Exterieur).forEach((room, index) => {
          orderModel[room] = index;
        });
        return orderModel;
      },
    );
  },
  saveToken(token) {
    return AsyncStore.set(TOKEN_KEY, token);
  },
  getToken() {
    return AsyncStore.get(TOKEN_KEY);
  },
  saveProjectSummaries(projects) {
    return AsyncStore.set(PROJECTS_KEY, projects, true);
  },
  getProjectSummaries() {
    return AsyncStore.get(PROJECTS_KEY, true);
  },
  async getSavedProjects() {
    const value = await AsyncStore.get(SAVED_PROJECTS_KEY, true);
    return value === null ? Promise.resolve([]) : value;
  },
  async addSavedProject(project) {
    const saved = await AsyncStore.getSavedProjects();
    if (saved.includes(project)) {
      return;
    }
    return AsyncStore.set(SAVED_PROJECTS_KEY, [...saved, project], true);
  },
  async getImagesToBeUploaded() {
    const value = await AsyncStore.get(IMAGES_TO_BE_UPLOADED_KEY, true);
    return value === null ? Promise.resolve([]) : value;
  },
  async addImageToBeUploaded(img, projectID) {
    const current = await AsyncStore.getImagesToBeUploaded();
    return AsyncStore.set(
      IMAGES_TO_BE_UPLOADED_KEY,
      [...current, {img: img, projectID: projectID}],
      true,
    );
  },
  async addImagesToBeUploaded(images) {
    const current = await AsyncStore.getImagesToBeUploaded();
    return AsyncStore.set(
      IMAGES_TO_BE_UPLOADED_KEY,
      [...current, ...images],
      true,
    );
  },
  async setImagesToBeUploaded(images) {
    return AsyncStore.set(IMAGES_TO_BE_UPLOADED_KEY, images, true);
  },
  saveColors(colors) {
    return AsyncStore.set(COLORS_KEY, colors, true);
  },
  getColors() {
    return AsyncStore.get(COLORS_KEY, true);
  },
  saveEmptyProject(project) {
    return AsyncStore.set(EMPTY_PROJECT_KEY, project, true);
  },
  getEmptyProject() {
    return AsyncStore.get(EMPTY_PROJECT_KEY, true);
  },
  saveDrawerOptions(options) {
    return AsyncStore.set(DRAWER_OPTIONS_KEY, options, true);
  },
  getDrawerOptions() {
    return AsyncStore.get(DRAWER_OPTIONS_KEY, true);
  },
  shouldPerformMigration1() {
    return AsyncStore.get(MIGRATION1_KEY, true);
  },
  setFinishedMigration1() {
    return AsyncStore.set(MIGRATION1_KEY, true, true);
  },
  getServerAddress(){
    return AsyncStore.get(SERVER_ADDRESS_KEY);
  },
  setServerAddress(address){
    return AsyncStore.set(SERVER_ADDRESS_KEY, address);
  },
  async addOrUpdateSummary(changes, project, projectID) {
    const summaries = await AsyncStore.getProjectSummaries();
    const filtered = summaries.filter((s) => s._id === projectID);

    const get = (keyFunc) => {
      return keyFunc(changes) ? keyFunc(changes) : keyFunc(project);
    };

    const pics = get((e) => e.Object['Foto gevel']);
    let pic;
    if (pics && pics.length) {
      pic = pics[0];
    } else {
      pic = null;
    }

    const updated = {
      _id: projectID,
      adres: get((e) => e.Object.Adres),
      postcode: get((e) => e.Object.Postcode),
      stad: get((e) => e.Object.Stad),
      foto: pic,
    };

    if (!filtered.length) {
      return AsyncStore.saveProjectSummaries([updated, ...summaries]);
    } else {
      return AsyncStore.saveProjectSummaries(
        summaries.map((s) => (s._id === projectID ? updated : s)),
      );
    }
  },

  async get(key, is_json = false) {
    try {
      let res = await AsyncStorage.getItem(key);
      return is_json ? parseJSON(res) : res;
    } catch (error) {
      throw new StorageError();
    }
  },
  async set(key, value, is_json = false) {
    try {
      if (is_json) {
        value = orderedJSON.stringify(value);
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      throw new StorageError();
    }
  },
};

export default AsyncStore;
