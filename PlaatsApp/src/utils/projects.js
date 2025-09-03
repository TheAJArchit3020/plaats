import DiskStore from '../services/storage/DiskStore';
import API from '../services/network/api';
import {syncPictures} from '../services/network/sync';
import AsyncStore from '../services/storage/AsyncStore';
import Toasty from '../components/Toasty';

export const numberFromName = (name) => {
  const matches = name.match(/\d+$/);
  if (matches) {
    return parseInt(matches[0], 10);
  }
  return 1;
};

export const cleanItem = (item) => {
  let cleanedModelName = item.replace(/[0-9]/g, '');
  if (cleanedModelName.charAt(cleanedModelName.length - 1) === ' ') {
    cleanedModelName = cleanedModelName.slice(0, -1);
  }
  return cleanedModelName;
};

export const customName = (item) => {
  if (!item) {
    return '';
  }
  if (item.projectObj && item.projectObj.CustomName) {
    return item.projectObj.CustomName;
  }
  if (item.changesObj && item.changesObj.CustomName) {
    return item.changesObj.CustomName;
  }
  //For sub-items with a content
  if ('CustomName' in item) {
    return item.CustomName;
  }
  return item.name;
};

export const modelArrayToObject = (arr) => {
  let dct = {};
  for (let entry of arr) {
    dct[entry.name] = entry.item;
  }
  return dct;
};


export const verifyAndSendAllProjectMissingPictures = async () => {
  const projects = await AsyncStore.getSavedProjects();
  for (let project of projects) {
    await verifyAndSendMissingPictures(project);
  }
};


export const verifyAndSendMissingPictures = async (projectID) => {
  const project = await DiskStore.readProject(projectID);
  const notPresent = (await API.getMissingPicturesOnServer(project)).not_present;
  let picturesToBeUploaded = await AsyncStore.getImagesToBeUploaded();
  const imagesToBeUploaded = picturesToBeUploaded.map((e) => e.img);
  if (!notPresent.length) {
    return;
  }
  Toasty.info("Nog niet alle foto's zijn doorgestuurd, even geduld");
  for (const img of notPresent) {
    if (!imagesToBeUploaded.includes(img)) {
      picturesToBeUploaded.push({img: img, projectID: projectID});
    }
  }
  await AsyncStore.setImagesToBeUploaded(picturesToBeUploaded);
  await syncPictures();
};
