import AsyncStore from './storage/AsyncStore';
import Toasty from '../components/Toasty';

export default function migrate() {
  AsyncStore.shouldPerformMigration1().then((r) => {
    if (!r) {
      migration1();
    }
  });
}

function migration1() {
  AsyncStore.setImagesToBeUploaded([])
    .then(() => AsyncStore.setFinishedMigration1())
    .catch(() => Toasty.error('ERROR! Update mislukt'));
}
