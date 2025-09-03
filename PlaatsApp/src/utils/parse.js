import orderedJSON from 'json-order';

export const parseJSON = (txt) => {
  if (!txt) {
    return null;
  }
  try {
    return orderedJSON.parse(txt).object;
  } catch (e) {
    return JSON.parse(txt);
  }
};
