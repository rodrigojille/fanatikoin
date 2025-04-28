import dynamic from 'next/dynamic';

const Profile = dynamic(() => import('@/components/user/Profile'), { ssr: false });

export default Profile;
