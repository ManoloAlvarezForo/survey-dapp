import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("Trivia", function () {
  let trivia;
  let user1;
  let quizToken; // Add this line

  beforeEach(async function () {
    [user1] = await ethers.getSigners();

    // Deploy QuizToken contract
    const QuizToken = await ethers.getContractFactory("QuizToken");
    quizToken = await QuizToken.deploy();
    await quizToken.deployed();

    // Deploy Trivia contract
    const Trivia = await ethers.getContractFactory("Trivia");
    trivia = await Trivia.deploy(quizToken.address);
    await trivia.deployed();
  });

  it("Should set daily trivia correctly", async function () {
    const title = "Test Trivia";
    const pictureURL = "https://example.com/trivia";
    const question = {
      questionText: "What is the capital of France?",
      answerOptions: ["Paris", "London", "New York", "Berlin"],
    };

    await trivia.setDailyTrivia(title, pictureURL, [question], [0]);

    const dailyTrivia = await trivia.getDailyTrivia();

    expect(dailyTrivia.title).to.equal(title);
    expect(dailyTrivia.pictureUrl).to.equal(pictureURL);
    expect(dailyTrivia.questions.length).to.equal(1);
    expect(dailyTrivia.questions[0].questionText).to.equal(
      question.questionText
    );
    expect(dailyTrivia.questions[0].answerOptions).to.deep.equal(
      question.answerOptions
    );
  });

  it("Should submit answers and claim prize", async function () {
    // Set daily trivias
    const title = "Test Trivia";
    const pictureURL = "https://example.com/trivia";
    const question = {
      questionText: "What is the capital of France?",
      answerOptions: ["Paris", "London", "New York", "Berlin"],
    };

    await trivia.setDailyTrivia(title, pictureURL, [question], [0]);

    // Submit answers
    const txSubmit = await trivia
      .connect(user1)
      .submitAnswer([0], { gasLimit: 5000000 });
    await txSubmit.wait();

    // Transfer tokens to the contract
    const tokenAmount = 100;
    await quizToken.transfer(trivia.address, tokenAmount);

    // Claim prize
    const txClaim = await trivia
      .connect(user1)
      .claimPrize({ gasLimit: 5000000 });
    await txClaim.wait();

    // Check if user1 has claimed the prize
    const canClaimPrize = await trivia.canUserClaimPrize();
    expect(canClaimPrize).to.equal(false);
  });
});
