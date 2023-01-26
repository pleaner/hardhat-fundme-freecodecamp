const { getNamedAccounts, ethers } = require("hardhat")

const main = async () => {
    console.log("Strating Withrawl...")
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Withdrawing Contract...")
    const txResponse = await fundMe.withdraw()
    await txResponse.wait(1)
    console.log("Funds Withdrawn.")
}

main()
    .then(process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })