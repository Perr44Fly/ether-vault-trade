// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract EtherVaultTrade is SepoliaConfig {
    using FHE for *;
    
    struct Trade {
        euint32 tradeId;
        euint32 fromAmount;
        euint32 toAmount;
        euint32 price;
        address trader;
        address fromToken;
        address toToken;
        bool isExecuted;
        bool isPrivate;
        uint256 timestamp;
        uint256 deadline;
    }
    
    struct TokenBalance {
        euint32 balance;
        euint32 lockedBalance;
        bool isActive;
    }
    
    struct TradingPair {
        address fromToken;
        address toToken;
        euint32 liquidity;
        euint32 price;
        bool isActive;
        uint256 lastUpdate;
    }
    
    mapping(uint256 => Trade) public trades;
    mapping(address => mapping(address => TokenBalance)) public balances;
    mapping(bytes32 => TradingPair) public tradingPairs;
    mapping(address => euint32) public traderReputation;
    mapping(address => bool) public authorizedTokens;
    
    uint256 public tradeCounter;
    address public owner;
    address public feeCollector;
    euint32 public platformFee; // Encrypted fee percentage
    
    event TradeCreated(uint256 indexed tradeId, address indexed trader, address fromToken, address toToken);
    event TradeExecuted(uint256 indexed tradeId, address indexed trader, uint32 fromAmount, uint32 toAmount);
    event LiquidityAdded(address indexed tokenA, address indexed tokenB, uint32 amount);
    event LiquidityRemoved(address indexed tokenA, address indexed tokenB, uint32 amount);
    event TokenAuthorized(address indexed token, bool isAuthorized);
    event ReputationUpdated(address indexed trader, uint32 reputation);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedToken(address token) {
        require(authorizedTokens[token], "Token not authorized");
        _;
    }
    
    constructor(address _feeCollector) {
        owner = msg.sender;
        feeCollector = _feeCollector;
        platformFee = FHE.asEuint32(25); // 0.25% fee (25 basis points)
    }
    
    function createTrade(
        address fromToken,
        address toToken,
        externalEuint32 fromAmount,
        externalEuint32 minToAmount,
        bytes calldata inputProof,
        uint256 deadline
    ) public onlyAuthorizedToken(fromToken) onlyAuthorizedToken(toToken) returns (uint256) {
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(fromToken != toToken, "Cannot trade same token");
        
        uint256 tradeId = tradeCounter++;
        
        // Convert external encrypted amount to internal
        euint32 internalFromAmount = FHE.fromExternal(fromAmount, inputProof);
        
        // Verify trader has sufficient balance
        euint32 availableBalance = FHE.sub(balances[msg.sender][fromToken].balance, balances[msg.sender][fromToken].lockedBalance);
        require(FHE.decrypt(FHE.gte(availableBalance, internalFromAmount)), "Insufficient balance");
        
        // Lock the trading amount
        balances[msg.sender][fromToken].lockedBalance = FHE.add(balances[msg.sender][fromToken].lockedBalance, internalFromAmount);
        
        // Get current price for the trading pair
        bytes32 pairKey = keccak256(abi.encodePacked(fromToken, toToken));
        TradingPair storage pair = tradingPairs[pairKey];
        
        // Calculate expected output amount
        euint32 expectedToAmount = FHE.mul(internalFromAmount, pair.price);
        euint32 feeAmount = FHE.mul(expectedToAmount, platformFee);
        euint32 finalToAmount = FHE.sub(expectedToAmount, feeAmount);
        
        // Verify minimum amount requirement
        require(FHE.decrypt(FHE.gte(finalToAmount, minToAmount)), "Insufficient output amount");
        
        trades[tradeId] = Trade({
            tradeId: FHE.asEuint32(0), // Will be set properly later
            fromAmount: internalFromAmount,
            toAmount: finalToAmount,
            price: pair.price,
            trader: msg.sender,
            fromToken: fromToken,
            toToken: toToken,
            isExecuted: false,
            isPrivate: true,
            timestamp: block.timestamp,
            deadline: deadline
        });
        
        emit TradeCreated(tradeId, msg.sender, fromToken, toToken);
        return tradeId;
    }
    
    function executeTrade(uint256 tradeId) public {
        Trade storage trade = trades[tradeId];
        require(trade.trader != address(0), "Trade does not exist");
        require(!trade.isExecuted, "Trade already executed");
        require(block.timestamp <= trade.deadline, "Trade deadline exceeded");
        
        // Verify sufficient liquidity
        bytes32 pairKey = keccak256(abi.encodePacked(trade.fromToken, trade.toToken));
        TradingPair storage pair = tradingPairs[pairKey];
        require(pair.isActive, "Trading pair not active");
        require(FHE.decrypt(FHE.gte(pair.liquidity, trade.toAmount)), "Insufficient liquidity");
        
        // Execute the trade
        trade.isExecuted = true;
        
        // Update balances
        balances[trade.trader][trade.fromToken].lockedBalance = FHE.sub(balances[trade.trader][trade.fromToken].lockedBalance, trade.fromAmount);
        balances[trade.trader][trade.toToken].balance = FHE.add(balances[trade.trader][trade.toToken].balance, trade.toAmount);
        
        // Update liquidity
        pair.liquidity = FHE.sub(pair.liquidity, trade.toAmount);
        
        // Calculate and collect fee
        euint32 feeAmount = FHE.mul(trade.toAmount, platformFee);
        balances[feeCollector][trade.toToken].balance = FHE.add(balances[feeCollector][trade.toToken].balance, feeAmount);
        
        // Update trader reputation
        euint32 reputationIncrease = FHE.asEuint32(10); // Base reputation increase
        traderReputation[trade.trader] = FHE.add(traderReputation[trade.trader], reputationIncrease);
        
        emit TradeExecuted(tradeId, trade.trader, 0, 0); // Amounts will be decrypted off-chain
        emit ReputationUpdated(trade.trader, 0); // Reputation will be decrypted off-chain
    }
    
    function cancelTrade(uint256 tradeId) public {
        Trade storage trade = trades[tradeId];
        require(trade.trader == msg.sender, "Only trader can cancel");
        require(!trade.isExecuted, "Trade already executed");
        
        // Unlock the trading amount
        balances[msg.sender][trade.fromToken].lockedBalance = FHE.sub(balances[msg.sender][trade.fromToken].lockedBalance, trade.fromAmount);
        
        // Mark trade as executed to prevent re-execution
        trade.isExecuted = true;
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        externalEuint32 amountA,
        externalEuint32 amountB,
        bytes calldata inputProof
    ) public onlyAuthorizedToken(tokenA) onlyAuthorizedToken(tokenB) {
        require(tokenA != tokenB, "Cannot add liquidity for same token");
        
        // Convert external amounts to internal
        euint32 internalAmountA = FHE.fromExternal(amountA, inputProof);
        euint32 internalAmountB = FHE.fromExternal(amountB, inputProof);
        
        // Verify sufficient balances
        require(FHE.decrypt(FHE.gte(balances[msg.sender][tokenA].balance, internalAmountA)), "Insufficient tokenA balance");
        require(FHE.decrypt(FHE.gte(balances[msg.sender][tokenB].balance, internalAmountB)), "Insufficient tokenB balance");
        
        // Update balances
        balances[msg.sender][tokenA].balance = FHE.sub(balances[msg.sender][tokenA].balance, internalAmountA);
        balances[msg.sender][tokenB].balance = FHE.sub(balances[msg.sender][tokenB].balance, internalAmountB);
        
        // Update trading pair
        bytes32 pairKey = keccak256(abi.encodePacked(tokenA, tokenB));
        TradingPair storage pair = tradingPairs[pairKey];
        
        if (!pair.isActive) {
            pair.fromToken = tokenA;
            pair.toToken = tokenB;
            pair.isActive = true;
        }
        
        pair.liquidity = FHE.add(pair.liquidity, internalAmountB);
        pair.lastUpdate = block.timestamp;
        
        // Calculate new price (simplified: amountB / amountA)
        pair.price = FHE.div(internalAmountB, internalAmountA);
        
        emit LiquidityAdded(tokenA, tokenB, 0); // Amount will be decrypted off-chain
    }
    
    function removeLiquidity(
        address tokenA,
        address tokenB,
        externalEuint32 liquidityAmount,
        bytes calldata inputProof
    ) public onlyAuthorizedToken(tokenA) onlyAuthorizedToken(tokenB) {
        bytes32 pairKey = keccak256(abi.encodePacked(tokenA, tokenB));
        TradingPair storage pair = tradingPairs[pairKey];
        require(pair.isActive, "Trading pair not active");
        
        euint32 internalLiquidityAmount = FHE.fromExternal(liquidityAmount, inputProof);
        require(FHE.decrypt(FHE.gte(pair.liquidity, internalLiquidityAmount)), "Insufficient liquidity");
        
        // Calculate proportional amounts to return
        euint32 totalLiquidity = pair.liquidity;
        euint32 amountA = FHE.mul(internalLiquidityAmount, FHE.div(pair.liquidity, totalLiquidity));
        euint32 amountB = FHE.mul(internalLiquidityAmount, FHE.div(pair.liquidity, totalLiquidity));
        
        // Update balances
        balances[msg.sender][tokenA].balance = FHE.add(balances[msg.sender][tokenA].balance, amountA);
        balances[msg.sender][tokenB].balance = FHE.add(balances[msg.sender][tokenB].balance, amountB);
        
        // Update liquidity
        pair.liquidity = FHE.sub(pair.liquidity, internalLiquidityAmount);
        
        emit LiquidityRemoved(tokenA, tokenB, 0); // Amount will be decrypted off-chain
    }
    
    function depositToken(
        address token,
        externalEuint32 amount,
        bytes calldata inputProof
    ) public onlyAuthorizedToken(token) {
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        
        // In a real implementation, this would transfer tokens from the user
        // For now, we'll just update the balance
        balances[msg.sender][token].balance = FHE.add(balances[msg.sender][token].balance, internalAmount);
    }
    
    function withdrawToken(
        address token,
        externalEuint32 amount,
        bytes calldata inputProof
    ) public onlyAuthorizedToken(token) {
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        
        require(FHE.decrypt(FHE.gte(balances[msg.sender][token].balance, internalAmount)), "Insufficient balance");
        
        balances[msg.sender][token].balance = FHE.sub(balances[msg.sender][token].balance, internalAmount);
        
        // In a real implementation, this would transfer tokens to the user
    }
    
    function authorizeToken(address token, bool isAuthorized) public onlyOwner {
        authorizedTokens[token] = isAuthorized;
        emit TokenAuthorized(token, isAuthorized);
    }
    
    function updatePlatformFee(externalEuint32 newFee, bytes calldata inputProof) public onlyOwner {
        euint32 internalNewFee = FHE.fromExternal(newFee, inputProof);
        platformFee = internalNewFee;
    }
    
    function getTradeInfo(uint256 tradeId) public view returns (
        address trader,
        address fromToken,
        address toToken,
        uint8 fromAmount,
        uint8 toAmount,
        uint8 price,
        bool isExecuted,
        bool isPrivate,
        uint256 timestamp,
        uint256 deadline
    ) {
        Trade storage trade = trades[tradeId];
        return (
            trade.trader,
            trade.fromToken,
            trade.toToken,
            0, // FHE.decrypt(trade.fromAmount) - will be decrypted off-chain
            0, // FHE.decrypt(trade.toAmount) - will be decrypted off-chain
            0, // FHE.decrypt(trade.price) - will be decrypted off-chain
            trade.isExecuted,
            trade.isPrivate,
            trade.timestamp,
            trade.deadline
        );
    }
    
    function getBalance(address user, address token) public view returns (uint8) {
        return 0; // FHE.decrypt(balances[user][token].balance) - will be decrypted off-chain
    }
    
    function getTraderReputation(address trader) public view returns (uint8) {
        return 0; // FHE.decrypt(traderReputation[trader]) - will be decrypted off-chain
    }
    
    function getTradingPairInfo(address tokenA, address tokenB) public view returns (
        uint8 liquidity,
        uint8 price,
        bool isActive,
        uint256 lastUpdate
    ) {
        bytes32 pairKey = keccak256(abi.encodePacked(tokenA, tokenB));
        TradingPair storage pair = tradingPairs[pairKey];
        return (
            0, // FHE.decrypt(pair.liquidity) - will be decrypted off-chain
            0, // FHE.decrypt(pair.price) - will be decrypted off-chain
            pair.isActive,
            pair.lastUpdate
        );
    }
}
