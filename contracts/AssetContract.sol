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

import "./traits/IAssetContract.sol";
import "./PaymentContract.sol";

contract AssetContract is IAssetContract {

	PaymentContract public paymentContract;

	function AssetContract(string _assetId, uint256 _price, address[] _authors, address _owner, PaymentContract _paymentContract) public {
		require(nonEmpty(_assetId));
		require(_authors.length > 0);
	
		currentOwner = _owner;
		assetId = _assetId;
		authors = _authors;
		price = _price;
		soldCount = 0;
		paymentContract = _paymentContract;

		for (uint256 i = 0; i < _authors.length; i++) {
			revenueRates[_authors[i]] = Revenue(0, true);
		}
	}

	function () public payable {
		require(msg.value >= price);
		require(getSummaryRate() == MAX_REVENUE_RATE);

		uint256 value = msg.value;
		uint256 fee = paymentContract.calculateFee(value);
		if (fee > 0) {
			address platformRevenueAddress = paymentContract.platformRevenueAddress();
			platformRevenueAddress.transfer(fee);
			value = safeSub(value, fee);
		}

		for (uint256 i = 0; i < authors.length; i++) {
			address authorAddress = authors[i];
			Revenue storage revenueMeta = revenueRates[authorAddress];
			uint256 revenue = calculateRevenue(value, revenueMeta.revenueRate);
			authorAddress.transfer(revenue);
		}

		soldCount = safeAdd(soldCount, 1);
		buyers[msg.sender] = true;
		emit PaymentEvent(msg.sender, msg.value);
	}

	// `_rate` value is represented in ppm (10000 ppm = 1%), 1-1000000
	function setRevenueRate(address _author, uint256 _rate) public 
		notThis(_author)
		validAddress(_author)
		greaterThanZero(_rate)
		onlyOwner
	{
		assert(revenueRates[_author].isAuthor);
		require(checkRevenueRate(_rate));

		revenueRates[_author].revenueRate = _rate;
		emit RevenueRateChangedEvent(_author, _rate);
	}

	function changePrice(uint256 _price) public onlyOwner {
		uint256 oldPrice = price;
		price = _price;
		emit PriceChangedEvent(oldPrice, price);
	}

}