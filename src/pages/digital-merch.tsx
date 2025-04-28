import React from 'react';
import DigitalMerchGallery from '@/components/merch/DigitalMerchGallery';

const DigitalMerchPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Digital Merchandise & NFTs</h1>
      <DigitalMerchGallery />
    </div>
  );
};

export default DigitalMerchPage;
