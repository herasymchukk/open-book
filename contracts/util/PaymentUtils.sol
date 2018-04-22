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

import "./Util.sol";

contract PaymentUtils is Util {

	uint256 public constant MIN_REVENUE_RATE   = 10000;   // 1%
	uint256 public constant TEN_PERCENT_IN_PPM = 100000;  // 10%
	uint256 public constant MAX_REVENUE_RATE   = 1000000; // 100%

	function calculateRevenue(uint256 _value, uint256 _rate) public pure returns(uint256 revenue) {
		if (_rate < TEN_PERCENT_IN_PPM || _rate >= TEN_PERCENT_IN_PPM && _rate <= MAX_REVENUE_RATE) {
			revenue = safeMul(_value, _rate) / MAX_REVENUE_RATE;
		} else {
			revenue = _value;
		}
	}

}