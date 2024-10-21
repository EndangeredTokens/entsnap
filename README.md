# EntSnap Mobile DAPP

Welcome to the repository for the EntSnap mobile DAPP! EntSnap is a cutting-edge decentralized application designed to revolutionize tree conservation efforts and empower users to contribute to environmental sustainability.

## Table of Contents

- [Features](#features)
- [Coming Soon](#coming-soon)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Features

- **Simple web3 Onboarding**: Seamlessly log in using web3 wallet authentication, ensuring security and user privacy, with future integration into the blockchain and the endangered token environment, including minting NFTs, token sales/purchases, earning rewards tokens with different activities, and more!
- **Tree Capturing and Reporting**: Report endangered trees by uploading information to the server, contributing to global conservation efforts.
- **Tree Identification**: Utilize an image-based identification service to identify tree species directly through the app, enhancing environmental awareness.
- **Map Exploration**: Explore accepted reports of trees with a sleek map integration, providing an immersive user experience.
- **Account Administration**: Manage account credentials, web3 linked accounts, and third-party integrations effortlessly within the app.
* **Proof-of-Life**: Peer Validation module for existing trees/ENTS reports, allowing users to validate and verify the life of any report with various blockchain incentives, fostering community engagement and trust.

## Coming Soon

* **ENTS Minting (NFT)**: Mint your validated tree reports (ENTS) directly as NFTs on the blockchain, creating digital assets linked to real-world environmental data.
* **Gitcoint Passport Integration**: Link your web3 account to your Gitcoint passport for enhanced integration and identity verification, streamlining user interactions.
* **ENTS Wiki**: Access a comprehensive collection of detailed tree information integrated with the app, enhancing the Tree Identification feature and promoting environmental education.

## Installation

To run the EntSnap mobile DAPP, follow these steps:

1. **Clone Repository**: Clone this repository to your local machine:
   ```bash
   git clone https://github.com/EndangeredTokens/entsnap
   ```

2. **Google Maps API Key**: Before you can run the app you must update the variable `googleMapsApiKey` in the environments files, using your own google maps API key. Depending on how you plan to run the app you might need to change one or another environment file.

   * **web app**: create`environment.ts` from [environment.example.ts](./entsnap/src/environments/environment.example.ts) and modify the variable.
   * **Android/iOS app**: create `environment.prod.ts` from [environment.prod.example.ts](./entsnap/src/environments/environment.prod.example.ts) and modify the variable.

   ```ts
   export const environment = {
      ...
      googleMapsApiKey: "YOUR-API-KEY"
      ...
   }
   ```

3. **Install Dependencies**: Navigate to the `entsnap` directory and install npm packages:
   ```bash
   cd entsnap
   nvm use 18
   npm install --force
   ```

   *NOTE: there  are currently some conflicting libraries and needs --force flag to install propery. The app runs just fine. We are working on fixing the conflicts.*
4. **Run Development Mode**: Start the development server using Ionic CLI:
   ```bash
   npx ionic serve
   ```

5. **Build Android/ios APK**: Build the Android APK using Ionic CLI and Capacitor:
   ```bash
   npx ionic build
   npx cap sync
   ```

   Then open the code for Android or iOS using capacitor

      * Android

         ```
         npx cap open android
         ```

         Make sure you have Android Studio installed on your local machine for this step.
      * iOS:

         ```
         npx cap open ios
         ```

         *Note: you might have to change some configurations in xcode before the code runs in your emulators.*

## Usage 

The general app workflow is as follows:

1. Generate a new report of a tree, which will have the status `pending`.
2. Wait for the backend to process this report and `accept`/`reject` the report.
3. If the report is `accepted`, then it will be visualized in the map exploration.
4. (Coming Soon) Mint your `accepted` report as an NFT and start earning with us!!

## License

This project is licensed under the Business Source License 3.0 (BSL-3). See the [LICENSE](LICENSE) file for details.