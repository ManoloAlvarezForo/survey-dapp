/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Box,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useQuiz } from "../../hooks/useQuiz";
import TriviaFormModal from "../CreateTrivia/TriviaFormModal";
import { ethers } from "ethers";

export type TriviaData = {
  title: string;
  pictureUrl: string;
  questions: Question[];
  correctAnswers: number[];
};

export type Question = {
  questionText: string;
  answerOptions: string[];
};

const initialTriviaData = {
  title: "",
  pictureUrl: "",
  questions: [],
  correctAnswers: [],
};

const Trivia: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponse, setUserResponse] = useState<number[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: string;
  }>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [timer, setTimer] = useState(10);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const {
    triviaContract,
    currentDailyTrivia,
    owner,
    walletAddress,
    quizToken,
    updateUserBalance,
    updateCurrentDailyTrivia,
    hasUserRecivedPrize,
    updateHasUserRecivedPrize,
    updateHasUserSubmitted,
    hasUserSubmitted,
    canUserClaimPrize,
    updateCanUserClaimPrize,
  } = useQuiz();
  const [openModal, setOpenModal] = useState(false);
  const [triviaData, setTriviaData] = useState<TriviaData>(initialTriviaData);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (triviaContract) {
      const loadEventData = () => {
        const triviaCreatedListener = (data: any) => {
          console.log("Created Trivia:", data);
          updateCurrentDailyTrivia();
          setLoading(false);
          enqueueSnackbar("Created Trivia successfully", {
            variant: "success",
          });
        };

        const prizeClaimableListener = (data: any) => {
          const message = `Congrats! ${data} can claim prize!`;
          updateCanUserClaimPrize();
          setLoading(false);
          enqueueSnackbar(message, { variant: "success" });
        };

        const noPrizeClaimableListener = (data: any) => {
          const message = `Sorry! ${data} can not claim prize!`;
          updateCanUserClaimPrize();
          setLoading(false);
          enqueueSnackbar(message, { variant: "success" });
        };

        const hasReceivedPrizeListener = (data: any) => {
          console.log(data);
          const message =
            "Congrats! to complete the trivia successfully you received the prize!";
          updateCanUserClaimPrize();
          updateHasUserSubmitted();
          updateUserBalance();
          updateHasUserRecivedPrize();
          setLoading(false);
          enqueueSnackbar(message, { variant: "success" });
        };

        const answersAlreadySubmittedListener = (data: any) => {
          console.log(data);
          const message = "answers already Submitted";
          updateCanUserClaimPrize();
          updateHasUserSubmitted();
          setLoading(false);
          enqueueSnackbar(message, { variant: "error" });
        };

        triviaContract.on("TriviaCreated", triviaCreatedListener);
        triviaContract.on("PrizeClaimable", prizeClaimableListener);
        triviaContract.on("NoPrizeClaimable", noPrizeClaimableListener);
        triviaContract.on("HasReceivedPrize", hasReceivedPrizeListener);
        triviaContract.on(
          "AnswersAlreadySubmitted",
          answersAlreadySubmittedListener
        );

        return () => {
          triviaContract.off("TriviaCreated", triviaCreatedListener);
          triviaContract.off("PrizeClaimable", prizeClaimableListener);
          triviaContract.off("NoPrizeClaimable", noPrizeClaimableListener);
          triviaContract.on("HasReceivedPrize", hasReceivedPrizeListener);
          triviaContract.on(
            "AnswersAlreadySubmitted",
            answersAlreadySubmittedListener
          );
        };
      };

      loadEventData();
    }

    return () => {
      if (triviaContract) {
        triviaContract.removeAllListeners();
      }
    };
  }, [enqueueSnackbar, triviaContract]);

  useEffect(() => {
    const handleTimer = () => {
      setTimer((prevTimer) => prevTimer - 1);
    };

    if (quizStarted && timer > 0) {
      const intervalIdGenerated = setInterval(handleTimer, 1000);
      setIntervalId(intervalIdGenerated);
    }

    if (quizStarted && timer === 0) {
      handleNextQuestion();
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [quizStarted, timer]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectedOptions = { ...selectedOptions };
    const selectedValue = event.target.value;
    newSelectedOptions[currentQuestion] = selectedValue;
    setSelectedOptions(newSelectedOptions);
    const userResponseIndex =
      currentDailyTrivia.questions[currentQuestion].answerOptions.indexOf(
        selectedValue
      );
    setUserResponse([...userResponse, userResponseIndex]);
  };

  const handleNextQuestion = () => {
    const currentQuestionAndOne = currentQuestion + 1;

    setCurrentQuestion(currentQuestionAndOne);

    if (currentQuestionAndOne === currentDailyTrivia.questions.length) {
      if (intervalId !== null) {
        clearInterval(intervalId);
        setIntervalId(null);
        setQuizStarted(false);
        setShowSubmit(true);
      }
    } else {
      setTimer(10);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      const triviaTx = await triviaContract.submitAnswer(userResponse);
      triviaTx.wait();
      updateHasUserSubmitted();
    } catch (error: any) {
      enqueueSnackbar(error.data.data.reason, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimQuiz = async () => {
    try {
      setLoading(true);
      const amount = ethers.utils.parseUnits("100", "18");
      const approvalTx = await quizToken.approve(
        triviaContract.address,
        amount
      );
      await approvalTx.wait();

      const claimTx = await triviaContract.claimPrize();
      await claimTx.wait();
    } catch (error: any) {
      enqueueSnackbar(error.data.data.reason, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onHandleCreate = async () => {
    try {
      setLoading(true);
      await (
        await triviaContract.setDailyTrivia(
          triviaData.title,
          triviaData.pictureUrl,
          triviaData.questions,
          triviaData.correctAnswers
        )
      ).wait();
    } catch (error: any) {
      enqueueSnackbar(error.data.data.reason, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateTrivia = () => {
    setOpenModal(true);
  };

  const thereIsDailyTrivia =
    currentDailyTrivia && currentDailyTrivia.title !== "";

  const renderTrivia = () =>
    owner === walletAddress ? (
      <>
        {thereIsDailyTrivia ? (
          <Typography variant="h6" color="orange" paragraph>
            Current Trivia: {currentDailyTrivia.title}
          </Typography>
        ) : (
          <Typography variant="h6" color="orange" paragraph>
            Sorry! No Trivia configured for today
          </Typography>
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpenCreateTrivia}
          style={{ marginTop: "16px" }}
        >
          Create New Trivia
        </Button>
      </>
    ) : quizStarted || showSubmit ? (
      renderQuestions()
    ) : thereIsDailyTrivia ? (
      <>
        <Typography variant="h6" color="orange" paragraph>
          Current Trivia: {currentDailyTrivia.title}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setQuizStarted(true)}
        >
          Begin Answering
        </Button>
      </>
    ) : (
      <Typography variant="h6" color="orange" paragraph>
        Sorry! No Trivia configured for today
      </Typography>
    );
  const getValidatedView = () => {
    if (hasUserRecivedPrize) {
      return (
        <Typography variant="h6" color="green" paragraph>
          Congrats to complete the prize successfully and should be returning
          for the next trivia
        </Typography>
      );
    }

    if (hasUserSubmitted && !canUserClaimPrize) {
      return (
        <Typography variant="h6" color="orange" paragraph>
          Already you sent your answers without success luck for the next
          trivia.
        </Typography>
      );
    }

    if (canUserClaimPrize) {
      return (
        <Button variant="contained" color="secondary" onClick={handleClaimQuiz}>
          Claim $Quiz
        </Button>
      );
    }

    return renderTrivia();
  };

  const renderQuestions = () => (
    <>
      {currentQuestion < currentDailyTrivia.questions.length ? (
        <>
          <Typography variant="h5" gutterBottom>
            Question {currentQuestion + 1}:
          </Typography>
          <Typography variant="body1" paragraph>
            {currentDailyTrivia.questions[currentQuestion].questionText}
          </Typography>
          <RadioGroup
            value={selectedOptions[currentQuestion] || ""}
            onChange={handleOptionChange}
          >
            {currentDailyTrivia.questions[currentQuestion].answerOptions.map(
              (option: string, index: number) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              )
            )}
          </RadioGroup>
          <Typography variant="body1" paragraph>
            Time left: {timer} seconds
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextQuestion}
            disabled={timer === 0}
          >
            Next Q
          </Button>
        </>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Results
          </Typography>
          <Typography variant="body1" paragraph>
            Selected: {Object.keys(selectedOptions).length} /{" "}
            {currentDailyTrivia.questions.length}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmitQuiz}
          >
            Submit Answers
          </Button>
        </>
      )}
    </>
  );

  return (
    <>
      <Card>
        <CardContent>
          {getValidatedView()}
          <TriviaFormModal
            openModal={openModal}
            setOpenModal={setOpenModal}
            onHandleCreate={onHandleCreate}
            triviaData={triviaData}
            setTriviaData={setTriviaData}
          />
        </CardContent>
      </Card>
      {loading && (
        <Box margin={3}>
          <CircularProgress color="secondary" size={64} />
        </Box>
      )}
    </>
  );
};

export default Trivia;
