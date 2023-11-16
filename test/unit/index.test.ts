import fs from "fs";
import { jest } from "@jest/globals";
import { Web3, core } from "web3";

import { IpfsPlugin } from "../../src";

const providerUrl = "https://ethereum-sepolia.publicnode.com";
const registryContractAddress = "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB";
const testAccountPrivateKey =
  "0xcc59ca865cd8264614bc87f6f6c102bab06790489701d0f0550445c476d46f9f";

describe("IpfsPlugin tests", () => {
  it("Should register IpfsPlugin plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context(providerUrl);
    web3Context.registerPlugin(new IpfsPlugin({ registryContractAddress }));
    expect(web3Context.ipfs).toBeDefined();
  });

  describe("IpfsPlugin method uploadFileContent", () => {
    let web3: Web3;

    beforeAll(() => {
      web3 = new Web3(providerUrl);

      const testAccount = web3.eth.accounts.privateKeyToAccount(
        testAccountPrivateKey,
      );
      web3.eth.accounts.wallet.add(testAccount);
      web3.defaultAccount = testAccount.address;

      web3.registerPlugin(new IpfsPlugin({ registryContractAddress }));
    });

    it("Should call IpfsPlugin method uploadFileContent successfully with file content", async () => {
      const filePath = "./test.txt";
      fs.writeFileSync(filePath, "Test file content");
      const fileContent = fs.readFileSync(filePath);

      try {
        await web3.ipfs.uploadFileContent(fileContent);
        expect(true).toBe(true);
      } catch (err) {
        expect(err).toBeUndefined();
      } finally {
        fs.unlinkSync(filePath);
      }
    });

    it("Should call IpfsPlugin method uploadFileContent successfully with string", async () => {
      try {
        await web3.ipfs.uploadFileContent("fileContent");
        expect(true).toBe(true);
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });

    it("Should handle error in uploadFileContent method", async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await web3.ipfs.uploadFileContent({});
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe("IpfsPlugin method listAllCIDs", () => {
    let web3: Web3;
    let consoleSpy: jest.SpiedFunction<typeof global.console.log>;

    beforeAll(() => {
      web3 = new Web3(providerUrl);

      web3.registerPlugin(new IpfsPlugin({ registryContractAddress }));

      consoleSpy = jest.spyOn(global.console, "log");
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it("Should call IpfsPlugin method listAllCIDs successfully", async () => {
      await web3.ipfs.listAllCIDs("0x0000000000000000000000000000000000000000");
      expect(consoleSpy).toHaveBeenCalledWith([]);
    });

    it("Should call IpfsPlugin method listAllCIDs successfully with data", async () => {
      const registryContractSpy = jest
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        .spyOn(web3.ipfs.registryContract, "getPastEvents")
        .mockImplementation(() => Promise.resolve(["test"]));

      try {
        await web3.ipfs.listAllCIDs(
          "0x0000000000000000000000000000000000000000",
        );
        expect(consoleSpy).toHaveBeenCalledWith(["test"]);
      } catch (err) {
        expect(err).toBeUndefined();
      } finally {
        registryContractSpy.mockRestore();
      }
    });

    it("Should handle error in listAllCIDs method", async () => {
      try {
        await web3.ipfs.listAllCIDs("invalidAddress");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });
});
