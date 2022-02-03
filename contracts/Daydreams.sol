// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "erc721a/contracts/ERC721A.sol";

contract Daydreams is ERC721A, Ownable, ReentrancyGuard {  
    address public proxyRegistryAddress;
    uint public total;
    uint8 public phase = 1;
    bytes32 public merkleRoot;

    uint public constant MAX_MINT = 8;
    uint8 public constant RESERVED_SUPPLY = 100;
    uint public constant PRESALE_MINT_PRICE = 0.06 ether;
    uint public constant MINT_PRICE = 0.06 ether;

    address private treasury;
    string private baseURI;
    mapping(address => bool) private claimed;

    constructor(
        address _treasury,
        address _proxyRegistry,
        uint _total
    ) ERC721A("Daydreams", "DAYDREAM") {
        treasury = _treasury;
        proxyRegistryAddress = _proxyRegistry;
        total = _total;
    }

    receive() external payable {}

    //todo: add public can claim method, call from ui

    function presaleMint(uint256 _qty, bytes32[] calldata _merkleProof) external payable {
        uint supply = totalSupply();
        bytes32 leaf = keccak256(abi.encodePacked(_msgSender()));

        require(phase == 1, "Mint not active");
        require(!claimed[msg.sender], "Already claimed");
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Not on the list");
        require(_qty <= MAX_MINT, "Minting too many");
        require(supply + _qty <= total, "Minting exceeds total");
        require(PRESALE_MINT_PRICE * _qty == msg.value, "Invalid funds");

        claimed[_msgSender()] = true;
        _safeMint(_msgSender(), _qty);
    }


    function mint(uint256 _qty) external payable {
        uint supply = totalSupply();

        require(_qty <= MAX_MINT, "Minting too many");
        require(phase == 2, "Mint not active");
        require(supply + _qty <= total, "Minting exceeds total");
        require(MINT_PRICE * _qty == msg.value, "Invalid funds");

        _safeMint(_msgSender(), _qty);
    }

    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function isOnPresaleList(bytes32[] calldata _merkleProof) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_msgSender()));
        return MerkleProof.verify(_merkleProof, merkleRoot, leaf);
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }
  
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "Token does not exist.");
        return string(abi.encodePacked(baseURI, Strings.toString(_tokenId)));
    }

    function setPhase(uint8 _value) public onlyOwner {
        require(_value <= 2, "Invalid phase");
        phase = _value;
    }

    function setProxyRegistryAddress(address _proxyRegistryAddress) external onlyOwner {
        proxyRegistryAddress = _proxyRegistryAddress;
    }

    function withdraw() public nonReentrant {
        require(treasury == _msgSender(), "Unauthorized");
        (bool success,) = _msgSender().call{value : address(this).balance}('');
        require(success, "Withdrawal failed");
    }


    function isApprovedForAll(address _owner, address _operator) public view override returns (bool) {
        // Enable gasless listings on opensea
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(_owner)) == _operator) {
            return true;
        }

        return super.isApprovedForAll(_owner, _operator);
    }

    function getBalance() external view returns(uint) {
        return (address(this)).balance;
    }
}

contract OwnableDelegateProxy {}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}
