const Util = artifacts.require("Util.sol");
const Ownable = artifacts.require("Ownable.sol");
const AssetRegistry = artifacts.require("AssetRegistry.sol");

module.exports = async (deployer) => {
	deployer.deploy(Util);
	deployer.deploy(Ownable);
	deployer.deploy(AssetRegistry);
};