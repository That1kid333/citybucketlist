import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown, Bell } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Driver } from '../types/driver';
import { Rider } from '../types/rider';
import { useAuth } from '../providers/AuthProvider';

export function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Driver | Rider | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [driverMenuOpen, setDriverMenuOpen] = useState(false);
  const [riderMenuOpen, setRiderMenuOpen] = useState(false);
  const { user, driver, rider } = useAuth();
  const userType = driver ? 'driver' : rider ? 'rider' : null;
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !userType) {
        setUserProfile(null);
        return;
      }

      try {
        const collection = userType === 'driver' ? 'drivers' : 'riders';
        const userDoc = await getDoc(doc(db, collection, user.uid));
        if (userDoc.exists()) {
          setUserProfile({ id: userDoc.id, ...userDoc.data() } as Driver | Rider);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserProfile(null);
      }
    };

    fetchUserData();
  }, [user, userType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
        setShowNotifications(false);
        setShowProfile(false);
        setDriverMenuOpen(false);
        setRiderMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsProfileMenuOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsProfileMenuOpen(false);
    }, 300); // 300ms delay before closing
    setHoverTimeout(timeout);
  };

  const handleDriverMouseEnter = () => {
    setDriverMenuOpen(true);
    setRiderMenuOpen(false);
  };

  const handleDriverMouseLeave = () => {
    const timeout = setTimeout(() => {
      setDriverMenuOpen(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleRiderMouseEnter = () => {
    setRiderMenuOpen(true);
    setDriverMenuOpen(false);
  };

  const handleRiderMouseLeave = () => {
    const timeout = setTimeout(() => {
      setRiderMenuOpen(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      setUserProfile(null);
      await signOut(auth);
      setIsProfileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  return (
    <header className="bg-black py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="https://aiautomationsstorage.blob.core.windows.net/cbl/citybucketlist%20logo.png"
              alt="CityBucketList.com"
              className="h-8 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" ref={menuRef}>
            {user ? (
              <>
                <Link to={`/${userType}/portal`} className="text-white hover:text-gray-300">
                  Dashboard
                </Link>
                <div 
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center text-white hover:text-gray-300"
                  >
                    <User className="w-5 h-5 mr-2" />
                    <span>{userProfile?.name || user.email}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to={`/${userType}/settings`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 hover:bg-gray-800 rounded-full"
                >
                  <Bell className="w-6 h-6" />
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-black border border-gray-700 rounded-lg shadow-lg p-4">
                      <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                      <div className="space-y-2">
                        {/* Add your notifications here */}
                        <p className="text-gray-400">No new notifications</p>
                      </div>
                    </div>
                  )}
                </button>
                <button
                  onClick={toggleProfile}
                  className="relative p-2 hover:bg-gray-800 rounded-full"
                >
                  <User className="w-6 h-6" />
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded-lg shadow-lg">
                      <div className="p-4">
                        <div className="font-semibold mb-2">{user?.name || 'Guest'}</div>
                        <div className="text-sm text-gray-400 mb-4">{user?.email}</div>
                        <hr className="border-gray-700 mb-4" />
                        <ul className="space-y-2">
                          <li>
                            <Link
                              to="/settings"
                              className="block px-4 py-2 hover:bg-gray-800 rounded"
                            >
                              Settings
                            </Link>
                          </li>
                          <li>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-800 rounded"
                            >
                              Sign Out
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div 
                  className="relative group"
                  onMouseEnter={handleDriverMouseEnter}
                  onMouseLeave={handleDriverMouseLeave}
                >
                  <button
                    onClick={() => setDriverMenuOpen(!driverMenuOpen)}
                    className="text-white hover:text-gray-300 flex items-center"
                  >
                    Drivers
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  {driverMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/driver/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDriverMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/driver/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDriverMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
                <div 
                  className="relative group"
                  onMouseEnter={handleRiderMouseEnter}
                  onMouseLeave={handleRiderMouseLeave}
                >
                  <button
                    onClick={() => setRiderMenuOpen(!riderMenuOpen)}
                    className="text-white hover:text-gray-300 flex items-center"
                  >
                    Riders
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  {riderMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/rider/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setRiderMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/rider/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setRiderMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 md:hidden">
            {user ? (
              <>
                <Link
                  to={`/${userType}/portal`}
                  className="block text-white py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to={`/${userType}/settings`}
                  className="block text-white py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-white py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-b border-gray-800 mb-2 pb-2">
                  <div className="text-gray-400 text-sm mb-1">Driver</div>
                  <Link
                    to="/driver/login"
                    className="block text-white py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Driver Login
                  </Link>
                  <Link
                    to="/driver/register"
                    className="block text-white py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Driver Sign Up
                  </Link>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Rider</div>
                  <Link
                    to="/rider/login"
                    className="block text-white py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Rider Login
                  </Link>
                  <Link
                    to="/rider/register"
                    className="block text-white py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Rider Sign Up
                  </Link>
                </div>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}