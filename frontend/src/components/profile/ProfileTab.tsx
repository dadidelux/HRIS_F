import React, { useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, X } from 'lucide-react';
import { Profile, ProfileUpdate } from '../../services/api';

interface ProfileTabProps {
  profile: Profile;
  user: any;
  onUpdate: (data: ProfileUpdate) => Promise<void>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdate>({
    bio: profile.bio || '',
    skills: profile.skills || [],
    phone: profile.phone || '',
    address: profile.address || '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills?.filter((skill) => skill !== skillToRemove) || [],
    });
  };

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* User Info (Read-only) */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user?.full_name}</h3>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail size={16} />
                {user?.email}
              </p>
              <p className="text-sm text-gray-500 mt-1 capitalize">Role: {user?.role}</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {profile.bio || 'No bio added yet.'}
            </p>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-2" />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1234567890"
              />
            ) : (
              <p className="text-gray-700">{profile.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="City, Country"
              />
            ) : (
              <p className="text-gray-700">{profile.address || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase size={16} className="inline mr-2" />
            Skills
          </label>
          {isEditing && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a skill and press Enter"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(formData.skills?.length || 0) > 0 ? (
              formData.skills?.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {skill}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    bio: profile.bio || '',
                    skills: profile.skills || [],
                    phone: profile.phone || '',
                    address: profile.address || '',
                  });
                  setError(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
