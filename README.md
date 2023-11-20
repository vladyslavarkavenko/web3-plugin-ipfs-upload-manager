# Introduction
The `IpfsPlugin` extends the functionality of web3.js by integrating IPFS (InterPlanetary File System) features. This plugin allows users to upload file contents to IPFS and store the corresponding Content Identifiers (CIDs) in a smart contract on Ethereum. It also facilitates querying past events to list all CIDs stored by a particular Ethereum address.

# User guide
## Installation
Before using `IpfsPlugin`, ensure you have web3.js installed in your project. Then, install the `IpfsPlugin` as follows:
```bash
npm install web3-plugin-ipfs-upload-manager
```
or
```bash
yarn add web3-plugin-ipfs-upload-manager
```

## Setup
To use the IpfsPlugin, import it into your project and register it with your web3 instance:
```javascript
import { Web3 } from "web3";
import { IpfsPlugin } from "web3-plugin-ipfs-upload-manager";

const web3 = new Web3("[provider-url]");
web3.registerPlugin(new IpfsPlugin({ registryContractAddress: "[contract-address]" }));
```
For testing in Sepolia network you can use our contract:
```javascript
const web3 = new Web3("https://ethereum-sepolia.publicnode.com");
web3.registerPlugin(new IpfsPlugin({ registryContractAddress: "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB" }));
```


## Usage
### Uploading file content
To upload file content to IPFS:
```javascript
const fileContent = "Your file content here";
await web3.ipfs.uploadFileContent(fileContent);

```
This method accepts a Uint8Array or string and uploads it to IPFS, storing the CID in the smart contract.
### Listing all CIDs
To print all CIDs stored by an Ethereum address in console:
```javascript
const ownerAddress = "0x...";
await web3.ipfs.listAllCIDs(ownerAddress);
```

## Error handling
The plugin includes error handling for invalid inputs and operations. For instance, if a non-valid Ethereum address is provided, it throws an error.
All network errors are thrown back to the caller, so make sure you handle them properly.

# Developer guide
## Installation
Make sure you have Node.js v16+ installed, if you don't follow the instructions [here](https://nodejs.org/en). \
Make sure you have Yarn v1+ installed, if you don't follow the instructions [here](https://classic.yarnpkg.com/en/docs/install).
```bash
yarn install
```

## Testing
Tu run all tests:
```bash
yarn test
```
You can also run unit and e2e tests separately:
```bash
yarn test:unit
yarn test:e2e
```
