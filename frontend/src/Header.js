// Header.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { FaHome, FaUser, FaUserCog, FaSignInAlt, FaUserPlus, FaAngleLeft  } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { user } = useAuth(); // 从 context 中获取用户信息
  const navigate = useNavigate(); // 用于页面跳转
  const location = useLocation(); 

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <header>
      <div className="left-section">
        <div className="app-name">PooPee</div>
        <button onClick={() => navigate('/')} className="header-icon-button">
          <FaHome />
        </button>
        {user && (
          <button onClick={() => navigate('/admin')} className="header-icon-button">
            <FaUserCog />
          </button>
        )}
      </div>
      <div className="right-icons">
        {user ? (
          <button onClick={() => navigate('/user')} className="header-icon-button">
            <FaUser />
          </button>
        ) : (
          <>
            <button onClick={() => navigate('/login')} className="header-icon-button">
              <FaSignInAlt />
            </button>
            <button onClick={() => navigate('/register')} className="header-icon-button">
              <FaUserPlus />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
