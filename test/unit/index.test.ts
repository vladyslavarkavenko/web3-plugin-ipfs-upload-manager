/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from "fs";
import { jest } from "@jest/globals";
import { Web3, core } from "web3";

import { IpfsPlugin } from "../../src";

const providerUrl = "https://ethereum-sepolia.publicnode.com";
const registryContractAddress = "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB";

describe("IpfsPlugin unit tests", () => {
  it("Should register IpfsPlugin plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context(providerUrl);
    web3Context.registerPlugin(new IpfsPlugin({ registryContractAddress }));
    expect(web3Context.ipfs).toBeDefined();
  });

  describe("IpfsPlugin method uploadFileContent", () => {
    let web3: Web3;
    let registryContractSpy: jest.SpiedFunction<
      // @ts-expect-error
      typeof web3.ipfs.registryContract.methods.store
    >;

    beforeAll(() => {
      web3 = new Web3(providerUrl);
      web3.registerPlugin(new IpfsPlugin({ registryContractAddress }));
    });

    beforeEach(() => {
      registryContractSpy = jest
        // @ts-expect-error
        .spyOn(web3.ipfs.registryContract.methods, "store")
        .mockImplementation(() => ({
          // @ts-expect-error
          send: () => Promise.resolve(),
        }));
    });

    afterEach(() => {
      registryContractSpy.mockRestore();
    });

    it("Should call IpfsPlugin method uploadFileContent successfully with file content", async () => {
      const filePath = "./test.txt";
      fs.writeFileSync(filePath, "Test file content");
      const fileContent = fs.readFileSync(filePath);

      try {
        await web3.ipfs.uploadFileContent(fileContent);
        expect(registryContractSpy).toHaveBeenCalled();
      } catch (err) {
        expect(err).toBeUndefined();
      } finally {
        fs.unlinkSync(filePath);
      }
    });

    it("Should call IpfsPlugin method uploadFileContent successfully with string", async () => {
      try {
        await web3.ipfs.uploadFileContent("fileContent");
        expect(registryContractSpy).toHaveBeenCalled();
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });

    it("Should handle error in uploadFileContent method", async () => {
      try {
        // @ts-expect-error
        await web3.ipfs.uploadFileContent(null);
      } catch (err) {
        expect(err).toBeDefined();
        expect(registryContractSpy).not.toHaveBeenCalled();
      }
    });
  });

  describe("IpfsPlugin method listAllCIDs", () => {
    let web3: Web3;
    let registryContractSpy: jest.SpiedFunction<
      // @ts-expect-error
      typeof web3.ipfs.registryContract.getPastEvents
    >;
    let consoleSpy: jest.SpiedFunction<typeof global.console.log>;

    beforeAll(() => {
      web3 = new Web3(providerUrl);
      web3.registerPlugin(new IpfsPlugin({ registryContractAddress }));
    });

    beforeEach(() => {
      consoleSpy = jest.spyOn(global.console, "log");
      registryContractSpy = jest
        // @ts-expect-error
        .spyOn(web3.ipfs.registryContract, "getPastEvents")
        .mockImplementation(() => Promise.resolve(["test"]));
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      registryContractSpy.mockRestore();
    });

    it("Should call IpfsPlugin method listAllCIDs successfully", async () => {
      try {
        await web3.ipfs.listAllCIDs(
          "0x0000000000000000000000000000000000000000",
        );
        expect(consoleSpy).toHaveBeenCalledWith(["test"]);
      } catch (err) {
        expect(err).toBeUndefined();
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
