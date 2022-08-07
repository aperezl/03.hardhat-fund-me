const { run } = require("hardhat");
const verify = async (address, constructorArguments) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address,
      constructorArguments,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.error(error);
    }
  }
};
module.exports = {
  verify,
};
