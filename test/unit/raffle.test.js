// eslint-disable-next-line no-unused-vars
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

let raffle, raffleEntranceFee, deployer, vrfCoordinatorV2Mocks, interval;

if (developmentChains.includes(network.name)) {
    const chainId = network.config.chainId;
    describe("Raffle Unit Test", function () {


        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            raffle = await ethers.getContract("Raffle", deployer);
            vrfCoordinatorV2Mocks = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
            raffleEntranceFee = await raffle.getEntranceFee();
            interval = await raffle.getInterval();;
        });

        describe("constructor", function () {
            it("initializes the raffle correctly", async function () {
                // ideally we make  our test one assert per it
                const raffleState = await raffle.getRaffleState(); // we need to checkto see if raffle state is open before deploying
                assert.equal(raffleState.toString(), "0");
                // assert.equal(interval.toString(), networkConfig[chainId]["keepersUpdateInterval"]);
            });
        });

        describe("enterRaffle", async function () {
            it("Reverts when you dont pay enough gas", async function () {
                await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle not enough");
            });
        });


        it("records player when they enter entrance fee", async function () {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            const playerFromContract = await raffle.getPlayer(0);
            assert.equal(playerFromContract, deployer)
        })
        it("emits event on enter", async function () {
            await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(raffle, "RaffleEnter")
        })
        // it("it dosent allow entrance when raffle is calculating", async function () {
        //     await raffle.enterRaffle({ value: raffleEntranceFee })
        //     await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) // increase the time required so we can meet up with time 
        //     await network.provider.send("evm_mine", []) // mine extra block so that we can beat up time in our contract
        //     // we pretend to be the chainlink keeper
        //     await raffle.performUpkeep([]);
        //     expect(raffle.enterRaffle({ value: raffleEntranceFee }).to.be.revertedWith("Raffle not open"))
        // })

        describe("checkUpKeep", async function () {
            it("it returns false if people havnt sent any Eth", async function () {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", []);
                // simulate the transaction  not really calling
                const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([])
                assert(!upKeepNeeded);
            })
            // it("returns false if raffle is open", async function () {
            //     await raffle.enterRaffle({ value: raffleEntranceFee })
            //     await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            //     await network.provider.send("evm_mine", [])
            //     // another way to send a blank byte object
            //     await raffle.performUpkeep([]) //await raffle.performUpkeep("0x")
            //     const raffleState = await raffle.getRaffleState()
            //     const { upKeepNeeded } = raffle.callStatic.checkUpkeep([])
            //     assert.equal(raffleState.toString(), "1")
            //     assert.equal(upKeepNeeded, false)
            // })
        })

        describe("pefrormUpKeep", function () {
            // it("it can only run if checkupkeep is true", async function () {
            //     await raffle.enterRaffle({ value: raffleEntranceFee })
            //     await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            //     await network.provider.send("evm_mine", []);
            //     const tx = await raffle.performUpkeep([])
            //     assert(tx)
            // })
            // it("reverts when checkupkeep is flase", async function () {
            //     await expect(raffle.performUpkeep([])).to.be.revertedWith(
            //         "Raffle_UpKeepNot needed")
            // })
            // it("updates raffle stte, emits and event an calls the vrf coordinator", async function () {
            //     await raffle.enterRaffle({ value: raffleEntranceFee });
            //     await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            //     await network.provider.send("evm_mine", []);
            //     const txResponse = await raffle.performUpkeep([])
            //     const txReciept = await txResponse.wait(1);
            //     const requestId = txReciept.events[1].args.requestId
            //     const raffleState = await raffle.getRaffleState();
            //     assert(requestId.toNumber() > 0);
            //     assert(raffleState.toString() === 1);
            // })

        })

        describe("fulfillRandomWords", async function () {
            beforeEach(async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", []);
            })
            it("it can only be called after perform upkeep", async function () {
                await expect(vrfCoordinatorV2Mocks.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("non existance requst");
                await expect(vrfCoordinatorV2Mocks.fulfillRandomWords(1, raffle.address)).to.be.revertedWith("non existance requst");
            })
        })
    });

} else {
    describe.skip();
}
