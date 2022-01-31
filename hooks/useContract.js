import { useMemo } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

const useContract = (contractAddress = undefined, ABI) => {
  const { library, account } = useWeb3React();

  return useMemo(() => {
    if (!contractAddress || !ABI || !library) return null;
    try {
      return new ethers.Contract(contractAddress, ABI, library.getSigner());
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [library]);
};

export default useContract;
