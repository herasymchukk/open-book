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

import "./util/PaymentUtils.sol";

contract PaymentContract is PaymentUtils {

	uint256 public platformFee;
	address public platformRevenueAddress;

	event PlatformFeeChangedEvent(uint256 _oldPlatformFee, uint256 _newPlatformFee);
	event PlatformRevenueAddressChangedEvent(address _oldAddress, address _newAddress);

	function PaymentContract(uint256 _platformFee, address _platformRevenueAddress) public {
		platformFee = _platformFee;
		if (_platformRevenueAddress == 0x0) {
			platformRevenueAddress = msg.sender;
		} else {
			platformRevenueAddress = _platformRevenueAddress;
		}
		currentOwner = msg.sender;
	}

	function setPlatformFee(uint256 _platformFee) public onlyOwner {
		require(_platformFee != platformFee);

		emit PlatformFeeChangedEvent(platformFee, _platformFee);
		platformFee = _platformFee;
	}

	function setPlatformRevenueAddress(address _platformRevenueAddress) public 
		onlyOwner
		validAddress(_platformRevenueAddress)
		notThis(_platformRevenueAddress)
	{
		require(_platformRevenueAddress != platformRevenueAddress);

		emit PlatformRevenueAddressChangedEvent(platformRevenueAddress, _platformRevenueAddress);
		platformRevenueAddress = _platformRevenueAddress;
	}

	function handlePayment(address authorAddress, uint256 revenueRate, uint256 value) public {
		uint256 revenue = calculateRevenue(value, revenueRate);
		authorAddress.transfer(revenue);
	}

	function calculateFee(uint256 _value) public view returns(uint256) {
		if (platformFee == 0) {
			return 0;
		} else {
			return calculateRevenue(_value, platformFee);
		}
	}

}