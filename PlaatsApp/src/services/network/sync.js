import AsyncStore from '../storage/AsyncStore';
import API from './api';
import DiskStore from '../storage/DiskStore';
import Toasty from '../../components/Toasty';
import {handleError, isNoConnectionError} from '../../utils';

export const sync = (manuallyCalled = true) => {
  const onError = (e) => {
    handleError(e, () => Toasty.error(e.message), manuallyCalled);
    throw e;
  };
  return Promise.all([
    syncModels().catch(onError),
    syncBackups()
      .then(syncChanges)
      .then(syncProjectSummaries)
      .then(syncSavedProjects)
      .then(postPictures)
      .catch(onError),
  ])
    .then(() => Toasty.success('Gesynchroniseerd'))
    .catch(() => {});
};

const syncChanges = async () => {
  console.log('changes');
  try {
    const changes = await DiskStore.readAllProjectChanges();
    await API.postChanges(changes);
    await DiskStore.resetAllChanges();
  } catch (e) {
    if (isNoConnectionError(e)) {
      throw e;
    }
    throw Error('Doorvoeren van veranderingen mislukt');
  }
};

const postPicturesBatch = (pictures) => {
  const promises = [];
  for (const {img, projectID} of pictures) {
      promises.push(API.postPicture(img, projectID)
        .then(response => {
          if (!response.ok) {
            throw Error();
          }
        })  
        .catch((e) => {
            if (e.message !== "Picture doesn't exist") {
              throw e;
            }
          })
      );
  }
  return Promise.all(promises);
};

const postPictures = async (pictures) => {
  console.log('pictures');
  console.log(pictures);
  try {
    const chunkSize = 4;
    for (let i = 0; i < pictures.length; i += chunkSize) {
      const chunk = pictures.slice(i, i + chunkSize);
      await postPicturesBatch(chunk);
      if (i + chunkSize < pictures.length) {
        Toasty.info(
          `${i + chunkSize} van de ${pictures.length} foto's verzonden.`,
        );
      }
    }
  } catch (e) {
    if (isNoConnectionError(e)) {
      throw e;
    }
    throw Error("Foto's verzenden mislukt");
  }
};

const syncProjectSummaries = async () => {
  console.log('summaries');
  try {
    const summaries = (await API.getProjectSummaries()).data.results;
    await AsyncStore.saveProjectSummaries(summaries);
  } catch (e) {
    if (isNoConnectionError(e)) {
      throw e;
    }
    throw Error('Nieuwe projecten niet opgehaald');
  }
};

const syncSavedProjects = async () => {
  console.log('saved projects and missing pictures');
  try {
    const savedProjects = await AsyncStore.getSavedProjects();
    const response = await API.postProjectSync(savedProjects);
    for (const [id, project] of Object.entries(response.projects)) {
      await DiskStore.storeProject(project, id);
    }
    return response.pictures;
  } catch (e) {
    if (isNoConnectionError(e)) {
      throw e;
    }
    throw Error('Opgeslagen projecten niet vernieuwd');
  }
};

const syncBackups = async () => {
  console.log('backup');
  try {
    let failed = false;
    const data = {};
    for (const id of await AsyncStore.getSavedProjects()) {
      try {
        data[id] = await DiskStore.readProject(id);
      } catch (e) {
        // Make sure others are backed up
        failed = true;
      }
    }
    await API.postBackups(data);
    if (failed) {
      throw Error();
    }
  } catch (e) {
    if (isNoConnectionError(e)) {
      throw e;
    }
    throw Error('Backups niet opgeslagen');
  }
};

const syncModels = async () => {
  console.log('models');
  try {
    const models = await API.getModels();
    return Promise.all([
      AsyncStore.saveTemplates(models.templates),
      AsyncStore.saveDataTemplates(models.data_templates),
      AsyncStore.saveRoomItems(models.specific_items_per_room),
      AsyncStore.saveRooms(models.rooms),
      AsyncStore.saveColors(models.colors),
      AsyncStore.saveSpecificItems(models.specific_items),
      AsyncStore.saveConformityItems(models.conformity_items),
      AsyncStore.saveBaseItems(models.base_items),
      AsyncStore.saveEmptyProject(models.empty_project),
      AsyncStore.saveDrawerOptions(models.drawer_options),
    ]);
  } catch (e) {
    console.log(e);
    if (e.message !== 'Network') {
      throw Error('Modellen niet gesynchroniseerd');
    }
  }
};

export default sync;
