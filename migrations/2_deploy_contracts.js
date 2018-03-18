const Util = artifacts.require("Util.sol");
const Ownable = artifacts.require("Ownable.sol");
const AssetContract = artifacts.require("AssetContract.sol");

module.exports = async (deployer) => {
	deployer.deploy(Util);
	deployer.deploy(Ownable);
	deployer.deploy(AssetContract, "book_id", 1000000, ["0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"]);
};