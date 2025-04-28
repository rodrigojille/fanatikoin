import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import { useWeb3 } from '@/context/Web3Context';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface CreateTokenForm {
  name: string;
  symbol: string;
  description: string;
  benefits: string[];
  initialSupply: string;
  maxSupply: string;
  initialPrice: string;
}

const CreateToken = () => {
  const { t } = useTranslation('common');
  const { address, connect } = useWeb3();
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTokenForm>();

  const onSubmit = async (data: CreateTokenForm) => {
    if (!address) {
      await connect();
      return;
    }

    // TODO: Implement token creation logic
    console.log('Creating token:', { ...data, benefits });
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-indigo-100/20">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl shadow-lg ring-1 ring-gray-900/5"
          >
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
              {t('createToken.title')}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('createToken.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">This field is required</p>
                )}
              </div>

              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
                  {t('createToken.symbol')}
                </label>
                <input
                  type="text"
                  id="symbol"
                  {...register('symbol', { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.symbol && (
                  <p className="mt-1 text-sm text-red-600">This field is required</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  {t('createToken.description')}
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description', { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">This field is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('createToken.benefits')}
                </label>
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 text-sm text-gray-900">{benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder={t('createToken.addBenefit')}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="initialSupply" className="block text-sm font-medium text-gray-700">
                    {t('createToken.initialSupply')}
                  </label>
                  <input
                    type="number"
                    id="initialSupply"
                    {...register('initialSupply', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.initialSupply && (
                    <p className="mt-1 text-sm text-red-600">This field is required</p>
                  )}
                </div>

                <div>
                  <label htmlFor="maxSupply" className="block text-sm font-medium text-gray-700">
                    {t('createToken.maxSupply')}
                  </label>
                  <input
                    type="number"
                    id="maxSupply"
                    {...register('maxSupply', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.maxSupply && (
                    <p className="mt-1 text-sm text-red-600">This field is required</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="initialPrice" className="block text-sm font-medium text-gray-700">
                  {t('createToken.initialPrice')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="initialPrice"
                    step="0.01"
                    {...register('initialPrice', { required: true })}
                    className="block w-full rounded-md border-gray-300 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">CHZ</span>
                  </div>
                </div>
                {errors.initialPrice && (
                  <p className="mt-1 text-sm text-red-600">This field is required</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                {address ? t('createToken.create') : t('connect.connectWallet')}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default CreateToken;
