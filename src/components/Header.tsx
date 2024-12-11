import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Driver } from '../types/driver';

export function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [driver, setDriver] = useState<Driver | null>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchDriverData = async () => {
      if (currentUser) {
        try {
          const driverDoc = await getDoc(doc(db, 'drivers', currentUser.uid));
          if (driverDoc.exists()) {
            setDriver({ id: driverDoc.id, ...driverDoc.data() } as Driver);
          }
        } catch (error) {
          console.error('Error fetching driver data:', error);
        }
      }
    };

    fetchDriverData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-black py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-4">
            <img 
              src="https://aiautomationsstorage.blob.core.windows.net/cbl/citybucketlist%20logo.png"
              alt="CityBucketList.com"
              className="h-8 object-contain"
            />
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white hover:text-[#C69249]"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/find-drivers" className="text-white hover:text-[#C69249]">
              Find Drivers
            </Link>
            
            {currentUser ? (
              <>
                <Link to="/driver/portal" className="text-white hover:text-[#C69249]">
                  Driver Portal
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-white hover:text-[#C69249]"
                  >
                    <div className="flex items-center space-x-2">
                      {driver?.photo ? (
                        <img
                          src={driver.photo}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 p-1 rounded-full border-2 border-[#C69249]" />
                      )}
                      <span>{driver?.name || 'Driver'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black border border-neutral-800 rounded-lg shadow-lg py-1">
                      <Link
                        to="/driver/portal"
                        className="block px-4 py-2 text-white hover:bg-[#C69249] hover:text-white"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-[#C69249] hover:text-white"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/driver/login"
                className="px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58238] transition-colors"
              >
                Driver Login
              </Link>
            )}
          </nav>
        </div>

        <nav
          className={`lg:hidden ${
            isMenuOpen ? 'flex' : 'hidden'
          } flex-col space-y-4 mt-4 border-t border-neutral-800 pt-4`}
        >
          <Link
            to="/find-drivers"
            className="text-white hover:text-[#C69249] text-center py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Find Drivers
          </Link>
          
          {currentUser ? (
            <>
              <div className="flex items-center justify-center space-x-2 py-2">
                {driver?.photo ? (
                  <img
                    src={driver.photo}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 p-1 rounded-full border-2 border-[#C69249]" />
                )}
                <span className="text-white">{driver?.name || 'Driver'}</span>
              </div>
              <Link
                to="/driver/portal"
                className="text-white hover:text-[#C69249] text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Driver Portal
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58238] transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/driver/login"
              className="w-full px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58238] transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Driver Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}