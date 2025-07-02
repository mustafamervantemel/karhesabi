import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  Building, 
  Globe, 
  FileText, 
  AtSign, 
  Edit, 
  Save, 
  X,
  Camera,
  Crown,
  Clock,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

function UserProfile() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    birthDate: '',
    gender: '',
    companyName: '',
    jobTitle: '',
    website: '',
    bio: ''
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/giris');
      return;
    }

    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        username: userProfile.username || '',
        birthDate: userProfile.birthDate || '',
        gender: userProfile.gender || '',
        companyName: userProfile.companyName || '',
        jobTitle: userProfile.jobTitle || '',
        website: userProfile.website || '',
        bio: userProfile.bio || ''
      });
    }
  }, [currentUser, userProfile, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(currentUser.uid, formData);
      toast.success('Profil başarıyla güncellendi!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      toast.error('Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: userProfile?.fullName || '',
      username: userProfile?.username || '',
      birthDate: userProfile?.birthDate || '',
      gender: userProfile?.gender || '',
      companyName: userProfile?.companyName || '',
      jobTitle: userProfile?.jobTitle || '',
      website: userProfile?.website || '',
      bio: userProfile?.bio || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 'male': return 'Erkek';
      case 'female': return 'Kadın';
      case 'other': return 'Diğer';
      default: return 'Belirtilmemiş';
    }
  };

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
                {userProfile.profilePicture ? (
                  <img 
                    src={userProfile.profilePicture} 
                    alt="Profil" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userProfile.fullName || 'Kullanıcı'}
                </h1>
                <p className="text-gray-600">@{userProfile.username}</p>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {userProfile.isPremium && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-1">
                  <Crown className="w-4 h-4" />
                  <span>PREMIUM</span>
                </span>
              )}
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Düzenle</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>İptal</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Hesap Türü: {userProfile.authProvider === 'google' ? 'Google' : 'E-posta'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Üyelik: {formatDate(userProfile.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-orange-500" />
              <span>Kişisel Bilgiler</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900">{userProfile.fullName || 'Belirtilmemiş'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı Adı
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900">@{userProfile.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doğum Tarihi
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(userProfile.birthDate)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cinsiyet
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="male">Erkek</option>
                    <option value="female">Kadın</option>
                    <option value="other">Diğer</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{getGenderText(userProfile.gender)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Building className="w-5 h-5 text-orange-500" />
              <span>Profesyonel Bilgiler</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket Adı
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900">{userProfile.companyName || 'Belirtilmemiş'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İş Ünvanı
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900">{userProfile.jobTitle || 'Belirtilmemiş'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Web Sitesi
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://www.example.com"
                  />
                ) : (
                  <p className="text-gray-900">
                    {userProfile.website ? (
                      <a 
                        href={userProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-500"
                      >
                        {userProfile.website}
                      </a>
                    ) : (
                      'Belirtilmemiş'
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <span>Hakkımda</span>
          </h2>
          
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="Kendiniz hakkında kısa bir açıklama..."
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">
              {userProfile.bio || 'Henüz bir açıklama eklenmemiş.'}
            </p>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Kullanım İstatistikleri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{userProfile.aiPromptCount || 0}</div>
              <div className="text-sm text-gray-600">AI Sohbet Kullanımı</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {userProfile.isPremium ? 'Aktif' : 'Ücretsiz'}
              </div>
              <div className="text-sm text-gray-600">Hesap Durumu</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatDate(userProfile.lastLoginAt)}
              </div>
              <div className="text-sm text-gray-600">Son Giriş</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
