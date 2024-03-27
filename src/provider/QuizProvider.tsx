/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, createContext, ReactNode } from "react";
import { Contract, ethers } from "ethers";
import QuizTokenAddress from "../../artifacts/QuizToken.json";
import QuizTokenAbi from "../../artifacts/contracts/QuizToken.sol/QuizToken.json";
import TriviaContractAddress from "../../artifacts/Trivia.json";
import TriviaContractAbi from "../../artifacts/contracts/Trivia.sol/Trivia.json";

declare global {
  interface Window {
    ethereum: any;
  }
}

const contracts = {
  QuizToken: {
    contract: QuizTokenAddress.address,
    abi: QuizTokenAbi.abi,
  },
  Trivia: {
    contract: TriviaContractAddress.address,
    abi: TriviaContractAbi.abi,
  },
};

const QUIZ_TOKEN = "QuizToken";
const TRIVIA_CONTRACT = "Trivia";

export type QuizContextProps = {
  children: ReactNode;
};

export type QuizContextValue = {
  connected: boolean;
  walletAddress: string | null;
  currentNetwork: string | null;
  connectWallet: () => Promise<void>;
  switchToGoerli: () => Promise<void>;
  loading: boolean | false;
  error: string | null;
  quizToken: any;
  triviaContract: any;
  isConnectedToGoerli: boolean;
  owner: string;
  currentDailyTrivia: any;
  userBalance: string;
  updateUserBalance: () => void;
  updateCurrentDailyTrivia: () => void;
  updateHasUserRecivedPrize: () => void;
  updateHasUserSubmitted: () => void;
  updateCanUserClaimPrize: () => void;
  hasUserRecivedPrize: boolean;
  hasUserSubmitted: boolean;
  canUserClaimPrize: boolean;
};

const initialValue: QuizContextValue = {
  connected: false,
  walletAddress: "",
  currentNetwork: "",
  connectWallet: async () => {},
  switchToGoerli: async () => {},
  loading: false,
  error: "",
  quizToken: () => {},
  triviaContract: () => {},
  isConnectedToGoerli: false,
  owner: "",
  currentDailyTrivia: {},
  userBalance: "",
  updateUserBalance: () => {},
  updateCurrentDailyTrivia: () => {},
  updateHasUserRecivedPrize: () => {},
  updateHasUserSubmitted: () => {},
  updateCanUserClaimPrize: () => {},
  hasUserRecivedPrize: false,
  hasUserSubmitted: false,
  canUserClaimPrize: false,
};

export const QuizContext = createContext<QuizContextValue>(initialValue);

export const QuizProvider = ({ children }: any) => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectedToGoerli /*setIsConnectedToGoerli*/] = useState(false);
  const [signer, setSigner] = useState<any>();
  const [owner, setOwner] = useState<string>("");
  const [currentDailyTrivia, setCurrentDailyTrivia] = useState<any>();
  const [quizToken, setQuizToken] = useState<Contract | undefined>();
  const [triviaContract, setTriviaContract] = useState<Contract | undefined>();
  const [userBalance, setUserBalance] = useState<string>('');
  const [hasUserRecivedPrize, setHasUserRecivedPrize] = useState<boolean>(false);
  const [hasUserSubmitted, setHasUserSubmitted] = useState<boolean>(false);
  const [canUserClaimPrize, setCanUserClaimPrize] = useState<boolean>(false);


  const getSinger = async () => {
    try {
      const provider =
      window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : new ethers.providers.JsonRpcProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    return signer;
    
    } catch (error: any) {
      console.log('Error to get signer: ', error.message)
      throw new Error('Failed to get signer.');

    }
  };

  const getQuizToken = async () => {
    try {
      const signer = await getSinger();

      return new ethers.Contract(
        contracts[QUIZ_TOKEN].contract,
        contracts[QUIZ_TOKEN].abi,
        signer
      );
    } catch (error: any) {
      console.log('Error to get token contract: ', error.message)
      throw new Error('Failed to get quiz token');
    }
  };

  const getTriviaContract = async () => {
    try {
      const signer = await getSinger();

      return new ethers.Contract(
        contracts[TRIVIA_CONTRACT].contract,
        contracts[TRIVIA_CONTRACT].abi,
        signer
      );
    } catch (error: any) {
      console.log('Error to get trivia contract: ', error.message)
      throw new Error('Failed to get trivia contract');
    }
  };

  const getUserBalance = async () => {
    try {
      const quizToken = await getQuizToken();
      const userAddress = await signer.getAddress();
      const balance = await quizToken.balanceOf(userAddress);

      return ethers.utils.formatUnits(balance, 1);
    } catch (error: any) {
      console.log('Error to get user balance: ', error.message)
    }
  };

  const getCurrentTrivia = async () => {
    const triviaContract = await getTriviaContract();
    const trivia = await triviaContract.getDailyTrivia();
    return trivia
  }

  const updateUserBalance = async () => {
    const newBalance: string = await getUserBalance() || '';
    setUserBalance(newBalance);
  }

  const updateCurrentDailyTrivia = async () => {
    const trivia = await getCurrentTrivia();
    setCurrentDailyTrivia(trivia);
  };

  const updateHasUserRecivedPrize = async () => {
    const triviaContract = await getTriviaContract();
    const hasRecivedPrize = await triviaContract.hasUserRecivedPrize();
    console.log('hasRecivedPrize ===> ', hasRecivedPrize);

    setHasUserRecivedPrize(hasRecivedPrize);
  }

  const updateHasUserSubmitted = async () => {
    const triviaContract = await getTriviaContract();
    const hasSubmitted = await triviaContract.hasUserSubmitted();
    console.log('hasSubmitted ===> ', hasSubmitted);
    setHasUserSubmitted(hasSubmitted);
  }

  const updateCanUserClaimPrize = async () => {
    const triviaContract = await getTriviaContract();
    const hasUserClaimPrize = await triviaContract.canUserClaimPrize();
    console.log('hasUserClaimPrize ===> ', hasUserClaimPrize);
    setCanUserClaimPrize(hasUserClaimPrize);
  }

  useEffect(() => {
    const checkAndConnect = async () => {
      await connectWallet();
    };

    checkAndConnect();
  }, []);

  useEffect(() => {
    if (signer) {
      const loadData = async () => {
        await loadAllData();
      };

      loadData();
    }
  }, [signer]);

  useEffect(() => {
    if (triviaContract) {
      const getBalance = async () => {
        await getUserBalance();
      };

      getBalance();
    }
  }, [triviaContract]);

  const loadContracts = async () => {
    const quizToken = await getQuizToken();
    const triviaContract = await getTriviaContract();
    const ownerAddress = await triviaContract.owner();
    
    setOwner(ownerAddress);
    setQuizToken(quizToken);
    setTriviaContract(triviaContract);
  }

  const loadAllData = async () => {
      await loadContracts();
      await updateCurrentDailyTrivia();
      await updateUserBalance();
      await updateHasUserRecivedPrize()
      await updateHasUserSubmitted();
      await updateCanUserClaimPrize();
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const provider =
        window.ethereum != null
          ? new ethers.providers.Web3Provider(window.ethereum)
          : new ethers.providers.JsonRpcProvider(window.ethereum);
      const signer = await provider.getSigner();
      const _walletAddress = await signer.getAddress();

      const network = await provider.getNetwork();
      setCurrentNetwork(network.chainId);

      setConnected(true);
      setWalletAddress(_walletAddress);
      setSigner(signer);

      // if (network.chainId !== Number("0x5")) {
      //   await switchToGoerli();
      //   setIsConnectedToGoerli(true);
      // }

      console.log("Connected to Metamask");
    } catch (error: any) {
      setError("Error connecting to Metamask: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchToGoerli = async () => {
    try {
      setLoading(true);
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x5", // Goerli Testnet
            chainName: "Goerli Testnet",
            nativeCurrency: {
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://rpc.ankr.com/eth_goerli"],
            blockExplorerUrls: ["https://goerli.etherscan.io"],
          },
        ],
      });
      await connectWallet();
    } catch (error: any) {
      setError("Error switching to Goerli: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuizContext.Provider
      value={{
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
        hasUserRecivedPrize,
        updateHasUserRecivedPrize,
        updateHasUserSubmitted,
        hasUserSubmitted,
        canUserClaimPrize,
        updateCanUserClaimPrize
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
