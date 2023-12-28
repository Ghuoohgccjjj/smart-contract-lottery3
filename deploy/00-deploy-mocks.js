const { ethers } = require("ethers")
const { developmentChains } = require("../helper-hardhat-config")
const { getNamedAccounts, deployments, network } = require("hardhat")

const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9  //calculated value based on price of the link

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId;
    const args = [BASE_FEE, GAS_PRICE_LINK];

    if (developmentChains.includes(network.name)) {
        log("Local Network dected ! deploying mocks")
        // deploying a mork vr2 coordinator...
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,

        })
    }

    // await deploy("Raffle", {
    //     from: deployer,
    //     args: args,
    //     log: true,
    //     waitConfirmations: network.config.blockConfirmations || 1,

    // })

    log("Mocks Deployed")
    log("--------------------------------------")
}

module.exports.tags = ["all", "mocks"]