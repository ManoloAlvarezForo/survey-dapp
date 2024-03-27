/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import Stack from "@mui/material/Stack";
import styles from "./TriviaFormDialog.module.css";
import { Question, TriviaData } from "../Trivia/Trivia";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type TriviaFormDialogProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  triviaData: TriviaData;
  setTriviaData: (value: any) => void;
  onHandleCreate: () => void;
};

const TriviaFormDialog: React.FC<TriviaFormDialogProps> = ({
  openModal,
  setOpenModal,
  triviaData,
  setTriviaData,
  onHandleCreate,
}: TriviaFormDialogProps) => {
  const [newAnswer, setNewAnswer] = useState("");
  // const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const handleClose = () => {
    setOpenModal(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTriviaData((prevState: any) => ({ ...prevState, [name]: value }));
  };

  const handleAnswerChange = (selectedValue: any, questionIndex: any) => {
    const updatedSelectedAnswers = [...triviaData.correctAnswers];
    updatedSelectedAnswers[questionIndex] = parseInt(selectedValue);
    setTriviaData({ ...triviaData, correctAnswers: updatedSelectedAnswers });
  };

  const handleAddAnswer = () => {
    if (newAnswer === "") {
      return;
    }

    const updatedQuestions = [...triviaData.questions];
    const lastQuestion = updatedQuestions[updatedQuestions.length - 1];
    lastQuestion.answerOptions.push(newAnswer);
    setNewAnswer("");

    setTriviaData({ ...triviaData, questions: updatedQuestions });
  };

  const handleRemoveAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...triviaData.questions];
    const question = updatedQuestions[questionIndex];
    question.answerOptions.splice(answerIndex, 1);

    setTriviaData({ ...triviaData, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      questionText: "",
      answerOptions: [],
    };

    setTriviaData((prevState: any) => ({
      ...prevState,
      questions: [...prevState.questions, newQuestion],
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...triviaData.questions];
    updatedQuestions.splice(index, 1);
    setTriviaData({ ...triviaData, questions: updatedQuestions });
  };

  const handleSubmit = () => {
    onHandleCreate();
    handleClose();
  };

  return (
    <Dialog
      fullScreen
      open={openModal}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "fixed" }} color="secondary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Create Trivia
          </Typography>
          <Button
            endIcon={<SendIcon />}
            autoFocus
            color="inherit"
            onClick={handleSubmit}
          >
            Send Trivia
          </Button>
        </Toolbar>
      </AppBar>
      <div className={styles.content}>
        <form>
          <Stack direction="column" spacing={2}>
            <TextField
              fullWidth
              label="Title"
              id="title"
              name="title"
              value={triviaData.title}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              id="pictureUrl"
              name="pictureUrl"
              value={triviaData.pictureUrl}
              onChange={handleChange}
              label="URL de imagen"
            />
            <div className={styles.questionsContainer}>
              {triviaData.questions.map(
                (question: Question, questionIndex: number) => (
                  <div key={questionIndex}>
                    <div style={{ width: "100%" }}>
                      <div className={styles.questionContent}>
                        <label>Question {questionIndex + 1}:</label>
                        <div className={styles.buttonLeft}>
                          <Button
                            startIcon={<DeleteIcon />}
                            variant="outlined"
                            onClick={() => handleRemoveQuestion(questionIndex)}
                          >
                            Remove Question
                          </Button>
                        </div>
                      </div>
                      <textarea
                        style={{ width: "100%" }}
                        value={question.questionText}
                        onChange={(event) => {
                          const updatedQuestions = [...triviaData.questions];
                          updatedQuestions[questionIndex].questionText =
                            event.target.value;
                          setTriviaData({
                            ...triviaData,
                            questions: updatedQuestions,
                          });
                        }}
                      />
                    </div>
                    <div className={styles.answersContainer}>
                      <Stack
                        direction="column"
                        spacing={2}
                        justifyContent="center"
                      >
                        <label>Anwsers: (Select the correct answer)</label>
                        <RadioGroup
                          key={questionIndex}
                          aria-label={`Question ${questionIndex + 1} Answers`}
                          value={
                            triviaData.correctAnswers[questionIndex] !==
                            undefined
                              ? triviaData.correctAnswers[
                                  questionIndex
                                ].toString()
                              : ""
                          }
                          onChange={(event) =>
                            handleAnswerChange(
                              event.target.value,
                              questionIndex
                            )
                          }
                        >
                          <Stack direction="column" spacing={2}>
                            {question.answerOptions.map(
                              (answer, answerIndex) => (
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  key={answerIndex}
                                >
                                  <FormControlLabel
                                    key={answerIndex}
                                    value={answerIndex.toString()}
                                    control={<Radio />}
                                    label={answer}
                                  />
                                  <Button
                                    startIcon={<DeleteIcon />}
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      handleRemoveAnswer(
                                        questionIndex,
                                        answerIndex
                                      )
                                    }
                                  >
                                    Delete
                                  </Button>
                                </Stack>
                              )
                            )}
                          </Stack>
                        </RadioGroup>

                        <TextField
                          fullWidth
                          value={newAnswer}
                          onChange={(event) => setNewAnswer(event.target.value)}
                        />
                      </Stack>
                      <div className={styles.buttonLeft}>
                        <Button
                          startIcon={<AddIcon />}
                          variant="outlined"
                          onClick={handleAddAnswer}
                        >
                          Add Anwser
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className={styles.buttonRight}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={handleAddQuestion}
              >
                Add Question
              </Button>
            </div>

            <div className={styles.buttonLeft}>
              <Button
                endIcon={<SendIcon />}
                color="secondary"
                variant="contained"
                onClick={handleSubmit}
              >
                Send Trivia
              </Button>
            </div>
          </Stack>
        </form>
      </div>
    </Dialog>
  );
};

export default TriviaFormDialog;
