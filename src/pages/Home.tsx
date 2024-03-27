/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button, Container, Typography } from "@mui/material";
import { useQuiz } from "../hooks/useQuiz";
import QuizComponent from "../components/Trivia/Trivia";

const Home: React.FC = () => {
  const {
    loading,
    error,
    connected,
    walletAddress,
    switchToGoerli,
    connectWallet,
    isConnectedToGoerli,
    userBalance,
  } = useQuiz();

  return (
    <Container>
      <Typography variant="h2" component="h2" gutterBottom>
        Welcome to the Daily Trivia
      </Typography>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {connected ? (
        <div>
          <Typography variant="h6" paragraph>
            Connected to Metamask!
          </Typography>
         
          {userBalance && <Typography variant="h4" paragraph>
            Balance: {userBalance}
          </Typography>}
          <Typography variant="h6" paragraph>
            User Address: {walletAddress || "Loading..."}
          </Typography>
          <QuizComponent />
          {isConnectedToGoerli && (
            <Button
              variant="contained"
              color="primary"
              onClick={switchToGoerli}
            >
              Switch to Goerli Testnet
            </Button>
          )}
        </div>
      ) : (
        <Button variant="contained" color="primary" onClick={connectWallet}>
          Connect to Metamask
        </Button>
      )}
    </Container>
  );
};

export default Home;
