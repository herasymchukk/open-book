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

import "../util/PaymentUtils.sol";

contract IAssetContract is PaymentUtils {

	string public assetId;	
	uint256 public price;
	uint256 public soldCount;
	address[] public authors;
	uint256 public authorsCount;
	mapping(address => Revenue) public revenueRates;
	mapping(address => bool) public buyers;

	event PaymentEvent(address indexed _sender, uint256 _value);
	event RevenueRateChangedEvent(address indexed _author, uint256 _rate);
	event PriceChangedEvent(uint256 _oldPrice, uint256 _newPrice);

	struct Revenue {
		uint256 revenueRate;
		bool isAuthor;
	}

	function setRevenueRate(address _author, uint256 _rate) public;
	function changePrice(uint256 _price) public;

	function getAuthor(uint256 _index) public view returns(address) {
		return authors[_index];
	}

	function getAuthorsRate(address _author) public view returns(uint256) {
		return revenueRates[_author].revenueRate;
	}

	function getAuthors() public view returns(address[]) {
		return authors;
	}

	function verifyBuyer(address _buyer) public view returns(bool) {
		return buyers[_buyer];
	}

	function checkRevenueRate(uint256 _rate) public view returns(bool) {
		require(_rate >= MIN_REVENUE_RATE && _rate <= MAX_REVENUE_RATE);
		uint256 summaryRate = getSummaryRate();
		return safeAdd(summaryRate, _rate) <= MAX_REVENUE_RATE;
	}

	function getSummaryRate() internal view returns(uint256) {
		uint256 rate = 0;
		for (uint256 i = 0; i < authors.length; i++) {
			Revenue storage revenueMeta = revenueRates[authors[i]];
			rate = safeAdd(rate, revenueMeta.revenueRate);
		}
		return rate;
	}

}