/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { ethers } = require('hardhat');

const QUIZ_TOKEN = 'QuizToken';
const TRIVIA_CONSTRACT = 'Trivia';

async function deployTokenContract(tokenContractName) {
  const tokenFactory = await ethers.getContractFactory(tokenContractName);
  const deployedToken = await tokenFactory.deploy();
  await deployedToken.deployed();
  return deployedToken;
}

async function approveAndTransferTokens(tokenContract, contractAddress) {
  const totalSupply = await tokenContract.totalSupply();
  const approveTx = await tokenContract.approve(contractAddress, totalSupply);
  await approveTx.wait();
  const transferTx = await tokenContract.transfer(contractAddress, totalSupply);
  await transferTx.wait();
}

async function saveContractArtifacts(contract, contractName) {
  const contractAddress = JSON.stringify({ address: contract.address }, null, 4);
  fs.writeFileSync(`./artifacts/${contractName}.json`, contractAddress, 'utf8');
  console.log(`Deployed contract ${contractName} address`, contract.address);
}

async function deployContracts() {
  try {
    const deployedToken = await deployTokenContract(QUIZ_TOKEN);
    const deployedContract = await ethers.getContractFactory(TRIVIA_CONSTRACT).then(factory => factory.deploy(deployedToken.address));
    await deployedContract.deployed();
    await approveAndTransferTokens(deployedToken, deployedContract.address);
    await saveContractArtifacts(deployedToken, QUIZ_TOKEN);
    await saveContractArtifacts(deployedContract, TRIVIA_CONSTRACT);
  } catch (error) {
    console.error('Error deploying contract:', error);
  }
}

async function main() {
  try {
    await deployContracts();
    console.log('\n');
    console.log('===========================================');
    console.log('=   All Contracts Deployed successfully!  =');
    console.log('===========================================');
  } catch (error) {
    console.log('Error deploying contracts')
  }

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})