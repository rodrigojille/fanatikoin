// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract FanStaking is Ownable, ReentrancyGuard, Pausable {
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    uint256 public rewardRate; // reward per second per staked token
    uint256 public totalStaked;
    
    struct StakeInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastUpdate;
    }
    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateChanged(uint256 newRate);
    event DebugClaimReward(address indexed user, uint256 reward, uint256 fee, uint256 userReward, uint256 blockTime, uint256 lastUpdate, uint256 timeDiff);

    constructor(address _stakingToken, address _rewardToken, uint256 _rewardRate) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
    }

    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
        emit RewardRateChanged(_rewardRate);
    }

    function stake(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be > 0");
        _updateReward(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakes[msg.sender].amount += amount;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0 && stakes[msg.sender].amount >= amount, "Invalid amount");
        _updateReward(msg.sender);
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        stakingToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    // All reward, fee, and transfer math is done in wei (18 decimals)
    function claimReward() external whenNotPaused nonReentrant {
        // Save pre-claim state for debug
        uint256 blockTime = block.timestamp;
        uint256 lastUpdate = stakes[msg.sender].lastUpdate;
        uint256 timeDiff = blockTime > lastUpdate ? blockTime - lastUpdate : 0;
        _updateReward(msg.sender);
        uint256 reward = stakes[msg.sender].rewardDebt;
        require(reward > 0, "No reward");
        stakes[msg.sender].rewardDebt = 0;
        uint256 fee = reward / 10;
        uint256 userReward = reward - fee;
        // Ensure total payout does not exceed reward (handle rounding)
        uint256 totalPayout = userReward + fee;
        if (totalPayout > reward) {
            // Adjust fee to ensure no overpayment
            fee = reward - userReward;
        } else if (totalPayout < reward) {
            // Adjust userReward to ensure full reward is paid out
            userReward = reward - fee;
        }
        // Debug: print addresses and values before transfers
        console.log("msg.sender", msg.sender);
        console.log("owner()", owner());
        console.log("userReward", userReward);
        console.log("fee", fee);
        console.log("rewardToken", address(rewardToken));
        if (fee > 0) {
            require(rewardToken.transfer(owner(), fee), "Transfer failed: fee");
        }
        require(rewardToken.transfer(msg.sender, userReward), "Transfer failed: userReward");
        emit RewardClaimed(msg.sender, userReward);
        emit DebugClaimReward(msg.sender, reward, fee, userReward, blockTime, lastUpdate, timeDiff);
    }

    // All reward calculations are in wei (18 decimals)
    function _updateReward(address user) internal {
        StakeInfo storage stakeInfo = stakes[user];
        if (stakeInfo.amount > 0) {
            uint256 timeDiff = block.timestamp - stakeInfo.lastUpdate;
            // Adjust reward calculation: rewardRate is per token per second, with 18 decimals
            uint256 pending = timeDiff * stakeInfo.amount * rewardRate / 1e36;
            stakeInfo.rewardDebt += pending;
        }
        stakeInfo.lastUpdate = block.timestamp;
    }

    // Emergency withdraw by owner
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner whenPaused nonReentrant {
        IERC20(token).transfer(msg.sender, amount);
    }
}
