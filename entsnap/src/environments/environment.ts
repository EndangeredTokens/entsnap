// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  backend: "https://api.tokents.org", //  this is the one used
  local: "http://localhost:3000",  // just as backup
  server: "http://localhost:3000",  // just as backup
  api: {
    comments: "api/v1/comments",
    images: "api/v1/images",
    reports: "api/v1/reports/new",
    users: "api/v1/users",
    weather: "api/v1/weather",
    auth: "api/v2/auth",
    recover: "api/v2/recover",
    plantnet: "api/v1/plantnet"
  },
  keys: {
    weather: "aef4a6779e7115915119f49c1830f8fd"
  },
  androidVersion: "0.1.7",
	androidVersionNumber: 10205,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
