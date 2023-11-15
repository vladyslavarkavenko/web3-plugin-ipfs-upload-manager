import { Web3PluginBase, Contract, Address } from "web3";

import registryContractAbi from "./artifacts/registryContractAbi";

type IpfsPluginOptions = {
  registryContractAddress: Address;
};

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace = "ipfs";

  private registryContractInstance?: Contract<typeof registryContractAbi>;
  private readonly registryContractAddress: Address;

  constructor({ registryContractAddress }: IpfsPluginOptions) {
    super();
    this.registryContractAddress = registryContractAddress;
  }

  // We define this as getter, instead of initialising in constructor, because we need to wait for the Web3 to register plugin first.
  private get registryContract(): Contract<typeof registryContractAbi> {
    if (!this.registryContractInstance) {
      this.registryContractInstance = new Contract(
        registryContractAbi,
        this.registryContractAddress
      );
      this.registryContractInstance.link(this);
    }

    return this.registryContractInstance;
  }

  public async uploadFile(): Promise<void> {
    const cid = "test";
    await this.registryContract.methods.store(cid).send();
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
