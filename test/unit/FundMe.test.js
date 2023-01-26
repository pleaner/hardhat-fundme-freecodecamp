const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async () => {

    let fundMe, deployer, mockV3Aggregator
    const toEth = (amount) => ethers.utils.parseEther(amount.toString())
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture("all")
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })

    describe("constructor", async () => {

        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async () => {
        it("Fails if you dont send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })

        it("updates the amount funded data structer", async () => {
            const sendValue = toEth("1")
            await fundMe.fund({value: sendValue})
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Add the funder to the getFunder array", async () => {
            const sendValue = toEth("1")
            await fundMe.fund({value: sendValue})
            const acutal = await fundMe.getFunder(0)
            assert.equal(acutal, deployer)
        })
    })

    describe("withdrawl", async () => {
        beforeEach(async () => {
            const sendValue = toEth("1")
            await fundMe.fund({value: sendValue})
        })

        it("withdrawl from a single funder", async () => {
            // Arrange
            const startingBalanceContract = await fundMe.provider.getBalance(fundMe.address)
            const startingBalanceDeployer = await fundMe.provider.getBalance(deployer)
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReciept = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReciept
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingBalanceContract = await fundMe.provider.getBalance(fundMe.address)
            const endingBalanceDeployer = await fundMe.provider.getBalance(deployer)
            //Assert
            assert.equal(endingBalanceContract, 0)
            assert.equal(startingBalanceContract.add(startingBalanceDeployer).toString(), endingBalanceDeployer.add(gasCost).toString())

        })

        it("withdrawl from a multiple getFunder", async () => {
            // Given
            const accounts = await ethers.getSigners()
            let sentEth = 0;
            for(let i = 1; i < 6; i++){
                const funderMeConnectedContract = fundMe.connect(accounts[i])
                let sendValue = toEth(i)
                await funderMeConnectedContract.fund({value: sendValue})
                sentEth += i
            }

            const startingBalanceContract = await fundMe.provider.getBalance(fundMe.address)
            const startingBalanceDeployer = await fundMe.provider.getBalance(deployer)

            // When
            const transactionResponse = await fundMe.withdraw()
            const transactionReciept = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReciept
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingBalanceContract = await fundMe.provider.getBalance(fundMe.address)
            const endingBalanceDeployer = await fundMe.provider.getBalance(deployer)
            // Then

            assert.equal(endingBalanceContract, 0)
            assert.equal(startingBalanceContract.add(startingBalanceDeployer).toString(), endingBalanceDeployer.add(gasCost).toString())

            await expect(fundMe.getFunder(0)).to.be.reverted

            for(let i = 1; i < 6; i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), "0")
            }

        })

        it("cheaper withdrawl from a multiple getFunder", async () => {
            // Given
            const accounts = await ethers.getSigners()
            let sentEth = 0;
            for(let i = 1; i < 6; i++){
                const funderMeConnectedContract = fundMe.connect(accounts[i])
                let sendValue = toEth(i)
                await funderMeConnectedContract.fund({value: sendValue})
                sentEth += i
            }

            const startingBalanceContract = await fundMe.provider.getBalance(fundMe.address)
            const startingBalanceDeployer = await fundMe.provider.getBalance(deployer)

            // When
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReciept = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReciept
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingBalanceContract = await fundMe.provider.getBalance(fundMe.address)
            const endingBalanceDeployer = await fundMe.provider.getBalance(deployer)
            // Then

            assert.equal(endingBalanceContract, 0)
            assert.equal(startingBalanceContract.add(startingBalanceDeployer).toString(), endingBalanceDeployer.add(gasCost).toString())

            await expect(fundMe.getFunder(0)).to.be.reverted

            for(let i = 1; i < 6; i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), "0")
            }

        })

        it("reverts withdraw", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerFundMe = await fundMe.connect(attacker)
            await expect(attackerFundMe.withdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
    })
})