import { useWeb3React } from "@web3-react/core";

export default function Account() {
  const { account } = useWeb3React();

  return (
    <>
      {account === null
        ? "-"
        : account
        ? `${account.substring(0, 6)}...${account.substring(
            account.length - 4
          )}`
        : ""}
    </>
  );
}
