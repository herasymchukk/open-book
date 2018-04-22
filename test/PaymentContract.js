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

contract("PaymentContract", (accounts) => {

	describe("setPlatformRevenueAddress", async () => {
		
		it("verifies that `platformRevenueAddress` has been changed`", async () => {
			let initialAddress = accounts[8];
			let paymentContract = await PaymentContract.new(10000, initialAddress);
			assert.equal(initialAddress, await paymentContract.platformRevenueAddress.call());

			let newAddress = accounts[9];
			await paymentContract.setPlatformRevenueAddress(newAddress);
			assert.equal(newAddress, await paymentContract.platformRevenueAddress.call());
		});

		it("should throw if called by a non-owner", async () => {
			try {
				let paymentContract = await PaymentContract.new(10000, accounts[8]);
				await paymentContract.setPlatformRevenueAddress(accounts[9], { from: accounts[2] });
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw when attempts to set a contract address as a revenueAddress", async () => {
			try {
				let paymentContract = await PaymentContract.new(10000, accounts[8]);
				await paymentContract.setPlatformRevenueAddress(paymentContract.address);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw when attempts to set an invalid address as a revenueAddress", async () => {
			try {
				let paymentContract = await PaymentContract.new(10000, accounts[8]);
				await paymentContract.setPlatformRevenueAddress("0x0");
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw when attempts to set the same address", async () => {
			try {
				let paymentContract = await PaymentContract.new(10000, accounts[8]);
				await paymentContract.setPlatformRevenueAddress(accounts[8]);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

	});

	describe("setPlatformFee", async () => {
	
		it("should throw if called by a non-owner", async () => {
			try {
				let paymentContract = await PaymentContract.new(10000, accounts[8]);
				await paymentContract.setPlatformFee(20000, { from: accounts[2] });
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("should throw when attempts to set the same value", async () => {
			try {
				let paymentContract = await PaymentContract.new(10000, accounts[8]);
				await paymentContract.setPlatformFee(10000);
				assert(false, "no exception.");
			} catch (error) {
					let stacktrace = error.toString();
					return assert(isException(stacktrace), stacktrace);
			}
		});

		it("verifies that `platformFee` has been changed`", async () => {
			let initialFee = 10000;
			let paymentContract = await PaymentContract.new(initialFee, accounts[8]);
			assert.equal(initialFee, await paymentContract.platformFee.call());

			let newFee = 20000;
			await paymentContract.setPlatformFee(newFee);
			assert.equal(newFee, await paymentContract.platformFee.call());
		});

	});

});