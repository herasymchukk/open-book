const Util = artifacts.require('Util.sol');
const BookContract = artifacts.require('BookContract.sol');

module.exports = async (deployer) => {
    deployer.deploy(Util);
    deployer.deploy(BookContract, "book_id", 1000000, ["0x766a1b81694586c543ba3ad099046301fe57678f", "0x6ffc558a55fafbad8ef097a13cb15575472c1122"]);
};