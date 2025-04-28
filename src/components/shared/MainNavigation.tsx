import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/context/AuthContext';
import { metamaskService } from '@/services/metamask';
import {
  HomeIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  WalletIcon,
  PlusCircleIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  FireIcon,
  ShieldCheckIcon,
  BeakerIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

/**
 * Main navigation component with role-based access control
 */
const MainNavigation: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const isConnected = typeof window !== 'undefined' && metamaskService.isConnected();
  
  // Define user roles
  const isAdmin = user?.role === 'admin' || user?.isAdmin;
  const isTeam = user?.role === 'team' || user?.isTeam;
  const isFan = !isAdmin && !isTeam;
  
  // Define navigation items with role-based visibility
  const navigationItems = [
    // Public pages
    { 
      name: t('navigation.home', 'Home'), 
      href: '/', 
      icon: <HomeIcon className="h-5 w-5" />,
      active: router.pathname === '/',
      visible: true
    },
    { 
      name: t('navigation.marketplace', 'Marketplace'), 
      href: '/marketplace', 
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
      active: router.pathname === '/marketplace',
      visible: true
    },
    { 
      name: t('navigation.auctions', 'Auctions'), 
      href: '/auctions', 
      icon: <TrophyIcon className="h-5 w-5" />,
      active: router.pathname === '/auctions',
      visible: true
    },
    // Auth links for unauthenticated users
    {
      name: t('navigation.login', 'Login'),
      href: '/login',
      icon: <UserIcon className="h-5 w-5" />,
      active: router.pathname === '/login',
      visible: !isAuthenticated
    },
    {
      name: t('navigation.register', 'Register'),
      href: '/register',
      icon: <UserIcon className="h-5 w-5" />,
      active: router.pathname === '/register',
      visible: !isAuthenticated
    },
    
    // Authenticated user pages
    { 
      name: t('navigation.myTokens', 'My Tokens'), 
      href: '/my-tokens', 
      icon: <WalletIcon className="h-5 w-5" />,
      active: router.pathname === '/my-tokens',
      visible: isAuthenticated || isConnected
    },
    { 
      name: t('navigation.staking', 'Staking'), 
      href: '/staking', 
      icon: <FireIcon className="h-5 w-5" />,
      active: router.pathname === '/staking',
      visible: (isTeam || isAdmin) && (isAuthenticated || isConnected)
    },
    
    // Team pages
    { 
      name: t('navigation.createToken', 'Create Token'), 
      href: '/create', 
      icon: <PlusCircleIcon className="h-5 w-5" />,
      active: router.pathname === '/create',
      visible: isTeam || isAdmin
    },
    { 
      name: t('navigation.team', 'Team Dashboard'), 
      href: '/team', 
      icon: <UserGroupIcon className="h-5 w-5" />,
      active: router.pathname === '/team',
      visible: isTeam || isAdmin
    },
    
    // Admin pages
    { 
      name: t('navigation.admin', 'Admin'), 
      href: '/admin', 
      icon: <CogIcon className="h-5 w-5" />,
      active: router.pathname === '/admin',
      visible: isAdmin
    },
    { 
      name: t('navigation.analytics', 'Analytics'), 
      href: '/analytics', 
      icon: <ChartBarIcon className="h-5 w-5" />,
      active: router.pathname === '/analytics',
      visible: isAdmin
    },
    
    // Testing pages (visible to admins only)
    { 
      name: t('navigation.metamaskTest', 'MetaMask Test'), 
      href: '/metamask-test', 
      icon: <BeakerIcon className="h-5 w-5" />,
      active: router.pathname === '/metamask-test',
      visible: isAdmin
    },
    { 
      name: t('navigation.contractTest', 'Contract Test'), 
      href: '/contract-test', 
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      active: router.pathname === '/contract-test',
      visible: isAdmin
    },
    
    // User profile
    { 
      name: t('navigation.profile', 'Profile'), 
      href: '/profile', 
      icon: <UserIcon className="h-5 w-5" />,
      active: router.pathname === '/profile',
      visible: isAuthenticated
    },
  ];
  
  // Filter navigation items based on visibility
  const visibleItems = navigationItems.filter(item => item.visible);
  
  if (loading) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-gray-400 text-sm animate-pulse">Loading...</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8 overflow-x-auto hide-scrollbar">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  item.active
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span className="inline-flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
