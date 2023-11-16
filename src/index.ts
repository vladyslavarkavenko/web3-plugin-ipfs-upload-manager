import type { Address } from "web3";
import { Contract, Web3PluginBase } from "web3";
import type { Helia } from "helia";
import { createHelia } from "helia";
import { strings } from "@helia/strings";
import { unixfs } from "@helia/unixfs";

import registryContractAbi from "./artifacts/registryContractAbi";

type IpfsPluginOptions = {
  registryContractAddress: Address;
};

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace = "ipfs";

  private registryContractInstance?: Contract<typeof registryContractAbi>;
  private readonly registryContractAddress: Address;

  private heliaInstance?: Helia;

  constructor({ registryContractAddress }: IpfsPluginOptions) {
    super();
    this.registryContractAddress = registryContractAddress;
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
        const s = strings(helia);
        return s.add(fileContent);
      } else {
        const u = unixfs(helia);
        return u.addBytes(fileContent);
      }
    });
    await this.registryContract.methods.store(cid.toString()).send();
  }

  public async listAllCIDs(ownerAddress: Address): Promise<void> {
    const events = await this.registryContract.getPastEvents("CIDStored", {
      filter: { owner: ownerAddress },
    });
    console.log(events);
  }
}

declare module "web3" {
  interface Web3Context {
    ipfs: IpfsPlugin;
  }
}
