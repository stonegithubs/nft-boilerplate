import keccak256 from "keccak256";
import { whitelistTree } from "../../../lib/whitelist";

export default async function handler(req, res) {
  const { address } = req.query;

  if (!address) {
    return res.status(422).send();
  }

  const { tree, root } = whitelistTree();

  const leaf = keccak256(address);
  const proof = tree.getHexProof(leaf);
  const valid = tree.verify(proof, leaf, root);

  res.json({
    proof,
    valid,
    root,
  });
}
