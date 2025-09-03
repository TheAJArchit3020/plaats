// const TEST_SERVER = 'http://34.79.45.56/';
const LIVE_SERVER = 'http://34.79.82.199/';
// const LOCAL = 'http://127.0.0.1:5000/'
// global.BASE = [LOCAL]; //TODO CHANGE
global.BASE = [LIVE_SERVER];

const NetworkConfigData = {
  LOGIN: 'jwt/login',
  PROJECT: 'api/project',
  GET_PROJECT_SUMMARIES: 'api/project/summary',
  GET_MODELS: 'api/mobile/model',
  IMAGE: 'api/image',
  POST_CHANGES: 'api/projects/changes',
  POST_IMAGE: 'api/mobile/image',
  POST_BACKUPS: 'api/mobile/backup',
  REPORT_STATUS: 'api/report-status',
  GENERATE_REPORT: 'api/generate-report',
  REPORT: 'api/mobile/download/report',
  IMAGES_PRESENT: 'api/mobile/images-present',
  PROJECT_SYNC: 'api/mobile/project/sync',
};

export {NetworkConfigData};
