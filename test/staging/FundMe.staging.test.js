const { assert } = require("chai")
const { getNamedAccounts, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async () => {

    let fundMe, deployer
    const toEth = (amount) => ethers.utils.parseEther(amount.toString())
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
    })

    it("allows people to fund and withdraw", async () => {
        await fundMe.fund({value: toEth("0.1")})
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(endingBalance.toString(), "0")
    })
})