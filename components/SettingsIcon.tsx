import React from 'react';
import { Cog8ToothIcon } from '../constants';

interface SettingsIconProps {
  onClick: () => void;
}

const SettingsIcon: React.FC<SettingsIconProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white"
      aria-label="Settings"
    >
      <Cog8ToothIcon className="w-6 h-6 text-neutral-400" />
    </button>
  );
};

export default SettingsIcon;
