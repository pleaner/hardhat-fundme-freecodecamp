const { getNamedAccounts, ethers } = require("hardhat")

const main = async () => {
    console.log("Strating Funding...")
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding Contract...")
    const txResponse = await fundMe.fund({value: ethers.utils.parseEther("0.1")})
    await txResponse.wait(1)
    console.log("Funded ETH 0.1")
}

main()
    .then(process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })