// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Trivia {
    IERC20 public quizToken;

    struct Question {
        string questionText;
        string[] answerOptions;
    }

    struct TriviaData {
        string title;
        string pictureUrl;
        Question[] questions;
        uint256[] correctAnswers;
    }

    mapping(uint256 => mapping(address => bool)) public hasSubmitted;
    mapping(uint256 => mapping(address => bool)) public canClaimPrize;
    mapping(uint256 => mapping(address => bool)) public hasReceivedPrize;

    address public owner;

    mapping(uint256 => TriviaData) public triviaData;
    uint256 public currentTriviaId;

    event TriviaCreated(string title, string pictureURL);
    event AnswerSubmitted(address user, uint256 questionId, uint256 answerId);
    event TriviaCompleted(address user, uint256[] answers);

    event PrizeClaimable(address indexed user);
    event NoPrizeClaimable(address indexed user);
    event HasReceivedPrize(address indexed user, uint256 prizeAmount);
    event AnswersAlreadySubmitted(address indexed user, string message);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _quizToken) {
        quizToken = IERC20(_quizToken);
        owner = msg.sender;
    }

    function setDailyTrivia(
        string memory _title,
        string memory _pictureURL,
        Question[] memory _questions,
        uint256[] memory _correctAnswers
    ) public {
        require(bytes(_title).length > 0, "Trivia title cannot be empty");
        require(
            bytes(_pictureURL).length > 0,
            "Trivia picture URL cannot be empty"
        );
        require(_questions.length > 0, "There must be at least one question");

        currentTriviaId++;
        TriviaData storage trivia = triviaData[currentTriviaId];
        trivia.title = _title;
        trivia.pictureUrl = _pictureURL;
        trivia.correctAnswers = _correctAnswers;

        for (uint256 i = 0; i < _questions.length; i++) {
            trivia.questions.push(_questions[i]);
        }

        emit TriviaCreated(_title, _pictureURL);
    }

    function submitAnswer(uint256[] memory _userAnswers) public {
        TriviaData storage trivia = triviaData[currentTriviaId];
        require(
            _userAnswers.length == trivia.correctAnswers.length,
            "Invalid number of answers"
        );
        require(!hasSubmitted[currentTriviaId][msg.sender], "Already submitted answers");

        uint256 score = 0;
        for (uint256 i = 0; i < _userAnswers.length; i++) {
            if (_userAnswers[i] == trivia.correctAnswers[i]) {
                score++;
            }
        }

        hasSubmitted[currentTriviaId][msg.sender] = true;

        emit AnswersAlreadySubmitted(msg.sender, 'answers submited');

        if (score == trivia.correctAnswers.length) {
            canClaimPrize[currentTriviaId][msg.sender] = true;
            emit PrizeClaimable(msg.sender);
        } else {
            emit NoPrizeClaimable(msg.sender);
        }
    }

    function claimPrize() public {
        require(
            canClaimPrize[currentTriviaId][msg.sender],
            "User cannot claim prize yet"
        );

        uint256 prizeAmount = 100;
        transferTokens(msg.sender, prizeAmount);

        emit HasReceivedPrize(msg.sender, prizeAmount);
        hasReceivedPrize[currentTriviaId][msg.sender] = true;
        canClaimPrize[currentTriviaId][msg.sender] = false;
    }

    function transferTokens(address _to, uint256 _amount) internal {
        require(quizToken.transfer(_to, _amount), "Failed to send tokens");
    }

    function getDailyTrivia() public view returns (TriviaData memory) {
        TriviaData storage trivia = triviaData[currentTriviaId];
        return trivia;
    }

    function hasUserRecivedPrize() public view returns (bool) {
        return hasReceivedPrize[currentTriviaId][msg.sender];
    }

    function hasUserSubmitted() public view returns (bool) {
        return hasSubmitted[currentTriviaId][msg.sender];
    }

    function canUserClaimPrize() public view returns (bool) {
        return canClaimPrize[currentTriviaId][msg.sender];
    }

    function depositTokens(uint256 _amount) public onlyOwner {
        require(
            quizToken.transferFrom(msg.sender, address(this), _amount),
            "Failed to deposit tokens"
        );
    }
}
