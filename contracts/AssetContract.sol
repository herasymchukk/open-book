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

import "./util/Util.sol";

contract AssetContract is Util {

	uint256 private constant MIN_REVENUE_RATE   = 10000;   // 1%
	uint256 private constant TEN_PERCENT_IN_PPM = 100000;  // 10%
	uint256 private constant MAX_REVENUE_RATE   = 1000000; // 100%

	string public assetId;	
	uint256 public price;
	uint256 public soldCount;
	address[] public authors;
	mapping(address => Revenue) public revenueRates;
	mapping(address => bool) public buyers;

	event PaymentEvent(address indexed _sender, uint256 _value);
	event RevenueRateChangedEvent(address indexed _author, uint256 _rate);
	event PriceChangedEvent(uint256 _oldPrice, uint256 _newPrice);

	struct Revenue {
		uint256 revenueRate;
		bool isAuthor;
	}

	function AssetContract(string _assetId, uint256 _price, address[] _authors, address _owner) public {
		require(nonEmpty(_assetId));
		require(_authors.length > 0);
	
		currentOwner = _owner;
		assetId = _assetId;
		authors = _authors;
		price = _price;
		soldCount = 0;

		for (uint256 i = 0; i < _authors.length; i++) {
			revenueRates[_authors[i]] = Revenue(0, true);
		}
	}

	function () public payable {
		require(msg.value >= price);
		require(getSummaryRate() == MAX_REVENUE_RATE);

		for (uint256 i = 0; i < authors.length; i++) {
			address authorAddress = authors[i];
			Revenue storage revenueMeta = revenueRates[authorAddress];
			uint256 revenue = calculateRevenue(msg.value, revenueMeta.revenueRate);
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

	function checkRevenueRate(uint256 _rate) public view returns(bool) {
		require(_rate >= MIN_REVENUE_RATE && _rate <= MAX_REVENUE_RATE);
		uint256 summaryRate = getSummaryRate();
		return safeAdd(summaryRate, _rate) <= MAX_REVENUE_RATE;
	}

	function getSummaryRate() private view returns(uint256) {
		uint256 rate = 0;
		for (uint256 i = 0; i < authors.length; i++) {
			Revenue storage revenueMeta = revenueRates[authors[i]];
			rate = safeAdd(rate, revenueMeta.revenueRate);
		}
		return rate;
	}

	function changePrice(uint256 _price) public onlyOwner {
		uint256 oldPrice = price;
		price = _price;
		emit PriceChangedEvent(oldPrice, price);
	}

	function calculateRevenue(uint256 _value, uint256 _rate) public pure returns(uint256 revenue) {
		if (_rate < TEN_PERCENT_IN_PPM || _rate >= TEN_PERCENT_IN_PPM && _rate <= MAX_REVENUE_RATE) {
			revenue = safeMul(_value, _rate) / MAX_REVENUE_RATE;
		} else {
			revenue = _value;
		}
	}

	function getAuthors() public view returns(address[]) {
		return authors;
	}

	function verifyBuyer(address _buyer) public view returns(bool) {
		return buyers[_buyer];
	}

}