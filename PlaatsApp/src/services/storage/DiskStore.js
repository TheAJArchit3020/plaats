import RNFS from 'react-native-fs';
import orderedJSON from 'json-order';
import {parseJSON} from '../../utils';

const DiskStore = {
  storeProject(project, id) {
    return DiskStore.store(project, id);
  },
  readProject(id) {
    return DiskStore.read(id);
  },
  async storeProjectChanges(changes, id) {
    let changesOnDisk;
    try {
      changesOnDisk = await DiskStore.read('changes');
    } catch (e) {
      changesOnDisk = {};
    }
    changesOnDisk[id] = changes;
    return DiskStore.store(changesOnDisk, 'changes');
  },
  async readProjectChanges(id) {
    try {
      if (!(await DiskStore.exists('changes'))) {
        return {};
      }
      const res = (await DiskStore.read('changes'))[id];
      return res ? res : {};
    } catch (e) {
      return {};
    }
  },
  async readAllProjectChanges() {
    try {
      if (!(await DiskStore.exists('changes'))) {
        return {};
      }
      const res = await DiskStore.read('changes');
      return res ? res : {};
    } catch (e) {
      return {};
    }
  },
  async resetAllChanges() {
    let changesOnDisk;
    try {
      changesOnDisk = await DiskStore.read('changes');
    } catch (e) {
      changesOnDisk = {};
    }
    for (const [id, value] of Object.entries(changesOnDisk)){
      changesOnDisk[id] = {};
    }
    return DiskStore.store(changesOnDisk, 'changes');
  },
  exists(path) {
    path = RNFS.DocumentDirectoryPath + '/' + path;
    return RNFS.exists(path);
  },

  async store(object, name, json = true) {
    let path = RNFS.DocumentDirectoryPath + '/' + name;
    try {
      const content = json ? orderedJSON.stringify(object) : object;
      if (await RNFS.exists(path)) {
        await RNFS.unlink(path);
      }
      await RNFS.writeFile(path, content, 'utf8');
    } catch (error) {
      throw error;
      // throw new StorageError();
    }
  },

  async read(name, json = true) {
    let path = RNFS.DocumentDirectoryPath + '/' + name;
    try {
      if (!(await RNFS.exists(path))) {
        throw new Error();
      }
      const content = await RNFS.readFile(path, 'utf8');
      if (content === 'null' || !content) {
        throw new Error();
      }
      return json ? parseJSON(content) : content;
    } catch (e) {
      throw e;
      // throw new StorageError();
    }
  },
};

export default DiskStore;
