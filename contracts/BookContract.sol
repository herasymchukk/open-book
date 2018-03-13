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
            uint256 revenue = calculateRevenue(msg.value, revenueRates[author]);
            author.transfer(revenue);
        }

        soldCount = safeAdd(soldCount, 1);
        PaymentEvent(msg.sender, msg.value);
    }

    // `_rate` value represented in ppm (10000 ppm = 1%), 1-1000000
    function setRevenueRate(address _author, uint256 _rate) public 
        notThis(_author)
        validAddress(_author)
        greaterThanZero(_rate)
    {
        require(checkRevenueRate(_rate));

        revenueRates[_author] = _rate;
        RevenueChangedEvent(_author, _rate);
    }

    function checkRevenueRate(uint256 _rate) private view returns(bool) {
        require(_rate >= 10000 && _rate <= 1000000);
        uint256 currentRate;
        for (uint8 i = 0; i < authors.length; i++) {
            currentRate = safeAdd(currentRate, revenueRates[authors[i]]);
        }
        return safeAdd(currentRate, _rate) > 1000000;
    }

    function calculateRevenue(uint256 _value, uint256 _rate) private pure returns(uint256 revenue) {
        if (_rate < 100000 || _rate >= 100000 && _rate <= 1000000) {
            revenue = safeMul(_value, _rate) / 1000000;
        } else {
            revenue = _value;
        }
    }

}