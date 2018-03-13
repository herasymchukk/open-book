const Util = artifacts.require('Util.sol');
const BookContract = artifacts.require('BookContract.sol');

module.exports = async (deployer) => {
    deployer.deploy(Util);
    deployer.deploy(BookContract, "book_id", 1000000, ["0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"]);
};