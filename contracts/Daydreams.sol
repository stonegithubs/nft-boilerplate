// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC721Enumerable.sol";

contract Daydreams is ERC721Enumerable, Ownable, ReentrancyGuard {  
    address public proxyRegistryAddress;
    uint public total;
    uint8 public phase = 1;
    uint8 public reservedSupply = 100;

    uint private constant MAX_MINT = 8;
    uint private constant RUNNER_MINT_PRICE = 0.01 ether;
    uint private constant PUBLIC_MINT_PRICE = 0.015 ether;

    address private foundryTreasury;
    string private baseURI;

    constructor(
        address treasuryAddress,
        address _proxyRegistryAddress,
        uint _total
    ) ERC721("Daydreams", "DAYDREAM") {
        foundryTreasury = treasuryAddress;
        proxyRegistryAddress = _proxyRegistryAddress;
        total = _total;
    }

    function mint(uint256 qty) external payable {
        uint supply = totalSupply();

        require(qty <= MAX_MINT, "Minting too many");
        require(phase == 2, "Mint not active");
        require(supply + qty <= total, "Minting exceeds total");
        require(PUBLIC_MINT_PRICE * qty == msg.value, "Invalid funds");

        for(uint i = 1; i <= qty; i++) { 
            _mint(_msgSender(), supply + i);
        }
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }
  
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "Token does not exist.");
        return string(abi.encodePacked(baseURI, Strings.toString(_tokenId)));
    }

    function setphase(uint8 value) public onlyOwner {
        require(value <= 2, "Invalid phase");
        phase = value;
    }

    receive() external payable {}

    function setProxyRegistryAddress(address _proxyRegistryAddress) external onlyOwner {
        proxyRegistryAddress = _proxyRegistryAddress;
    }

    function withdraw() public nonReentrant onlyOwner {
        //todo dont fuck iup
        (bool success,) = _msgSender().call{value : address(this).balance}('');
        require(success, "Withdrawal failed");
    }


    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        // Enable gasless listings on opensea
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(owner)) == operator) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }

    function getBalance() external view returns(uint) {
        return (address(this)).balance;
    }
}

abstract contract ParentContract {
    function ownerOf(uint256 tokenId) public virtual view returns (address);
    function balanceOf(address owner) external virtual view returns (uint256 balance);
}

contract OwnableDelegateProxy {}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}
