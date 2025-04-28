import { useEffect, useState } from 'react'
import { BrowserProvider } from 'ethers'
import { hasWeb3Provider } from '../utils/web3ErrorHandler'

export const useWeb3 = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && hasWeb3Provider()) {
      try {
        // Use the non-null assertion operator since we've checked for existence
        const web3Provider = new BrowserProvider(window.ethereum!)
        setProvider(web3Provider)
      } catch (err) {
        console.error('Error initializing Web3 provider:', err)
        setError('Failed to initialize Ethereum provider')
      }
    } else {
      setError('No Ethereum provider found')
    }
  }, [])

  return { provider, error }
}
