import type { Address, EventLog } from "web3";
import { Web3 } from "web3";

import { IpfsPlugin } from "../../src";

type ConsoleLogStub = sinon.SinonSpy<Array<Array<EventLog>>>;

const providerUrl = "https://ethereum-sepolia.publicnode.com";
const registryContractAddress = "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB";
const testPrivateKey = "0xcc59ca865cd8264614bc87f6f6c102bab06790489701d0f0550445c476d46f9f";

describe("IpfsPlugin e2e tests", () => {
  let web3: Web3;
  let testAccountAddress: Address;

  before(() => {
    cy.window().then(() => {
      web3 = new Web3(providerUrl);

      const testAccount = web3.eth.accounts.privateKeyToAccount(testPrivateKey);
      web3.eth.accounts.wallet.add(testAccount);
      web3.defaultAccount = testAccount.address;
      testAccountAddress = testAccount.address;

      web3.registerPlugin(new IpfsPlugin({ registryContractAddress }));

      cy.stub(console, "log").as("consoleLog");
    });
  });

  it("IpfsPlugin uploadFileContent method should store new CID in registry contract", () => {
    cy.wrap(web3.ipfs.listAllCIDs(testAccountAddress)).then(() => {
      cy.get<ConsoleLogStub>("@consoleLog").then((prevConsoleLog) => {
        expect(prevConsoleLog.args[0]).to.not.be.undefined;
        expect(prevConsoleLog.args[0][0]).to.not.be.undefined;

        const prevCIDsCount = prevConsoleLog.args[0][0].length;
        expect(prevCIDsCount).to.be.gte(0);

        cy.wrap(web3.ipfs.uploadFileContent("fileContent")).then(() => {
          cy.wrap(web3.ipfs.listAllCIDs(testAccountAddress)).then(() => {
            cy.get<ConsoleLogStub>("@consoleLog").then((newConsoleLog) => {
              expect(newConsoleLog.args[1]).to.not.be.undefined;
              expect(newConsoleLog.args[1][0]).to.not.be.undefined;

              const newCIDsCount = newConsoleLog.args[1][0].length;
              expect(newCIDsCount).to.be.gte(1);

              expect(newCIDsCount).to.be.equal(prevCIDsCount + 1);
            });
          });
        });
      });
    });
  });
});
