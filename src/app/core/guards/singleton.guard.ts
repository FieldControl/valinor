export class SingletonGuard {
  constructor(module: unknown) {
    if (module) {
      throw new Error(`
        ${module.constructor.name} has already been loaded. 
        Import Core modules in the AppModule only.
      `);
    }
  }
}
