import wl from "../public/whitelist.json";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

export const whitelistTree = () => {
  const leafs = wl.map(keccak256);
  const tree = new MerkleTree(leafs, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  return {
    tree,
    root,
    leafs,
  };
};
