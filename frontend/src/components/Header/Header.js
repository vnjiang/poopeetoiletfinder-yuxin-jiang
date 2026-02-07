import React from 'react';
import {
  FaHome,
  FaUser,
  FaUserCog,
  FaSignInAlt,
  FaUserPlus,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { isAdminUser } from '../../utils/permissions';
import IconButton from './IconButton';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isAdminUser(user);

  return (
    <header
      className="
    fixed top-0 left-0
    w-full h-[50px]
    flex items-center justify-between
    px-3 sm:px-5
    bg-gradient-to-r from-[#1E40AF] to-[#6366F1]
    shadow-md
    z-[1000]
  "
    >
      <div className="flex items-center gap-1 min-w-0">
        <div className="flex items-center px-2">
          <span className="relative -top-[0.5px] text-white font-extrabold tracking-tight leading-none text-[18px] sm:text-[22px] drop-shadow-sm">
            PooPee
          </span>

        </div>

        <IconButton title="Home" onClick={() => navigate('/')}>
          <FaHome />
        </IconButton>

        {isAdmin && (
          <IconButton title="Admin" onClick={() => navigate('/admin')}>
            <FaUserCog />
          </IconButton>
        )}
      </div>

      {/* right */}
      <div className="flex items-center gap-1">
        {user ? (
          <IconButton title="User" onClick={() => navigate('/user')}>
            <FaUser />
          </IconButton>
        ) : (
          <>
            <IconButton title="Login" onClick={() => navigate('/login')}>
              <FaSignInAlt />
            </IconButton>
            <IconButton
              title="Register"
              onClick={() => navigate('/register')}
            >
              <FaUserPlus />
            </IconButton>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
