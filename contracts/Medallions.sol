// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC721Enumerable.sol";
import "./interfaces/IMedallionsRenderer.sol";

contract Medallions is ERC721Enumerable, Ownable, ReentrancyGuard {  
    event MintWithRunner(uint indexed _runnerId, uint indexed _tokenId);

    address public proxyRegistryAddress;
    uint public total;
    mapping(uint => uint) public runnerToToken;
    address public renderingContractAddress;
    uint8 public mintPhase = 0;

    uint private constant MAX_MINT = 8;
    uint private constant RUNNER_MINT_PRICE = 0.01 ether;
    uint private constant PUBLIC_MINT_PRICE = 0.015 ether;

    address private foundryTreasury;
    ParentContract private chainRunners; 
    string private baseURI;

    mapping(address => uint256) private withdrawalAllotment1000th;
    mapping(address => uint256) private withdrawedAmount;
    uint256 private totalWithdrawed;

    constructor(
        address foundryTreasuryAddress,
        address chainRunnersAddress,
        address _proxyRegistryAddress,
        uint _total
    ) ERC721("Medallions", "MEDALLION") {
        foundryTreasury = foundryTreasuryAddress;
        chainRunners = ParentContract(chainRunnersAddress);
        proxyRegistryAddress = _proxyRegistryAddress;
        total = _total;

        withdrawalAllotment1000th[foundryTreasuryAddress] = 900;                                 // 90%  - Medallions Team
        withdrawalAllotment1000th[address(0x44A2ee3bB45d002157d2508C1003A4e055D52Bc8)] = 100;    // 10%  - Chain Runners Team
    }

    function mintWithRunners(uint256 [] memory ids) external payable {
        uint supply = totalSupply();
        uint qty = ids.length;

        require(supply + qty <= total, "Minting exceeds total");
        require(mintPhase == 1, "Mint not active");
        require(RUNNER_MINT_PRICE * qty == msg.value, "Invalid funds");

        for (uint i = 0; i < ids.length; i++) {
            uint runnerId = ids[i];
            uint nextTokenId = supply + 1 + i;

            require(runnerToToken[runnerId] == 0, "Medallion already owned");
            require(chainRunners.ownerOf(runnerId) == _msgSender(), "Must own all runners");

            _mint(_msgSender(), nextTokenId);
            runnerToToken[runnerId] = nextTokenId;

            emit MintWithRunner(runnerId, nextTokenId);
        }
    }

    function mint(uint256 qty) external payable {
        uint supply = totalSupply();

        require(qty <= MAX_MINT, "Minting too many");
        require(mintPhase == 2, "Mint not active");
        require(supply + qty <= total, "Minting exceeds total");
        require(PUBLIC_MINT_PRICE * qty == msg.value, "Invalid funds");

        for(uint i = 1; i <= qty; i++) { 
            _mint(_msgSender(), supply + i);
        }
    }

    function setRenderingContractAddress(address _renderingContractAddress) public onlyOwner {
        renderingContractAddress = _renderingContractAddress;
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }
  
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "Token does not exist.");

        if (renderingContractAddress != address(0)) {
            IMedallionsRenderer renderer = IMedallionsRenderer(renderingContractAddress);
            return renderer.tokenURI(_tokenId);
        } else {
            return string(abi.encodePacked(baseURI, Strings.toString(_tokenId)));
        }
    }

    function setMintPhase(uint8 value) public onlyOwner {
        require(value <= 2, "Invalid phase");
        mintPhase = value;
    }

    receive() external payable {}

    function allowedWithdrawalAmount(address _addr) public view returns (uint256) {
        uint256 allotment1000th = withdrawalAllotment1000th[_addr];
        uint256 _total = address(this).balance + totalWithdrawed;
        uint256 amount = _total * allotment1000th / 1000 - withdrawedAmount[_addr];
        return amount;
    }

    function setProxyRegistryAddress(address _proxyRegistryAddress) external onlyOwner {
        proxyRegistryAddress = _proxyRegistryAddress;
    }

    function withdraw() public nonReentrant {
        require(withdrawalAllotment1000th[_msgSender()] > 0, "Not allowed to withdraw");

        uint256 amount = allowedWithdrawalAmount(_msgSender());
        require(amount > 0, "Amount must be positive");

        withdrawedAmount[_msgSender()] += amount;
        totalWithdrawed += amount;
        (bool success,) = _msgSender().call{value : amount}('');
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
