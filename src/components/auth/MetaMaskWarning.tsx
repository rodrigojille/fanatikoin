import React from 'react';

const MetaMaskWarning: React.FC = () => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
    <span className="font-bold">MetaMask Not Detected:</span> Please install the <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="underline">MetaMask extension</a> and refresh the page to use wallet features.
  </div>
);

export default MetaMaskWarning;
