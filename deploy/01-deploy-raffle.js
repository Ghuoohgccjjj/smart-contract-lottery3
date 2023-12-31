const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { verify } = require('../utils/verify');

const { developmentChains, networkConfig } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let vrfCoordinatorV2Address, subscriptionId;

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        subscriptionId = transactionReceipt.events[0]?.args?.subId;

        if (!subscriptionId) {
            throw new Error("Subscription ID not found in transaction receipt.");
        }

        // fund subscription
        const VRF_FUND_AMOUNT = ethers.utils.parseEther("30");
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }

    const raffleEntranceFee = networkConfig[chainId]["raffleEntranceFee"];
    const gasLane = networkConfig[chainId]["gasLane"];
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
    const keepersUpdateInterval = networkConfig[chainId]["keepersUpdateInterval"];
    const args = [vrfCoordinatorV2Address, raffleEntranceFee, gasLane, subscriptionId, callbackGasLimit, keepersUpdateInterval];

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(raffle.address, args);
    }

    log("-------------------------------------------");
}

module.exports.tags = ["all", "raffle"];
