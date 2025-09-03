function StorageError(message = 'Lokale opslag error') {
  let error = Error.call(this, message);

  this.name = 'StorageError';
  this.message = error.message;
  this.stack = error.stack;
}

StorageError.prototype = Object.create(Error.prototype);
StorageError.prototype.constructor = StorageError;

export default StorageError;
