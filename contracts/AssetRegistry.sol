pragma solidity ^0.4.11;

import "./AssetContract.sol";

contract AssetRegistry {

	mapping(address => address[]) public assetsPerOnwer;

	event AssetDeployedEvent(address indexed _owner, address indexed _asset);

	function AssetRegistry() public {}

	function deployAssetContract(string _assetId, uint256 _price, address[] _authors) public returns(address) {
		AssetContract asset = new AssetContract(_assetId, _price, _authors, msg.sender);
		assetsPerOnwer[msg.sender].push(asset);
		AssetDeployedEvent(msg.sender, asset);
		return asset;
	}

	function getAssetByOwner(address _assetOwner) public view returns(address[]) {
		return assetsPerOnwer[_assetOwner];
	}

}