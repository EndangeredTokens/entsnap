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

## Coming Soon

* **ENTS Minting (NFT)**: Mint your validated tree reports (ENTS) directly as NFTs on the blockchain, creating digital assets linked to real-world environmental data.
* **Gitcoint Passport Integration**: Link your web3 account to your Gitcoint passport for enhanced integration and identity verification, streamlining user interactions.
* **ENTS Wiki**: Access a comprehensive collection of detailed tree information integrated with the app, enhancing the Tree Identification feature and promoting environmental education.
* **Proof-of-Life**: Peer Validation module for existing trees/ENTS reports, allowing users to validate and verify the life of any report with various blockchain incentives, fostering community engagement and trust.

## Installation

To run the EntSnap mobile DAPP, follow these steps:

1. **Clone Repository**: Clone this repository to your local machine:
   ```bash
   git clone https://github.com/EndangeredTokens/entsnap
   ```

2. **Google Maps API Key**: Update the Maps JavaScript API load script in [index.html](./entsnap/src/index.html) with a valid API key. Replace `[YOUR-API-KEY]` with your API key:
   ```html
   <script async defer
     src="https://maps.googleapis.com/maps/api/js?key=[YOUR-API-KEY]&libraries=places&region=419&language=es"
     type="text/javascript">
   </script>
   ```

3. **Backend Configuration**: Update the backend endpoint in [environment.ts](./entsnap/src/environments/environment.ts) and [environment.prod.ts](./entsnap/src/environments/environment.prod.ts) with the provided public endpoint route.

4. **Install Dependencies**: Navigate to the `entsnap` directory and install npm packages:
   ```bash
   cd entsnap
   npm install
   ```

5. **Run Development Mode**: Start the development server using Ionic CLI:
   ```bash
   npx ionic serve
   ```

6. **Build Android APK**: Build the Android APK using Ionic CLI and Capacitor:
   ```bash
   npx ionic build
   npx cap sync
   npx cap open android
   ```
   Make sure you have Android Studio installed on your local machine for this step.

## Usage 

The general app workflow is as follows:

1. Generate a new report of a tree, which will have the status `pending`.
2. Wait for the backend to process this report and `accept`/`reject` the report.
3. If the report is `accepted`, then it will be visualized in the map exploration.
4. (Coming Soon) Mint your `accepted` report as an NFT and start earning with us!!

## License

This project is licensed under the Business Source License 3.0 (BSL-3). See the [LICENSE](LICENSE) file for details.