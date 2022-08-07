const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        // const [accountZero, ...accounts] = await ethers.getSigners()
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", async () => {
        it("sets the aggregator addresses correctly", async () => {
          const response = await fundMe.getPriceFeed();
          expect(response).to.equal(mockV3Aggregator.address);
        });
      });

      describe("fund", async () => {
        it("Fails if you do not send enough ETH", async () => {
          await expect(fundMe.fund()).to.revertedWith("Not enough");
        });

        it("updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          expect(response.toString()).to.equal(sendValue.toString());
        });

        it("add funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getFunder(0);
          expect(response).to.equal(deployer);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH from a single founder", async () => {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const txResponse = await fundMe.withdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          expect(endingFundMeBalance).to.equal(0);
          expect(startingFundMeBalance.add(startingDeployerBalance)).to.equal(
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("allow us to withdraw with multiple funders", async () => {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          const txResponse = await fundMe.withdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          expect(endingFundMeBalance).to.equal(0);
          expect(startingFundMeBalance.add(startingDeployerBalance)).to.equal(
            endingDeployerBalance.add(gasCost).toString()
          );
          await expect(fundMe.getFunder(0)).to.reverted;

          for (let i = 1; i < 6; i++) {
            expect(
              await fundMe.getAddressToAmountFunded(accounts[i].address)
            ).to.equal(0);
          }
        });

        it("Only allow the owner to withdraw", async () => {
          const [_, attacker] = await ethers.getSigners();
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(
            attackerConnectedContract.withdraw()
          ).to.revertedWithCustomError(
            attackerConnectedContract,
            "FundMe__NotOwner"
          );
        });

        it("cheaperWithdraw testing 1...", async () => {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          const txResponse = await fundMe.cheaperWithdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          expect(endingFundMeBalance).to.equal(0);
          expect(startingFundMeBalance.add(startingDeployerBalance)).to.equal(
            endingDeployerBalance.add(gasCost).toString()
          );
          await expect(fundMe.getFunder(0)).to.reverted;

          for (let i = 1; i < 6; i++) {
            expect(
              await fundMe.getAddressToAmountFunded(accounts[i].address)
            ).to.equal(0);
          }
        });

        it("cheaperWithdraw testing 2...", async () => {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const txResponse = await fundMe.cheaperWithdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          expect(endingFundMeBalance).to.equal(0);
          expect(startingFundMeBalance.add(startingDeployerBalance)).to.equal(
            endingDeployerBalance.add(gasCost).toString()
          );
        });
      });
    });
