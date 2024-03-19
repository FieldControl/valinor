export class UserAlreadyExistsError extends Error {
  constructor(identifier: string) {
    super(`User "${identifier}" already exists.`);
  }
}
