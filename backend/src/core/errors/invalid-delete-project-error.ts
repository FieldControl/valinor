export class InvalidDeleteProjectError extends Error {
  constructor() {
    super('There is data associated with this, remove it first.');
  }
}
