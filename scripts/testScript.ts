import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  // MockPriceFeed Contract
  const decimals = 8;
  const initialAnswer = 30303030303;
  const MockPriceFeed = await ethers.getContractFactory("MockV3Aggregator");
  const mockPriceFeed = await MockPriceFeed.deploy(decimals, initialAnswer);
  await mockPriceFeed.deployed();
  console.log("MockPriceFeed deployed to:", mockPriceFeed.address);

  // MockVRFCoordinator Contract
  const baseFee = ethers.utils.parseUnits("0.1", 18);
  const gasPriceLink = ethers.utils.parseUnits("0.000001", 18);
  const MockVRFCoordinator = await ethers.getContractFactory(
    "VRFCoordinatorV2Mock"
  );
  const mockVRFCoordinator = await MockVRFCoordinator.deploy(
    baseFee,
    gasPriceLink
  );
  await mockVRFCoordinator.deployed();
  console.log("mockVRFCoordinator deployed to:", mockVRFCoordinator.address);

  // BullBear Contract
  const updateInterval = 10;
  const priceFeedAddress = mockPriceFeed.address;
  const vrfCoordinatorAddress = mockVRFCoordinator.address;
  const BullBear = await ethers.getContractFactory("BullBear");
  const bullBear = await BullBear.deploy(
    updateInterval,
    priceFeedAddress,
    vrfCoordinatorAddress
  );
  await bullBear.deployed();
  console.log("BullBear deployed to:", bullBear.address);

  await bullBear.connect(owner).safeMint(owner.address);
  // eslint-disable-next-line promise/param-names
  await new Promise((r) => setTimeout(r, 20000));

  console.log(await bullBear.checkUpkeep([]));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
