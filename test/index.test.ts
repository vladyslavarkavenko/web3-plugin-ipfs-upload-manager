import { Web3, core, Address } from "web3";

import { IpfsPlugin } from "../src";

jest.setTimeout(50000);

const providerUrl = "https://ethereum-sepolia.publicnode.com";
const registryContractAddress = "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB";
const testAccountPrivateKey = "0xcc59ca865cd8264614bc87f6f6c102bab06790489701d0f0550445c476d46f9f";

describe("IpfsPlugin tests", () => {
  it("Should register IpfsPlugin plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context(providerUrl);
    web3Context.registerPlugin(new IpfsPlugin({ registryContractAddress }));
    expect(web3Context.ipfs).toBeDefined();
  });

  describe("IpfsPlugin method uploadFile", () => {
    let web3: Web3;

    beforeAll(() => {
      web3 = new Web3(providerUrl);

      const testAccount = web3.eth.accounts.privateKeyToAccount(
        testAccountPrivateKey
      );
      web3.eth.accounts.wallet.add(testAccount);
      web3.defaultAccount = testAccount.address;

      web3.registerPlugin(new IpfsPlugin({ registryContractAddress }));
    });

    it("Should call IpfsPlugin method uploadFile successfully", async () => {
      try {
        await web3.ipfs.uploadFile();
        expect(true).toBe(true);
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });
  });

  describe("IpfsPlugin method listAllCIDs", () => {
    let web3: Web3;
    let testAccountAddress: Address;
    let consoleSpy: jest.SpiedFunction<typeof global.console.log>;

    beforeAll(() => {
      web3 = new Web3(providerUrl);

      const testAccount = web3.eth.accounts.privateKeyToAccount(
        testAccountPrivateKey
      );
      testAccountAddress = testAccount.address;

      web3.registerPlugin(new IpfsPlugin({ registryContractAddress }));

      consoleSpy = jest.spyOn(global.console, "log").mockImplementation();
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it("Should call IpfsPlugin method listAllCIDs successfully", async () => {
      await web3.ipfs.listAllCIDs(testAccountAddress);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
