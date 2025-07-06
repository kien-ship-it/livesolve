import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Icon from '../ui/Icon';
import { useAuth } from '../../contexts/AuthContext';
import Dropdown from '../ui/Dropdown';

const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // You might want to redirect the user to the login page here
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  const initials = currentUser.email ? currentUser.email.substring(0, 2).toUpperCase() : '..';

  const dropdownItems = [
    { label: 'Profile', onClick: () => alert('Profile page coming soon!') },
    { label: 'Logout', onClick: handleLogout },
  ];
  
  const trigger = (
    <div className="flex items-center space-x-2 px-4 py-3 cursor-pointer bg-blue-500 hover:bg-blue-600 transition">
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-base text-blue-600">
        {initials}
      </div>
      <div className="font-medium text-sm text-white">{currentUser.email}</div>
      <Icon iconName="ChevronDown" size={16} className="text-white" />
    </div>
  )

  return <Dropdown trigger={trigger} items={dropdownItems} align="right" />;
};

export default UserProfile; 