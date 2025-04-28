import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { NETWORK_CONFIG } from '@/contracts/config';

// Set up the base HTTP link for The Graph API
// Note: Currently using a placeholder URL - need to replace with actual subgraph URL once deployed
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'https://api.thegraph.com/subgraphs/name/chiliz/spicy-tokens',
});

// Add authentication if needed (for private subgraphs)
const authLink = setContext((_, { headers }) => {
  // Currently no auth token needed for public subgraphs
  return {
    headers: {
      ...headers,
    }
  };
});

// Initialize Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// GraphQL queries for tokens
export const TOKENS_QUERY = gql`
  query GetTokens {
    tokens(first: 100) {
      id
      address
      name
      symbol
      totalSupply
      decimals
      createdAt
      creator
      priceHistory(first: 10, orderBy: timestamp, orderDirection: desc) {
        price
        timestamp
      }
      currentPrice
    }
  }
`;

export const TOKEN_DETAILS_QUERY = gql`
  query GetToken($address: String!) {
    token(id: $address) {
      id
      address
      name
      symbol
      totalSupply
      decimals
      createdAt
      creator
      transfers(first: 50, orderBy: timestamp, orderDirection: desc) {
        from
        to
        value
        timestamp
      }
      priceHistory(first: 20, orderBy: timestamp, orderDirection: desc) {
        price
        timestamp
      }
      currentPrice
    }
  }
`;

// GraphQL queries for marketplace activity
export const MARKETPLACE_LISTINGS_QUERY = gql`
  query GetMarketplaceListings($first: Int = 100, $skip: Int = 0) {
    marketplaceListings(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
      id
      tokenAddress
      tokenSymbol
      seller
      amount
      pricePerToken
      status
      createdAt
    }
  }
`;

// GraphQL queries for auctions
export const ACTIVE_AUCTIONS_QUERY = gql`
  query GetActiveAuctions {
    auctions(where: { status: "active" }, orderBy: endTime, orderDirection: asc) {
      id
      tokenAddress
      tokenSymbol
      creator
      startingPrice
      currentPrice
      highestBidder
      endTime
      startTime
      status
    }
  }
`;

export const AUCTION_DETAILS_QUERY = gql`
  query GetAuctionDetails($id: String!) {
    auction(id: $id) {
      id
      tokenAddress
      tokenSymbol
      creator
      startingPrice
      currentPrice
      highestBidder
      endTime
      startTime
      status
      bids(orderBy: amount, orderDirection: desc) {
        id
        bidder
        amount
        timestamp
      }
    }
  }
`;

// Query for user token balances
export const USER_TOKENS_QUERY = gql`
  query GetUserTokens($userAddress: String!) {
    userTokenBalances(where: { user: $userAddress }) {
      id
      user
      token {
        id
        address
        name
        symbol
        decimals
        currentPrice
      }
      balance
    }
  }
`;

// GraphQL queries for governance proposals
export const GOVERNANCE_PROPOSALS_QUERY = gql`
  query GetGovernanceProposals($tokenAddress: String!) {
    governanceProposals(where: { tokenAddress: $tokenAddress }, orderBy: createdAt, orderDirection: desc) {
      id
      tokenAddress
      creator
      title
      description
      startTime
      endTime
      status
      options {
        id
        text
        voteCount
      }
      totalVotes
    }
  }
`;

// Function to fetch tokens
export const fetchTokens = async () => {
  try {
    const { data } = await apolloClient.query({
      query: TOKENS_QUERY,
      fetchPolicy: 'network-only', // Skip cache to get fresh data
    });
    return data.tokens;
  } catch (error) {
    console.error('Error fetching tokens from The Graph:', error);
    throw error;
  }
};

// Function to fetch token details
export const fetchTokenDetails = async (address: string) => {
  try {
    const { data } = await apolloClient.query({
      query: TOKEN_DETAILS_QUERY,
      variables: { address },
      fetchPolicy: 'network-only',
    });
    return data.token;
  } catch (error) {
    console.error(`Error fetching token details for ${address}:`, error);
    throw error;
  }
};

// Function to fetch marketplace listings
export const fetchMarketplaceListings = async (first = 100, skip = 0) => {
  try {
    const { data } = await apolloClient.query({
      query: MARKETPLACE_LISTINGS_QUERY,
      variables: { first, skip },
      fetchPolicy: 'network-only',
    });
    return data.marketplaceListings;
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    throw error;
  }
};

// Function to fetch active auctions
export const fetchActiveAuctions = async () => {
  try {
    const { data } = await apolloClient.query({
      query: ACTIVE_AUCTIONS_QUERY,
      fetchPolicy: 'network-only',
    });
    return data.auctions;
  } catch (error) {
    console.error('Error fetching active auctions:', error);
    throw error;
  }
};

// Function to fetch auction details
export const fetchAuctionDetails = async (id: string) => {
  try {
    const { data } = await apolloClient.query({
      query: AUCTION_DETAILS_QUERY,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return data.auction;
  } catch (error) {
    console.error(`Error fetching auction details for ${id}:`, error);
    throw error;
  }
};

// Function to fetch user token balances
export const fetchUserTokens = async (userAddress: string) => {
  try {
    const { data } = await apolloClient.query({
      query: USER_TOKENS_QUERY,
      variables: { userAddress },
      fetchPolicy: 'network-only',
    });
    return data.userTokenBalances;
  } catch (error) {
    console.error(`Error fetching token balances for user ${userAddress}:`, error);
    throw error;
  }
};

// Function to fetch governance proposals
export const fetchGovernanceProposals = async (tokenAddress: string) => {
  try {
    const { data } = await apolloClient.query({
      query: GOVERNANCE_PROPOSALS_QUERY,
      variables: { tokenAddress },
      fetchPolicy: 'network-only',
    });
    return data.governanceProposals;
  } catch (error) {
    console.error(`Error fetching governance proposals for token ${tokenAddress}:`, error);
    throw error;
  }
};
