import { useContext } from 'react'
import { QuizContext } from '../provider/QuizProvider'

export const useQuiz = () => {
  const { 
    connected,
    walletAddress,
    currentNetwork,
    connectWallet,
    switchToGoerli,
    loading,
    error,
    quizToken,
    triviaContract,
    isConnectedToGoerli,
    owner,
    currentDailyTrivia,
    userBalance,
    updateUserBalance,
    updateCurrentDailyTrivia,
    updateHasUserRecivedPrize,
    hasUserRecivedPrize,
    updateHasUserSubmitted,
    hasUserSubmitted,
    canUserClaimPrize,
    updateCanUserClaimPrize
  } = useContext(QuizContext)
  return { connected,
    walletAddress,
    currentNetwork,
    connectWallet,
    switchToGoerli,
    loading,
    error,
    quizToken,
    triviaContract,
    isConnectedToGoerli,
    owner,
    currentDailyTrivia,
    userBalance,
    updateUserBalance,
    updateCurrentDailyTrivia,
    updateHasUserRecivedPrize,
    hasUserRecivedPrize,
    updateHasUserSubmitted,
    hasUserSubmitted,
    canUserClaimPrize,
    updateCanUserClaimPrize
  }
}