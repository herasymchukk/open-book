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

contract Util {

	address public currentOwner;
	event TransferOwnershipEvent(address indexed _oldOwner, address indexed _newOwner);

	function safeAdd(uint256 _x, uint256 _y) internal pure returns (uint256) {
		uint256 z = _x + _y;
		assert(z >= _x);
		return z;
	}

	function safeSub(uint256 _x, uint256 _y) internal pure returns (uint256) {
		assert(_x >= _y);
		return _x - _y;
	}

	function safeMul(uint256 _x, uint256 _y) internal pure returns (uint256) {
		uint256 z = _x * _y;
		assert(_x == 0 || z / _x == _y);
		return z;
	}

	function nonEmpty(string _str) public pure returns(bool) {
		return bytes(_str).length != 0;
	}

	function transferContractOwnership(address _newOwner) public onlyOwner {
		require(_newOwner != address(0));
		require(_newOwner != currentOwner);
		emit TransferOwnershipEvent(currentOwner, _newOwner);
		currentOwner = _newOwner;
	}

	modifier greaterThanZero(uint256 _amount) {
		require(_amount > 0);
		_;
	}

	modifier validAddress(address _address) {
		require(_address != 0x0);
		_;
	}

	modifier notThis(address _address) {
		require(_address != address(this));
		_;
	}

	modifier onlyOwner() {
		require(msg.sender == currentOwner);
		_;
	}

}