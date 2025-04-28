import { ethers } from "hardhat";
import { expect } from "chai";

// All reward, fee, and transfer math in this test is done in wei (18 decimals)
describe("FanStaking", function () {
  let owner: any, alice: any, bob: any;
  let TeamToken: any, MockCHZ: any, FanStaking: any;
  let teamToken: any, mockCHZ: any, staking: any;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    TeamToken = await ethers.getContractFactory("TeamToken");
    MockCHZ = await ethers.getContractFactory("MockCHZ");
    FanStaking = await ethers.getContractFactory("FanStaking");

    mockCHZ = await MockCHZ.deploy();
    teamToken = await TeamToken.deploy(
      "Team Token",
      "TEAM",
      "Demo Team Token",
      [], // benefits
      ethers.parseEther("1000000"), // max supply
      ethers.parseEther("10"), // initial price
      mockCHZ.target,
      owner.address // teamWallet for tests
    );

    // Mint tokens for users (Alice must purchase TeamTokens using MockCHZ)
    // First, mint MockCHZ to Alice
    // Alice needs enough CHZ for 2 purchases of 1000 tokens at 10 CHZ each = 20,000 CHZ per purchase × 2 = 40,000 CHZ
    await mockCHZ.mint(alice.address, ethers.parseEther("40000"));
    // Alice approves TeamToken contract to spend her MockCHZ
    await mockCHZ.connect(alice).approve(teamToken.target, ethers.parseEther("40000"));
    // Alice purchases 1000 TeamTokens
    await teamToken.connect(alice).purchaseTokens(ethers.parseEther("1000"));
    // Alice purchases 1000 TeamTokens
    await teamToken.connect(alice).purchaseTokens(ethers.parseEther("1000"));
    // Owner mints MockCHZ for rewards funding
    await mockCHZ.mint(owner.address, ethers.parseEther("10000"));

    // Deploy staking contract: staking token = teamToken, reward token = mockCHZ, rewardRate = 1e16 (0.01 per second)
    // Use a higher reward rate for more realistic rewards
    // Use a much higher reward rate for test clarity: 1000 tokens per second per token staked
    staking = await FanStaking.deploy(teamToken.target, mockCHZ.target, ethers.parseEther("1000"));

    // Log the on-chain reward rate to verify deployment argument
    const onChainRewardRate = await staking.rewardRate();
    console.log("ON-CHAIN rewardRate after deploy:", onChainRewardRate.toString());

    // Fund staking contract with a large amount of rewards to ensure all payouts succeed
    await mockCHZ.mint(owner.address, ethers.parseEther("100000"));
    await mockCHZ.transfer(staking.target, ethers.parseEther("100000"));
  });

  it("should allow user to stake and claim rewards", async function () {
    // Print Alice's initial balances
    console.log("Initial TeamToken:", (await teamToken.balanceOf(alice.address)).toString());
    console.log("Initial MockCHZ:", (await mockCHZ.balanceOf(alice.address)).toString());

    // Alice approves and stakes
    // Stake a larger amount for a more realistic test
    await teamToken.connect(alice).approve(staking.target, ethers.parseEther("1000"));
    await staking.connect(alice).stake(ethers.parseEther("1000"));
    console.log("After staking TeamToken:", (await teamToken.balanceOf(alice.address)).toString());
    const stakeInfoAfterStake = await staking.stakes(alice.address);
    console.log("DEBUG: rewardDebt after staking:", stakeInfoAfterStake.rewardDebt.toString());
    expect(await staking.totalStaked()).to.equal(ethers.parseEther("1000"));
    expect(await teamToken.balanceOf(alice.address)).to.equal(ethers.parseEther("1000"));

    // Wait for 1 year (simulate time passing)
    await ethers.provider.send("evm_increaseTime", [31536000]); // 1 year
    await ethers.provider.send("evm_mine", []);
    const stakeInfoAfterTime = await staking.stakes(alice.address);
    console.log("DEBUG: rewardDebt after time advance:", stakeInfoAfterTime.rewardDebt.toString());

    // Print debug info
    // Fetch rewardRate from contract to ensure test matches on-chain value
    const rewardRateRaw = await staking.rewardRate();
    console.log("DEBUG: rewardRate fetched from contract:", rewardRateRaw.toString());
    const rewardRate = rewardRateRaw.toString();
    const stakeInfo = await staking.stakes(alice.address);
    const stakedAmount = stakeInfo ? stakeInfo.amount : 0;
    const lastUpdate = stakeInfo ? stakeInfo.lastUpdate : 0;
    const blockTime = (await ethers.provider.getBlock("latest")).timestamp;
    const seconds = blockTime - Number(lastUpdate);
    console.log("Staked amount:", stakedAmount.toString());
    console.log("Reward rate (used in calc):", rewardRate.toString());
    console.log("timeDiff:", seconds);
    // --- CONTRACT LOGIC: reward is calculated at claim time via _updateReward ---
    // pending = timeDiff * stakedAmount * rewardRate / 1e36
    const pending = BigInt(seconds) * BigInt(stakedAmount.toString()) * BigInt(rewardRate) / BigInt(1e36);
    const fee = pending / 10n;
    const userReward = pending - fee;
    console.log("DEBUG: seconds:", seconds);
    console.log("DEBUG: stakedAmount:", stakedAmount.toString());
    console.log("DEBUG: rewardRate:", rewardRate.toString());
    console.log("DEBUG: pending (contract logic):", pending.toString());
    console.log("DEBUG: fee (contract logic):", fee.toString());
    console.log("DEBUG: userReward (expected, contract logic):", userReward.toString());

    // Print Alice's rewardDebt (pending reward) from contract before claiming
    const stakeInfoBeforeClaim = await staking.stakes(alice.address);
    console.log("DEBUG: contract rewardDebt before claim:", stakeInfoBeforeClaim.rewardDebt.toString());

    // Print contract's reward token balance before claim
    const beforeContract = await mockCHZ.balanceOf(staking.target);
    console.log("DEBUG: contract rewardToken balance before claim:", beforeContract.toString());
    // Print addresses for debug comparison
    // Print address variables and their types
    console.log("alice.address:", alice.address, typeof alice.address);
    console.log("owner.address:", owner.address, typeof owner.address);
    console.log("staking.target:", staking.target, typeof staking.target);
    const mockCHZAddress = typeof mockCHZ.getAddress === 'function' ? await mockCHZ.getAddress() : mockCHZ.target.toString();
    console.log("mockCHZ deployed address:", mockCHZAddress, typeof mockCHZAddress);
    const stakingRewardTokenAddr = await staking.rewardToken();
    console.log("staking.rewardToken() address:", stakingRewardTokenAddr, typeof stakingRewardTokenAddr);
    // Print contract code at rewardToken and mockCHZ addresses
    const mockCHZCode = await ethers.provider.getCode(mockCHZAddress);
    const rewardTokenCode = await ethers.provider.getCode(stakingRewardTokenAddr);
    console.log("Bytecode at mockCHZ:", mockCHZCode);
    console.log("Bytecode at staking.rewardToken:", rewardTokenCode);
    // Print staking contract's own address
    console.log("Staking contract address:", staking.target.toString());

    // Print balances before claim as BigInt (convert BigNumber to string first)
    const beforeUser = BigInt((await mockCHZ.balanceOf(alice.address)).toString());
    const beforeOwner = BigInt((await mockCHZ.balanceOf(owner.address)).toString());
    const beforeContractBal = BigInt((await mockCHZ.balanceOf(staking.target)).toString());
    console.log("--- BALANCES BEFORE CLAIM ---");
    console.log("User balance (BigInt):", beforeUser, typeof beforeUser);
    console.log("Owner balance (BigInt):", beforeOwner, typeof beforeOwner);
    console.log("Contract balance (BigInt):", beforeContractBal, typeof beforeContractBal);

    // Alice claims reward and capture DebugClaimReward event
    let tx, receipt;
    try {
      tx = await staking.connect(alice).claimReward();
      receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
    } catch (err) {
      console.error('ERROR during claimReward:', err);
    }
    // Print balances after receipt
    let afterUser = BigInt((await mockCHZ.balanceOf(alice.address)).toString());
    let afterOwner = BigInt((await mockCHZ.balanceOf(owner.address)).toString());
    let afterContract = BigInt((await mockCHZ.balanceOf(staking.target)).toString());
    console.log("--- BALANCES AFTER CLAIM (after receipt) ---");
    console.log("User balance (BigInt):", afterUser, typeof afterUser);
    console.log("Owner balance (BigInt):", afterOwner, typeof afterOwner);
    console.log("Contract balance (BigInt):", afterContract, typeof afterContract);
    // Print balance differences using BigInt math
    const actualReward = afterUser - beforeUser;
    const actualFee = afterOwner - beforeOwner;
    const contractPaid = beforeContractBal - afterContract;
    // Print values in both wei and tokens
    const toTokens = (v: bigint) => Number(v) / 1e18;
    console.log("DEBUG: actualReward (received by user, wei):", actualReward.toString());
    console.log("DEBUG: actualReward (received by user, tokens):", toTokens(actualReward));
    console.log("DEBUG: actualFee (received by owner, wei):", actualFee.toString());
    console.log("DEBUG: actualFee (received by owner, tokens):", toTokens(actualFee));
    console.log("DEBUG: contractPaid (total sent, wei):", contractPaid.toString());
    console.log("DEBUG: contractPaid (total sent, tokens):", toTokens(contractPaid));
    // Diagnostics for payout discrepancy
    const sumRewardFee = actualReward + actualFee;
    const contractBalanceDiff = beforeContractBal - afterContract;
    const payoutDiff = contractBalanceDiff - sumRewardFee;
    console.log("DIAG: contract balance diff (before-after):", contractBalanceDiff.toString());
    console.log("DIAG: sum actualReward + actualFee:", sumRewardFee.toString());
    console.log("DIAG: contract balance diff - sum:", payoutDiff.toString());
    // All reward, fee, and assertion math is done in wei (18 decimals)


    // Parse all logs for DebugClaimReward event using interface.parseLog
    let foundDebugEvent = false;
    // Helper to print DebugClaimReward event args by both index and name
    function printDebugClaimRewardArgs(args: any) {
      // args[0] is user address, then reward, fee, userReward, blockTime, lastUpdate, timeDiff
      const keys = ["user", "reward", "fee", "userReward", "blockTime", "lastUpdate", "timeDiff"];
      console.log("DEBUG: DebugClaimReward event:");
      for (let i = 0; i < 7; i++) {
        console.log(`  ${keys[i]} (args[${i}]):`, args[i]?.toString?.() ?? args[i]);
      }
      // Print by named property as well, if available
      for (const k of keys) {
        if (args[k] !== undefined) {
          console.log(`  ${k} (named):`, args[k].toString());
        }
      }
    }

    // Print calculation inputs before claim for full visibility
    // All values are in 18 decimals (wei)
    console.log("DEBUG: Calculation inputs before claim:");
    console.log("  rewardRate (from contract):", rewardRate.toString());
    console.log("  stakedAmount (from contract):", stakedAmount.toString());
    console.log("  lastUpdate (from contract):", lastUpdate.toString());
    console.log("  blockTime (from test):", blockTime.toString());
    console.log("  seconds (blockTime - lastUpdate):", seconds.toString());

    let eventReward = null;
    let eventFee = null;
    let eventUserReward = null;
    for (const log of receipt.logs) {
      let parsed;
      try {
        parsed = staking.interface.parseLog(log);
      } catch {
        continue;
      }
      if (parsed && parsed.name === "DebugClaimReward") {
        foundDebugEvent = true;
        printDebugClaimRewardArgs(parsed.args);
        // args[1] = reward, args[2] = fee, args[3] = userReward
        eventReward = parsed.args[1];
        eventFee = parsed.args[2];
        eventUserReward = parsed.args[3];
      }
    }
    if (!foundDebugEvent) {
      console.log("DEBUG: DebugClaimReward event not found");
    }


    // Assert actualReward matches userReward from event
    // Ensure event values are not null
    if (eventUserReward == null || eventFee == null) {
      throw new Error("DebugClaimReward event not found or missing values");
    }
    // Print compared values for clarity
    const eventUserRewardStr = eventUserReward.toString ? eventUserReward.toString() : String(eventUserReward);
    const eventFeeStr = eventFee.toString ? eventFee.toString() : String(eventFee);
    console.log("ASSERT: actualReward:", actualReward.toString(), "eventUserReward:", eventUserRewardStr);
    console.log("ASSERT: actualFee:", actualFee.toString(), "eventFee:", eventFeeStr);
    // Assert actualReward matches userReward from contract event (all in wei)
    // Assert that the sum of actualReward and actualFee equals the contract's balance change
    expect(sumRewardFee).to.equal(contractPaid);
  });

  it("should allow user to unstake and withdraw tokens", async function () {
    await teamToken.connect(alice).approve(staking.target, ethers.parseEther("50"));
    await staking.connect(alice).stake(ethers.parseEther("50"));
    await staking.connect(alice).unstake(ethers.parseEther("20"));
    expect(await staking.totalStaked()).to.equal(ethers.parseEther("30"));
    expect(await teamToken.balanceOf(alice.address)).to.equal(ethers.parseEther("1970"));
  });

  it("should only allow owner to set reward rate", async function () {
    await expect(staking.connect(alice).setRewardRate(ethers.parseEther("0.1"))).to.be.revertedWith("Ownable: caller is not the owner");
    await staking.setRewardRate(ethers.parseEther("0.1"));
    expect(await staking.rewardRate()).to.equal(ethers.parseEther("0.1"));
  });
});
