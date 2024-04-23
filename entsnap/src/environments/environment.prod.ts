export const environment = {
  production: true,
  backend: "https://api.tokents.org", //  this is the one used
  local: "http://localhost:3000",  // just as backup
  server: "https://api.tokents.org",  // just as backup
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
