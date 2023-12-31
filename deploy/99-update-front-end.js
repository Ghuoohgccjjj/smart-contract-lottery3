const { AbiCoder } = require("ethers/lib/utils")
const { ethers, network } = require("hardhat");
const fs = require('fs')


const FRONT_END_ADDRESS_FILE = "/home/bata/NextJs-smart-contract/tests/nextjs-smartcontract-lottery-fcc/constant/contractAddress.json"
const FRONT_END_ABI_FILE = "/home/bata/NextJs-smart-contract/tests/nextjs-smartcontract-lottery-fcc/constant/abi.json"
module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("updating frontend")
        updateContractAddresses();
        updateAbi();
    }
}

async function updateAbi() {
    const raffle = await ethers.getContract("Raffle");

    try {
        // Use "json" as the format type to generate the ABI in JSON format
        const abiJson = raffle.interface.format("json");

        // Write the ABI to the specified file
        fs.writeFileSync(FRONT_END_ABI_FILE, abiJson);
    } catch (error) {
        console.error("Error updating ABI:", error);
    }
}

// get raffle contract
async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const raffle = await ethers.getContract("Raffle");
    const currentAddress = JSON.parse(fs.readFileSync(FRONT_END_ADDRESS_FILE, "utf-8"))
    if (chainId in currentAddress) {
        if (!currentAddress[chainId].includes(raffle.address)) {
            currentAddress[chainId].push(raffle.address);
        }

    }
    {
        currentAddress[chainId] = [raffle.address];
    }

    fs.writeFileSync(FRONT_END_ADDRESS_FILE, JSON.stringify(currentAddress))
}

module.exports.tags = ["all", "frontend"]