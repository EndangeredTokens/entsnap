// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


export const environment = {
    production: false,
    backend: "https://api.tokents.org", //  server DNS
    // backend: 'http://localhost:3000', // local development
    api: {
        comments: 'api/v1/comments',
        images: 'api/v1/images',
        reports: 'api/v1/reports',
        users: 'api/v1/users',
        weather: 'api/v1/weather',
        auth: 'api/v2/auth',
        recover: 'api/v2/recover',
        plantnet: 'api/v1/plantnet',
        validate: 'api/v1/validation-reports',
        foliages: 'api/v1/foliages',
        stages: 'api/v1/stages',
        countries: 'api/v2/countries',
        version: 'api/v2/version',
  },
  
    tree: {
    'Young':'assets/icons/tree-stages/Young icon.svg',
    'Adult':'assets/icons/tree-stages/adult-icon-green.svg',
    'Elder':'assets/icons/tree-stages/elder-icon-green.svg',
    'Sapling':'assets/icons/tree-stages/sapling-icon-green.svg',
    'Recently planted':'assets/icons/tree-stages/recently-planted-icon-green.svg',
    },
    
    accuracyTolerance: 100,
    treesNearYouRange: 10000, //meters
    proofOfLifeRange: 20, //meters
    keys: {
        weather: 'aef4a6779e7115915119f49c1830f8fd',
    },
    specifyLocationRadius: 20, //meters
    androidVersion: '0.4.0',
    androidVersionNumber: 10214,
    iosVersion: '0.4.0',
    iosVersionNumber: 6,
    googleMapsApiKey: "YOUR-API-KEY",
    otpCodeTimer: 121,
    playStoreAppUrl: "https://play.google.com/store/apps/details?id=com.entsnap.app",
    appStoreAppUrl: "https://testflight.apple.com/join/pz1MOEgm",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
