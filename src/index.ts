import type { Address } from "web3";
import {
  Contract,
  eth,
  FMT_BYTES,
  FMT_NUMBER,
  validator,
  Web3PluginBase,
} from "web3";
import type { Helia } from "helia";
import { createHelia } from "helia";
import { strings } from "@helia/strings";
import { unixfs } from "@helia/unixfs";
import registryContractAbi from "./artifacts/registryContractAbi";

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace = "ipfs";

  private registryContractInstance?: Contract<typeof registryContractAbi>;
  private readonly registryContractAddress: Address;

  private heliaInstance?: Helia;

  constructor(options: { registryContractAddress: Address }) {
    super();
    this.registryContractAddress = options.registryContractAddress;
  }

  // We lazily instantiate it, because we need to make sure Web3 registered the plugin first.
  private get registryContract(): Contract<typeof registryContractAbi> {
    if (!this.registryContractInstance) {
      this.registryContractInstance = new Contract(
        registryContractAbi,
        this.registryContractAddress,
      );
      this.registryContractInstance.link(this);
    }

    return this.registryContractInstance;
  }

  private async startHelia(): Promise<Helia> {
    if (this.heliaInstance) {
      await this.heliaInstance.start();
    } else {
      this.heliaInstance = await createHelia();
    }
    return this.heliaInstance;
  }

  private async stopHelia(): Promise<void> {
    if (this.heliaInstance) {
      await this.heliaInstance.stop();
    }
  }

  // Execute operations with Helia, handling resources automatically
  private async executeWithHelia<T>(
    fn: (helia: Helia) => Promise<T>,
  ): Promise<T> {
    try {
      const heliaInstance = await this.startHelia();
      return await fn(heliaInstance);
    } finally {
      await this.stopHelia();
    }
  }

  public async uploadFileContent(
    fileContent: Uint8Array | string,
  ): Promise<void> {
    const cid = await this.executeWithHelia((helia) => {
      if (typeof fileContent === "string") {
        return strings(helia).add(fileContent);
      }
      if (fileContent instanceof Uint8Array) {
        return unixfs(helia).addBytes(fileContent);
      }

      throw new Error(
        "Provided fileContent is not a valid Uint8Array or String",
      );
    });
    await this.registryContract.methods.store(cid.toString()).send();
  }

  public async listAllCIDs(ownerAddress: Address): Promise<void> {
    if (!validator.isAddress(ownerAddress)) {
      throw new Error("Provided ownerAddress is not a valid address");
    }

    const latestBlockNumber = await eth.getBlockNumber(this, {
      number: FMT_NUMBER.NUMBER,
      bytes: FMT_BYTES.HEX,
    });
    const events = await this.registryContract.getPastEvents("CIDStored", {
      filter: { owner: ownerAddress },
      fromBlock: Number(latestBlockNumber) - 50000, // 50000 is max limit
      toBlock: latestBlockNumber,
    });
    console.log(events);
  }
}

declare module "web3" {
  interface Web3Context {
    ipfs: IpfsPlugin;
  }
}
