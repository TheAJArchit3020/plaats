import orderedJSON from 'json-order';

export const getOrMakeObject = (obj, key) => {
  if (!obj[key]) {
    obj[key] = {};
  }
  return obj[key];
};

export const ObjectId = (
  m = Math,
  d = Date,
  h = 16,
  s = (s) => m.floor(s).toString(h),
) => s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

export const isObject = (obj) => {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
};

export const deepClone = (obj) => {
  return orderedJSON.parse(orderedJSON.stringify(obj)).object;
};

export function range(size, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}

export const epochToDateString = (epoch) => {
  if (!epoch) {
    return '';
  }
  let utcSeconds = epoch;
  let d = new Date(0);
  d.setUTCSeconds(utcSeconds);
  let mm = d.getMonth() + 1;
  let dd = d.getDate();
  return [
    (dd > 9 ? '' : '0') + dd,
    (mm > 9 ? '' : '0') + mm,
    d.getFullYear(),
  ].join('/');
};
