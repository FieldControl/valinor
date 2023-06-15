// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  API_MARVEL_PATH: 'https://gateway.marvel.com:443/v1/public',
  API_MARVEL_PUBLIC_KEY: 'f6ee4ee59717006c9f46758e4944367a',
  API_MARVEL_PRIVATE_KEY: '5ded2ec098b1b95a71546bdd35ace138534e0ada',


  API_STAR_WARS_PATH: 'https://swapi.dev/api/people'

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
