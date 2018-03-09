pragma solidity ^0.4.11;

import "./util/Util.sol";

contract BookContract is Util {

    string public id;
    uint256 public price;
    uint256 public soldCount;
    address[] public authors;
    mapping(address => uint256) revenueRates;

    event PaymentEvent(address indexed _sender, uint256 _value);
    event RevenueChangedEvent(address indexed _author, uint256 _rate);

    function BookContract(string _id, uint256 _price, address[] _authors) public {
        id = _id;
        authors = _authors;
        price = _price;
        soldCount = 0;
    }

    function () public payable {
        require(msg.value >= price);

        for (uint8 i = 0; i < authors.length; i++) {
            address author = authors[i];
            uint256 revenue = msg.value / revenueRates[author];
            author.transfer(revenue);
        }

        soldCount = safeAdd(soldCount, 1);
        PaymentEvent(msg.sender, msg.value);
    }

    // connector weight, represented in ppm (1ppm = 0.0001%), 1-1000000
    function setRevenueRate(address _author, uint256 _rate) public 
        notThis(_author)
        validAddress(_author)
        greaterThanZero(_rate)
    {
        revenueRates[_author] = _rate;
        RevenueChangedEvent(_author, _rate);
    }

}