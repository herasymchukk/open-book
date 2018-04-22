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

function isException(stacktrace) {
	return stacktrace.includes('VM Exception') 
	|| stacktrace.includes('invalid opcode') 
	|| stacktrace.includes('invalid JUMP');
}

contract("AssetContract", (accounts) => {

	var paymentContract;

	beforeEach(async () => {
		paymentContract = await PaymentContract.new(10000, accounts[8]);
	});

	describe("construction", async () => {

		it("verifies contract parameters when a contract is constructed", async () => {
			let author_0 = accounts[0];
			let author_1 = accounts[1];
			let authors = [author_0, author_1];
			let assetContract = await AssetContract.new("asset_id", 50000000000000000, authors, accounts[0], paymentContract.address);
			let assetId = await assetContract.assetId.call();
			let assetPrice = await assetContract.price.call();
			let retrievedAuthors = await assetContract.getAuthors();
			let soldCount = await assetContract.soldCount.call();
			let revenueMetaAuthor_0 = await assetContract.revenueRates.call([author_0]);
			let revenueMetaAuthor_1 = await assetContract.revenueRates.call([author_1]);
			let initialRevenueRate_author_0 = revenueMetaAuthor_0[0];
			let initialRevenueRate_author_1 = revenueMetaAuthor_1[0];
			let isAuthor_0 = revenueMetaAuthor_0[1];
			let isAuthor_1 = revenueMetaAuthor_1[1];
	
			assert.equal(soldCount, 0);
			assert.equal(assetId, "asset_id");
			assert.equal(assetPrice, 50000000000000000);
			assert.equal(retrievedAuthors.length, authors.length);
			assert.equal(retrievedAuthors[0], author_0);
			assert.equal(retrievedAuthors[1], author_1);
			assert.equal(initialRevenueRate_author_0, 0);
			assert.isTrue(isAuthor_0);
			assert.equal(initialRevenueRate_author_1, 0);
			assert.isTrue(isAuthor_1);
		});
	
		it("should throw if `_assetId` is empty", async () => {
			try {
				let assetContract = await AssetContract.new("", 50000000000000000, [accounts[0], accounts[1]], accounts[0], paymentContract.address);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});
	
		it("should throw if `_authors` is empty", async () => {
			try {
				let assetContract = await AssetContract.new("asset_id", 50000000000000000, [], accounts[0], paymentContract.address);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

	});

	describe("changePrice", async () => {

		var assetContract;
		let priceVaue = 50000000000000000;
		let newPrice = 40000000000000000;

		beforeEach(async () => {
			assetContract = await AssetContract.new("asset_id", priceVaue, [accounts[0], accounts[1]], accounts[0], paymentContract.address);
		});

		it("verifies that a `price` value has been changed", async () => {
			let startPrice = await assetContract.price.call();
	
			assert.equal(startPrice, priceVaue);

			await assetContract.changePrice(newPrice);
			let changedPrice = await assetContract.price.call();
	
			assert.equal(changedPrice, newPrice);
		});

		it("verifies that `PriceChangedEvent` was emmited when a price is changed", async () => {
			let txReceipt = await assetContract.changePrice(newPrice);
			assert.equal(txReceipt.logs[0].event, "PriceChangedEvent");
		});

		it("should throw if called by a non-owner", async () => {
			try {
				let nonOwner = accounts[3];
				await assetContract.changePrice(newPrice, { from: nonOwner })
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

	});

	describe("payment function (fallback)", async () => {

		it("verifies that balance of an each author was increased after payment", async () => {
			let priceVaue = 50000000000000000;
			let account1_revenueRate = 700000;
			let account2_revenueRate = 300000;
			let ethValue = new web3.BigNumber(web3.toWei(2));
			
			let fee = await paymentContract.calculateFee(ethValue);
			let ethValueNet = ethValue.sub(fee.toNumber());

			let assetContract = await AssetContract.new("asset_id", priceVaue, [accounts[1], accounts[2]], accounts[0], paymentContract.address);
			await assetContract.setRevenueRate(accounts[1], account1_revenueRate);
			await assetContract.setRevenueRate(accounts[2], account2_revenueRate);

			let account1_BalanceBeforeTransaction = await web3.eth.getBalance(accounts[1]);
			let account2_BalanceBeforeTransaction = await web3.eth.getBalance(accounts[2]);
			
			let account1_CalculatedRevenue = await assetContract.calculateRevenue(ethValueNet, account1_revenueRate);
			let account2_CalculatedRevenue = await assetContract.calculateRevenue(ethValueNet, account2_revenueRate);

			await web3.eth.sendTransaction({ from: accounts[6], to: assetContract.address, value: ethValue, gas: 100000 });

			let account1_BalanceAfterTransaction = await web3.eth.getBalance(accounts[1]);
			let account2_BalanceAfterTransaction = await web3.eth.getBalance(accounts[2]);

			assert.deepEqual(account1_BalanceAfterTransaction, account1_BalanceBeforeTransaction.add(account1_CalculatedRevenue));
			assert.deepEqual(account2_BalanceAfterTransaction, account2_BalanceBeforeTransaction.add(account2_CalculatedRevenue));
		});

	});

	describe("setRevenueRate", async () => {

		var assetContract;
		let priceVaue = 50000000000000000;
		let newPrice = 40000000000000000;
		let author_0 = accounts[0];
		let author_1 = accounts[1];

		beforeEach(async () => {
			assetContract = await AssetContract.new("asset_id", priceVaue, [accounts[0], accounts[1]], accounts[0], paymentContract.address);
		});

		it("verifies a revenue rate", async () => {
			await assetContract.setRevenueRate(author_0, 700000);
			await assetContract.setRevenueRate(author_1, 300000);

			let revenueMetaAuthor_0 = await assetContract.revenueRates.call([author_0]);
			let revenueMetaAuthor_1 = await assetContract.revenueRates.call([author_1]);
			let initialRevenueRate_author_0 = revenueMetaAuthor_0[0];
			let initialRevenueRate_author_1 = revenueMetaAuthor_1[0];

			assert.equal(initialRevenueRate_author_0, 700000);
			assert.equal(initialRevenueRate_author_1, 300000);
		});

		it("verifies that `RevenueRateChangedEvent` was emmited when a revenue rate is changed", async () => {
			let txReceipt = await assetContract.setRevenueRate(author_0, 700000);
			assert.equal(txReceipt.logs[0].event, "RevenueRateChangedEvent");
		});

		it("should throw if called by a non-owner", async () => {
			try {
				let nonOwner = accounts[3];
				await assetContract.setRevenueRate(accounts[0], 300000, { from: nonOwner });
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw if `_rate` is 0", async () => {
			try {
				await assetContract.setRevenueRate(accounts[0], 0);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw when attempts to set a revenue rate to a non-author address", async () => {
			try {
				await assetContract.setRevenueRate(accounts[2], 300000);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw when attempts to set a revenue rate to a contract itself", async () => {
			try {
				await assetContract.setRevenueRate(assetContract.address, 300000);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw when attempts to set a revenue rate to an empty address", async () => {
			try {
				await assetContract.setRevenueRate("0x0", 300000);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw when summary rate owerflow", async () => {
			try {
				await assetContract.setRevenueRate(accounts[0], 300000);
				await assetContract.setRevenueRate(accounts[1], 800000);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

	});

	describe("checkRevenueRate", async () => {

		var assetContract;
		let priceVaue = 50000000000000000;
		let newPrice = 40000000000000000;

		const MIN_REVENUE_RATE = 10000;
		const MAX_REVENUE_RATE = 1000000;

		beforeEach(async () => {
			assetContract = await AssetContract.new("asset_id", priceVaue, [accounts[0], accounts[1]], accounts[0], paymentContract.address);
		});

		it("should throw if `_rate` is less then MIN_REVENUE_RATE", async () => {
			try {
				await assetContract.checkRevenueRate(9999);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw if `_rate` is greater then MAX_REVENUE_RATE", async () => {
			try {
				await assetContract.checkRevenueRate(1000001);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		// an awful name. should be renamed.
		it("verifies that `_rate` value will not overflow", async () => {
			await assetContract.setRevenueRate(accounts[0], 300000);
			assert.isTrue(await assetContract.checkRevenueRate(700000));

			await assetContract.setRevenueRate(accounts[1], 700000);
			assert.isFalse(await assetContract.checkRevenueRate(200000));
		});

	});

});