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
const AssetContract = artifacts.require('AssetContract.sol');
const PaymentContract = artifacts.require('PaymentContract.sol');

contract("PaymentUtils", (accounts) => {

	describe("calculateRevenue", async () => {

		it("verifies a calculated revenue based on a author`s revenue rate", async () => {
			let paymentContract = await PaymentContract.new(10000, accounts[8]);
			let assetContract = await AssetContract.new("asset_id", 50000000000000000, [accounts[0], accounts[1]], accounts[0], paymentContract.address);
			let valueInWei = 50000000000000000; // 0.05 ETH in wei
			let rate = 400000; // 40%
			let expectedRevenue = 20000000000000000;
			let expectedDifference = valueInWei - expectedRevenue;
			let calculatedRevenue = await assetContract.calculateRevenue(valueInWei, rate);
			let calculatedDifference = valueInWei - calculatedRevenue;

			assert.equal(calculatedRevenue, expectedRevenue);
			assert.equal(calculatedDifference, expectedDifference);
		});

	});

});