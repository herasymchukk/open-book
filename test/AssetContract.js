const AssetContract = artifacts.require('AssetContract.sol');

function isException(stacktrace) {
	return stacktrace.includes('VM Exception') 
	|| stacktrace.includes('invalid opcode') 
	|| stacktrace.includes('invalid JUMP');
}

contract("AssetContract", (accounts) => {

	describe("construction", async () => {

		it("verifies contract parameters when a contract is constructed", async () => {
			let author_0 = accounts[0];
			let author_1 = accounts[1];
			let authors = [author_0, author_1];
			let assetContract = await AssetContract.new("asset_id", 50000000000000000, authors);
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
				let assetContract = await AssetContract.new("", 50000000000000000, [accounts[0], accounts[1]]);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});
	
		it("should throw if `_authors` is empty", async () => {
			try {
				let assetContract = await AssetContract.new("asset_id", 50000000000000000, []);
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
			assetContract = await AssetContract.new("asset_id", priceVaue, [accounts[0], accounts[1]]);
		});

		it("verifies that a `price` value has been changed", async () => {
			let startPrice = await assetContract.price.call();
	
			assert.equal(startPrice, priceVaue);

			await assetContract.changePrice(newPrice);
			let changedPrice = await assetContract.price.call();
	
			assert.equal(changedPrice, newPrice);
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

	describe("calculateRevenue", async () => {

		it("verifies a calculated revenue based on a author`s revenue rate", async () => {
			let assetContract = await AssetContract.new("asset_id", 50000000000000000, [accounts[0], accounts[1]]);
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

	describe("setRevenueRate", async () => {

		var assetContract;
		let priceVaue = 50000000000000000;
		let newPrice = 40000000000000000;
		let author_0 = accounts[0];
		let author_1 = accounts[1];

		beforeEach(async () => {
			assetContract = await AssetContract.new("asset_id", priceVaue, [accounts[0], accounts[1]]);
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
			assetContract = await AssetContract.new("asset_id", priceVaue, [accounts[0], accounts[1]]);
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