import {getOrMakeObject, cleanItem, numberFromName, deepClone} from './index';
import AsyncStore from '../services/storage/AsyncStore';

const COLORS = ['#123456', '#31A1ED', '#ED7D31', '#325490', '#70AD47'];
const LEVELS = {
  Opdracht: 0,
  Object: 0,
  Sleutels: 1,
  Meterstanden: 0,
  Interieur: 2,
  Exterieur: 2,
  'Technische Installaties': 1,
};

const makeDrawerItem = (
  name,
  projectObj,
  changesObj,
  levels = 0,
  orderModel = null,
  color = '#123456',
  isEditable = false,
  parentDrawerItem = null,
) => {
  const item = {
    name: name,
    projectObj: getOrMakeObject(projectObj, name),
    changesObj: getOrMakeObject(changesObj, name),
    isEditable: Boolean(isEditable && name !== 'Algemeen'),
    color: color,
    parentProjectObj: projectObj,
    parentChangesObj: changesObj,
    parentDrawerItem: parentDrawerItem,
    path: parentDrawerItem ? [...parentDrawerItem.path, name] : [name],
  };
  if (levels) {
    const orderedKeys = orderKeys(Object.keys(item.projectObj), orderModel);
    item.content = orderedKeys.map((key, index) =>
      makeDrawerItem(
        key,
        item.projectObj,
        item.changesObj,
        levels - 1,
        orderModel,
        COLORS[index % COLORS.length],
        true,
        item,
      ),
    );
  }
  return item;
};

const orderKeys = (keys, orderModel) => {
  if (!orderModel) {
    return keys;
  }
  const getOrder = (key) => {
    const order = orderModel[cleanItem(key)];
    return order ? order : 0;
  };
  return keys.sort((key1, key2) => getOrder(key1) - getOrder(key2));
};

const makeDrawerItemSimple = (name, parentDrawerItem) => {
  return makeDrawerItem(
    name,
    parentDrawerItem.projectObj,
    parentDrawerItem.changesObj,
    parentDrawerItem.name in LEVELS ? LEVELS[parentDrawerItem.name] - 1 : 0,
    null,
    '#123456',
    true,
    parentDrawerItem,
  );
};

/**
 * Returns the json structure from which the drawer is built
 * Each entry consists of:
 *  - content: a level deeper, contains the same type of entries as the drawer itself
 *  - item: the corresponding project object with data
 *  - changes: corresponding changes object where data changes should be saved
 */
const makeDrawerContent = (project, changes, orderModel) => {
  return [
    ['Opdracht'],
    ['Object'],
    ['Sleutels', 1],
    ['Meterstanden'],
    ['Interieur', 2],
    ['Exterieur', 2],
    ['Technische Installaties', 1],
  ].map(([name, levels = 0]) => {
    return makeDrawerItem(name, project, changes, levels, orderModel);
  });
};

/**
 * Takes the drawer content, any possible nested content and the categories
 * If the nested content is set, it sorts them based on the categories
 * Otherwise simply returns the normal content
 */
const getDrawerItems = (content, roomDrawerItem, categories) => {
  if (!content) {
    return [];
  }
  if (!(roomDrawerItem && categories)) {
    return content;
  }
  let sortedItems = {algemeen: null, base: [], specific: [], conformity: []};
  for (const item of roomDrawerItem.content) {
    for (const cat of ['base', 'specific', 'conformity']) {
      if (categories[cat].includes(cleanItem(item.name))) {
        sortedItems[cat].push(item);
        break;
      }
    }
    if (item.name === 'Algemeen') {
      sortedItems.algemeen = item;
    }
  }
  return sortedItems;
};

const makeName = (basename, existing) => {
  let lastIndex = -1;
  let highestNumber = 0;
  existing.forEach((name, index) => {
    if (cleanItem(name) === basename) {
      highestNumber = numberFromName(name);
      lastIndex = index;
    }
  });
  if (highestNumber !== 0) {
    basename = basename + ' ' + (highestNumber + 1).toString();
  }
  return [basename, lastIndex + 1];
};

const addItem = async (containerDrawerItem, name) => {
  const existingItems = containerDrawerItem.content.map((item) => item.name);
  const [newName, indexToInsert] = makeName(name, existingItems);
  const defaultDataObject = await makeDefaultDataObject(
    containerDrawerItem,
    name,
  );
  containerDrawerItem.projectObj[newName] = defaultDataObject;
  containerDrawerItem.changesObj[newName] = deepClone(defaultDataObject);
  containerDrawerItem.content.splice(
    indexToInsert,
    0,
    makeDrawerItemSimple(newName, containerDrawerItem),
  );
};

const removeItem = (drawerItem, changes) => {
  delete drawerItem.parentProjectObj[drawerItem.name];
  delete drawerItem.parentChangesObj[drawerItem.name];
  drawerItem.parentDrawerItem.content = drawerItem.parentDrawerItem.content.filter(
    (item) => item.name !== drawerItem.name,
  );
  if (!changes.delete) {
    changes.delete = [];
  }
  changes.delete.push(drawerItem.path);
};

const duplicateItem = (drawerItem) => {
  const {parentDrawerItem} = drawerItem;
  const existingNames = parentDrawerItem.content.map((item) => item.name);
  const [newName, indexToInsert] = makeName(
    cleanItem(drawerItem.name),
    existingNames,
  );
  parentDrawerItem.projectObj[newName] = deepClone(drawerItem.projectObj);
  parentDrawerItem.changesObj[newName] = deepClone(drawerItem.changesObj);
  parentDrawerItem.content.splice(
    indexToInsert,
    0,
    makeDrawerItemSimple(newName, parentDrawerItem),
  );
};

const makeOptionList = (options, extraFunctions, item) => {
  let optionLst = [];
  for (let option of options) {
    let name = option;
    if (typeof option !== 'string') {
      name = name.name;
    }
    optionLst.push({
      name: name,
      press: () => {
        addItem(item, name).then(extraFunctions);
      },
    });
  }
  return optionLst;
};

const makeDefaultDataObject = async (containerDrawerItem, name) => {
  const parentName = containerDrawerItem.name;
  const isRoomItem = Boolean(containerDrawerItem.parentDrawerItem);
  if (parentName === 'Interieur') {
    return (await AsyncStore.getEmptyProject()).Interieur[name];
  } else if (parentName === 'Exterieur') {
    return {
      Algemeen: (await AsyncStore.getDataTemplates()).Algemeen,
    };
  } else if (isRoomItem) {
    const itemData = (await AsyncStore.getDataTemplates())[name];
    const uniformData = (await AsyncStore.getDataTemplates()).Uniform;
    return {...itemData, ...uniformData};
  } else {
    return (await AsyncStore.getDataTemplates())[name];
  }
};


module.exports = {
  makeDrawerContent: makeDrawerContent,
  makeDrawerItem: makeDrawerItem,
  makeDrawerItemSimple: makeDrawerItemSimple,
  getDrawerItems: getDrawerItems,
  makeName: makeName,
  addItem: addItem,
  removeItem: removeItem,
  makeOptionList: makeOptionList,
  duplicateItem: duplicateItem,
};
