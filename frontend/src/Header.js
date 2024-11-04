
import React from 'react';
import { FaHome, FaUser, FaUserCog, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';
import './Header.css';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header>
      <div className="left-part">
        <div className="logo">PooPee</div>
        <button onClick={() => navigate('/')} className="icon">
          <FaHome />
        </button>

        {/* Visible to admin only */}
        {user && (user.email === '735576596@qq.com' || user.email === 'jiangyuxin0326@gmail.com') ? (
          <button onClick={() => navigate('/admin')} className="icon">
            <FaUserCog />
          </button>
        ) : null}
      </div>


      <div className="right-part">

        {/* Show the user page if logged in; otherwise, display the login and register page */}
        {user ? (
          <button onClick={() => navigate('/user')} className="icon">
            <FaUser />
          </button>
        ) : (
          <>
            <button onClick={() => navigate('/login')} className="icon">
              <FaSignInAlt />
            </button>
            <button onClick={() => navigate('/register')} className="icon">
              <FaUserPlus />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
