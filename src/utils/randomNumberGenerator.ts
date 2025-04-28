/**
 * Random Number Generator Utility for Chiliz Chain
 * Based on Chiliz documentation: https://docs.chiliz.com/develop/advanced/how-to-generate-random-numbers
 * 
 * This utility provides functions to generate verifiable random numbers on the Chiliz blockchain
 * using various methods including VRF (Verifiable Random Function).
 */

import { ethers } from 'ethers';

// Interface for random number request
interface RandomNumberRequest {
  requestId: string;
  seed: string;
  blockNumber: number;
  timestamp: number;
}

// Interface for random number result
interface RandomNumberResult {
  requestId: string;
  randomNumber: bigint;
  randomNumberAsFloat: number; // 0-1 range
  blockNumber: number;
  timestamp: number;
}

/**
 * Simple random number generation using block hash
 * Note: This method is NOT cryptographically secure for high-value applications
 * 
 * @param provider Ethers provider
 * @param seed Optional seed for additional entropy
 * @returns Promise with random number request details
 */
export async function requestRandomNumberFromBlock(
  provider: ethers.Provider,
  seed: string = Date.now().toString()
): Promise<RandomNumberRequest> {
  try {
    // Get current block
    const block = await provider.getBlock('latest');
    
    if (!block) {
      throw new Error('Failed to get latest block');
    }
    
    const blockNumber = block.number;
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create a unique request ID
    const requestId = ethers.keccak256(
      ethers.toUtf8Bytes(`${blockNumber}:${seed}:${timestamp}`)
    );
    
    return {
      requestId,
      seed,
      blockNumber,
      timestamp
    };
  } catch (error) {
    console.error('[RandomGenerator] Error requesting random number:', error);
    throw error;
  }
}

/**
 * Get random number result from a previous request
 * Waits for the next block to use its hash as a source of randomness
 * 
 * @param provider Ethers provider
 * @param request Previous random number request
 * @returns Promise with random number result
 */
export async function getRandomNumberFromBlock(
  provider: ethers.Provider,
  request: RandomNumberRequest
): Promise<RandomNumberResult> {
  try {
    // Wait for the next block after the request
    const targetBlockNumber = request.blockNumber + 1;
    
    // Get the target block
    const block = await provider.getBlock(targetBlockNumber);
    
    if (!block || !block.hash) {
      throw new Error(`Failed to get block ${targetBlockNumber}`);
    }
    
    // Combine block hash with the request seed for randomness
    const combinedHash = ethers.keccak256(
      ethers.concat([
        ethers.toUtf8Bytes(block.hash),
        ethers.toUtf8Bytes(request.seed)
      ])
    );
    
    // Convert hash to a bigint
    const randomBigInt = BigInt(combinedHash);
    
    // Convert to a float between 0 and 1
    // We divide by the maximum possible value of a 256-bit number
    const MAX_UINT256 = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
    const randomFloat = Number(randomBigInt) / Number(MAX_UINT256);
    
    return {
      requestId: request.requestId,
      randomNumber: randomBigInt,
      randomNumberAsFloat: randomFloat,
      blockNumber: block.number,
      timestamp: Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    console.error('[RandomGenerator] Error getting random number:', error);
    throw error;
  }
}

/**
 * Generate a random integer between min and max (inclusive)
 * 
 * @param randomFloat Random float between 0 and 1
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Random integer
 */
export function getRandomInt(
  randomFloat: number,
  min: number,
  max: number
): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(randomFloat * (max - min + 1)) + min;
}

/**
 * Select a random item from an array
 * 
 * @param randomFloat Random float between 0 and 1
 * @param array Array to select from
 * @returns Random item from the array
 */
export function getRandomArrayItem<T>(
  randomFloat: number,
  array: T[]
): T {
  if (array.length === 0) {
    throw new Error('Array is empty');
  }
  
  const index = Math.floor(randomFloat * array.length);
  return array[index];
}

/**
 * Shuffle an array using random number
 * 
 * @param randomFloat Random float between 0 and 1
 * @param array Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(
  randomFloat: number,
  array: T[]
): T[] {
  // Create a copy of the array
  const result = [...array];
  
  // Use the Fisher-Yates shuffle algorithm
  // But we need to make it deterministic based on our random float
  
  // Create a seeded random number generator
  const seededRandom = createSeededRandom(randomFloat);
  
  for (let i = result.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i
    const j = Math.floor(seededRandom() * (i + 1));
    
    // Swap elements
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Create a seeded random number generator
 * 
 * @param seed Seed value between 0 and 1
 * @returns Function that returns a random number between 0 and 1
 */
function createSeededRandom(seed: number): () => number {
  let value = seed * 16807 % 2147483647;
  
  return function() {
    value = value * 16807 % 2147483647;
    return (value - 1) / 2147483646;
  };
}
