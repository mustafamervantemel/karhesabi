import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calculator,
  Bot,
  Crown,
  User,
  LogOut,
  Menu,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Profil menüsünü dışarı tıklandığında kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const navItems = [
    { path: "/", icon: Calculator, label: "Kâr Hesapla" },
    { path: "/ai-chat", icon: Bot, label: "AI Asistan" },
    { path: "/premium", icon: Crown, label: "Premium" },
  ];

  if (currentUser && userProfile?.isPremium) {
    navItems.push({ path: "/panel", icon: User, label: "Panel" });
  }

  const apiKey = import.meta.env.VITE_TRENDYOL_API_KEY;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">KârHesap</span>
            </Link>
          </div>

          {/* Navigation Links */}
          {currentUser ? (
            <div className="flex items-center space-x-8">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-600 hover:text-orange-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Profile & Menu */}
              <div className="flex items-center space-x-4">
                {userProfile?.isPremium && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    PREMIUM
                  </span>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      {userProfile?.profilePicture ? (
                        <img
                          src={userProfile.profilePicture}
                          alt="Profil"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700 hidden sm:block font-medium">
                      {userProfile?.fullName || currentUser.email}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        showProfileMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {userProfile?.fullName || "Kullanıcı"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {currentUser.email}
                        </p>
                        {userProfile?.username && (
                          <p className="text-xs text-gray-400 mt-1">
                            @{userProfile.username}
                          </p>
                        )}
                      </div>

                      <Link
                        to="/profil"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profilim</span>
                      </Link>

                      <Link
                        to="/ayarlar"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Ayarlar</span>
                      </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/giris"
                className="text-gray-600 hover:text-orange-600 font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                to="/kayit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Üye Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
