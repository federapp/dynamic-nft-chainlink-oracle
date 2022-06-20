import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import {
  BullBear,
  BullBear__factory,
  MockV3Aggregator,
  MockV3Aggregator__factory,
  VRFCoordinatorV2Mock,
  VRFCoordinatorV2Mock__factory,
} from "../typechain";

describe("Greeter", function () {
  let signers: SignerWithAddress[];
  let mockPriceFeed: MockV3Aggregator;
  let mockVRFCoordinator: VRFCoordinatorV2Mock;
  let bullBear: BullBear;
  const priceFeedDecimals: BigNumberish = 10;
  const initialAnswer: BigNumberish = 10;
  const newAnswer: BigNumberish = 5;
  const baseFeeCoordinator = ethers.utils.parseUnits("0.000001", 18);
  const gasPriceLinkCoordinator = ethers.utils.parseUnits("0.1", 18);

  beforeEach(
    "Should deploy contracts and mint first NFT to the first signer address",
    async function () {
      signers = await ethers.getSigners();

      mockPriceFeed = await new MockV3Aggregator__factory(signers[0]).deploy(
        priceFeedDecimals,
        initialAnswer
      );
      console.log("mockPriceFeed deployed to", mockPriceFeed.address);

      mockVRFCoordinator = await new VRFCoordinatorV2Mock__factory(
        signers[0]
      ).deploy(baseFeeCoordinator, gasPriceLinkCoordinator);
      console.log("mockVRFCoordinator deployed to", mockVRFCoordinator.address);

      bullBear = await new BullBear__factory(signers[0]).deploy(
        10,
        mockPriceFeed.address,
        mockVRFCoordinator.address
      );
      console.log("Bullbear deployed to", bullBear.address);

      await bullBear.safeMint(signers[0].address);
      expect(signers[0].address).to.equal(await bullBear.ownerOf(0));
    }
  );

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      // eslint-disable-next-line no-undef
      expect(await bullBear.owner()).to.equal(signers[0].address);
    });
    it("Should have the first nft minted to the owner", async function () {
      expect(await bullBear.ownerOf(0)).to.equal(signers[0].address);
    });
    it("Should have the price feed correctly set", async function () {
      expect((await mockPriceFeed.latestAnswer()).toNumber()).to.equal(
        initialAnswer
      );
    });
  });
  describe("Check if bull changes", function () {
    it("Should see if before increasing evm mine upkeep doesn't need to be performed", async function () {
      const checkUpkeepValue = await bullBear.checkUpkeep([]);
      expect(await checkUpkeepValue[0]).to.equal(false);
    });
    it("Should see if after increasing evm mine should upkeep should be performed", async function () {
      await ethers.provider.send("evm_mine", [2655475553]);
      const checkUpkeepValue = await bullBear.checkUpkeep([]);
      expect(await checkUpkeepValue[0]).to.equal(true);
    });
    it("Should see if after updating answer on mock it reflects", async function () {
      console.log(await bullBear.tokenURI(0));
      await mockPriceFeed.updateAnswer(newAnswer);
      await ethers.provider.send("evm_mine", [3655475553]);
      await mockVRFCoordinator;
      console.log(await bullBear.tokenURI(0));
    });
  });
});
