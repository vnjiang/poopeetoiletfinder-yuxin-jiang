import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './authContext'; // 获取用户信息
import './SharedToiletPage.css';
import Header from './Header';

const SharedToiletPage = () => {
  const { user } = useAuth(); // 从上下文中获取用户信息
  const [toilets, setToilets] = useState([]);
  const [editToilet, setEditToilet] = useState(null);
  const [newToilet, setNewToilet] = useState({
    toilet_name: '',
    toilet_description: '',
    eircode: '',
    price: '',
    toilet_paper_accessibility: false,
    contact_number: ''
  });

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:5007/routes/sharedToiletRoute/user/${user.uid}`)
        .then(response => setToilets(response.data))
        .catch(error => console.error('Error fetching toilets:', error));
    }
  }, [user]);
  

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5007/routes/sharedToiletRoute/${id}`, {
      params: { userId: user.uid } // 传递用户ID作为查询参数
    })
    .then(() => {
      setToilets(toilets.filter(toilet => toilet._id !== id));
    })
    .catch(error => console.error('Error deleting toilet:', error));
  };

  const handleEdit = (toilet) => {
    setEditToilet(toilet);
    setNewToilet({
      toilet_name: toilet.toilet_name,
      toilet_description: toilet.toilet_description,
      eircode: toilet.eircode,
      price: toilet.price,
      toilet_paper_accessibility: toilet.toilet_paper_accessibility,
      contact_number: toilet.contact_number
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5007/routes/sharedToiletRoute/${editToilet._id}`, {
      ...newToilet,
      userId: user.uid // 包含 userId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      setToilets(toilets.map(toilet => toilet._id === editToilet._id ? response.data : toilet));
      setEditToilet(null);
      setNewToilet({
        toilet_name: '',
        toilet_description: '',
        eircode: '',
        price: '',
        toilet_paper_accessibility: false,
        contact_number: ''
      });
    })
    .catch(error => console.error('Error updating toilet:', error.response ? error.response.data : error.message));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5007/routes/sharedToiletRoute', {
      ...newToilet,
      userId: user.uid // 包含 userId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      setToilets([...toilets, response.data]);
      setNewToilet({
        toilet_name: '',
        toilet_description: '',
        eircode: '',
        price: '',
        toilet_paper_accessibility: false,
        contact_number: ''
      });
    })
    .catch(error => console.error('Error adding toilet:', error.response ? error.response.data : error.message));
  };

  return (
    <div>
      <Header />
      <main className="main">
        <div className="shared-toilet-page">
        <h2>Only Open For Commercial Owners</h2>
          <h3>{editToilet ? 'Edit Your Toilet' : 'Share Your Toilet'}</h3>
          <form onSubmit={editToilet ? handleUpdate : handleAdd}>
            <input
              type="text"
              value={newToilet.toilet_name}
              onChange={(e) => setNewToilet({ ...newToilet, toilet_name: e.target.value })}
              placeholder="Toilet Name"
            />
            <input
              type="text"
              value={newToilet.toilet_description}
              onChange={(e) => setNewToilet({ ...newToilet, toilet_description: e.target.value })}
              placeholder="Description"
            />
            <input
              type="text"
              value={newToilet.eircode}
              onChange={(e) => setNewToilet({ ...newToilet, eircode: e.target.value })}
              placeholder="Eircode"
            />
            <input
              type="number"
              value={newToilet.price}
              onChange={(e) => setNewToilet({ ...newToilet, price: e.target.value })}
              placeholder="Price"
            />
            <input
              type="text"
              value={newToilet.contact_number}
              onChange={(e) => setNewToilet({ ...newToilet, contact_number: e.target.value })}
              placeholder="Contact Number"
            />
            <label>
              <input
                type="checkbox"
                checked={newToilet.toilet_paper_accessibility}
                onChange={(e) => setNewToilet({ ...newToilet, toilet_paper_accessibility: e.target.checked })}
              />
              Toilet Paper Accessibility
            </label>
            <button type="submit">{editToilet ? 'Update' : 'Submit'}</button>
          </form>

          <h3>My Shared Toilets - waiting for verification first</h3>
          <ul>
            {toilets.map(toilet => (
              <li key={toilet._id}>
                {toilet.toilet_name} -{toilet.toilet_description}- {toilet.eircode} - ${toilet.price} - {toilet.contact_number} - 
                {toilet.toilet_paper_accessibility ? 'Available' : 'Not Available'}
                <button onClick={() => handleEdit(toilet)}>Edit</button>
                <button onClick={() => handleDelete(toilet._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer></footer>
    </div>
  );
};

export default SharedToiletPage;
