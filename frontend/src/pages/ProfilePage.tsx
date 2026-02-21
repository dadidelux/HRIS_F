import React, { useState, useEffect } from 'react';
import { User, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, Profile, ProfileUpdate, ChangePasswordRequest } from '../services/api';
import ProfileTab from '../components/profile/ProfileTab';
import SettingsTab from '../components/profile/SettingsTab';
import HelpCenterTab from '../components/profile/HelpCenterTab';

type TabType = 'profile' | 'settings' | 'help';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: ProfileUpdate) => {
    const updated = await apiService.updateMyProfile(data);
    setProfile(updated);
  };

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    await apiService.changePassword(data);
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'My Profile', icon: User },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'help' as TabType, label: 'Help Center', icon: HelpCircle },
  ];

  if (loading) {
    return (
      <div className="flex-1">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>
        <div className="p-8 flex items-center justify-center">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Failed to load profile'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8">
          <div className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'profile' && (
          <ProfileTab profile={profile} user={user} onUpdate={handleUpdateProfile} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab onChangePassword={handleChangePassword} />
        )}
        {activeTab === 'help' && <HelpCenterTab />}
      </div>
    </div>
  );
};

export default ProfilePage;
