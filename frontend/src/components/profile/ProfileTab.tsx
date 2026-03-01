import React, { useState, useRef } from 'react';
import { Mail, Phone, MapPin, Briefcase, X, CheckCircle, Pencil, Camera } from 'lucide-react';
import { Profile, ProfileUpdate, apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileTabProps {
  profile: Profile;
  user: any;
  onUpdate: (data: ProfileUpdate) => Promise<void>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, user, onUpdate }) => {
  const { refreshUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // Form fields (profile + user)
  const [fullName, setFullName] = useState('');
  const [formData, setFormData] = useState<ProfileUpdate>({});
  const [newSkill, setNewSkill] = useState('');

  // Avatar preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cache-busted avatar URL so it refreshes after upload
  const [avatarKey, setAvatarKey] = useState(0);

  const openModal = () => {
    setFullName(user?.full_name || '');
    setFormData({
      bio: profile.bio || '',
      skills: profile.skills || [],
      phone: profile.phone || '',
      address: profile.address || '',
    });
    setNewSkill('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update full_name if changed
      if (fullName.trim() !== (user?.full_name || '')) {
        await apiService.updateCurrentUser({ full_name: fullName.trim() });
      }

      // Upload avatar if selected
      if (avatarFile) {
        await apiService.uploadAvatar(avatarFile);
        setAvatarKey((k) => k + 1); // bust cache
      }

      // Update profile fields
      await onUpdate(formData);

      // Refresh user in AuthContext so navbar/sidebar updates
      await refreshUser();

      setModalOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !formData.skills?.includes(trimmed)) {
      setFormData({ ...formData, skills: [...(formData.skills || []), trimmed] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills?.filter((s) => s !== skill) || [] });
  };

  // Determine which avatar to show in view mode
  const avatarSrc = user?.id
    ? `${apiService.getAvatarUrl(user.id)}?v=${avatarKey}`
    : null;

  return (
    <div>
      {/* Success banner */}
      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={16} />
          Profile saved successfully!
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <AvatarImage src={avatarSrc} name={user?.full_name} size={20} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user?.full_name}</h3>
              <p className="text-gray-600 flex items-center gap-1 mt-1">
                <Mail size={14} />
                {user?.email}
              </p>
              <p className="text-sm text-gray-500 mt-1 capitalize">Role: {user?.role}</p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Pencil size={15} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Read-only info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Phone size={12} /> Phone
          </p>
          <p className="text-gray-800">{profile.phone || <span className="text-gray-400 italic">Not provided</span>}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <MapPin size={12} /> Address
          </p>
          <p className="text-gray-800">{profile.address || <span className="text-gray-400 italic">Not provided</span>}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Bio</p>
        <p className="text-gray-800 whitespace-pre-wrap">{profile.bio || <span className="text-gray-400 italic">No bio added yet.</span>}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
          <Briefcase size={12} /> Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {profile.skills?.length ? (
            profile.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-400 italic text-sm">No skills added yet.</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Avatar picker */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <AvatarImage src={avatarSrc} name={user?.full_name} size={20} />
                    )}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                      title="Change photo"
                    >
                      <Camera size={13} className="text-white" />
                    </button>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                    <p className="text-xs text-gray-400">JPEG, PNG or WebP · max 5 MB</p>
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Your full name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Phone & Address */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Type a skill and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[2rem]">
                    {formData.skills?.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-blue-900">
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable avatar component: shows uploaded image or fallback initial circle
const AvatarImage: React.FC<{ src: string | null; name?: string; size: number }> = ({ src, name, size }) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state when URL changes (e.g. after new avatar upload)
  React.useEffect(() => { setImgError(false); }, [src]);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setImgError(true)}
        className="rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
        style={{ width: size * 4, height: size * 4 }}
      />
    );
  }

  return (
    <div
      className="bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{ width: size * 4, height: size * 4, fontSize: size * 1.2 }}
    >
      {name?.charAt(0).toUpperCase() || 'U'}
    </div>
  );
};

export default ProfileTab;
