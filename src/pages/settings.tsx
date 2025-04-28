import dynamic from 'next/dynamic';

const Settings = dynamic(() => import('@/components/user/Settings'), { ssr: false });

export default Settings;
