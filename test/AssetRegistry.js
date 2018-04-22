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
const AssetRegistry = artifacts.require('AssetRegistry.sol');
const AssetContract = artifacts.require('AssetContract.sol');
const PaymentContract = artifacts.require('PaymentContract.sol');

contract("AssetRegistry", (accounts) => {

	describe("deployAssetContract", async () => {

		let assetId = "cool book";
		let price = web3.toWei(2);
		let authors = [web3.eth.accounts[0], web3.eth.accounts[1]];
		var registry;
		var txReceipt;
		var txLogs;
		var assetOwner;
		var assetAddress;
		var paymentContract;

		beforeEach(async () => {
			paymentContract = await PaymentContract.new(0, accounts[8]);
			registry = await AssetRegistry.new(paymentContract.address);
			txReceipt = await registry.deployAssetContract(assetId, price, authors);
			txLogs = txReceipt.logs[0];
			assetOwner = txLogs.args._owner;
			assetAddress = txLogs.args._asset;
		});

		it("verifies contract parameters when an asset contract is constructed", async () => {
			let assetContract = await AssetContract.at(assetAddress);

			assert.equal(assetContract.address, assetAddress);
			assert.equal(await assetContract.assetId.call(), assetId);
			assert.equal(await assetContract.price.call(), price);
			assert.deepEqual(await assetContract.getAuthors(), authors);
			assert.equal(await assetContract.currentOwner.call(), assetOwner);
			assert.equal(await assetContract.currentOwner.call(), accounts[0]);
		});

		it("verifies that `AssetDeployedEvent` was emmited when an asset contract is constructed", async () => {
			assert.equal(txLogs.event, "AssetDeployedEvent");
		});

		it("verifies `assetsPerOnwer` data after asset contract is deployed", async () => {
			let assetsByOwner = await registry.getAssetByOwner(accounts[0]);
			assert.isArray(assetsByOwner);
			assert.equal(assetsByOwner.length, 1);
			assert.equal(assetsByOwner[0], assetAddress);
		});

	});

});