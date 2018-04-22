/*
	Copyright 2018 Open Store Initiative

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

			http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
pragma solidity ^0.4.21;

import "./AssetContract.sol";
import "./PaymentContract.sol";

contract AssetRegistry {

	PaymentContract public paymentContract;
	mapping(address => address[]) public assetsPerOnwer;

	event AssetDeployedEvent(address indexed _owner, address indexed _asset);

	function AssetRegistry(PaymentContract _paymentContract) public {
		paymentContract = _paymentContract;
	}

	function deployAssetContract(string _assetId, uint256 _price, address[] _authors) public returns(address) {
		AssetContract asset = new AssetContract(_assetId, _price, _authors, msg.sender, paymentContract);
		assetsPerOnwer[msg.sender].push(asset);
		emit AssetDeployedEvent(msg.sender, asset);
		return asset;
	}

	function getAssetByOwner(address _assetOwner) public view returns(address[]) {
		return assetsPerOnwer[_assetOwner];
	}

}