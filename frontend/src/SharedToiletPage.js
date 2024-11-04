
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './authContext';
import './SharedToiletPage.css';


//initialize form
const initSharedToiletForm = {
  toilet_name: '',
  toilet_description: '',
  eircode: '',
  price: '',
  toilet_paper_accessibility: false,
  contact_number: ''
};

const SharedToiletPage = () => {
  const { user } = useAuth();
  const [sharedToiletList, setSharedToiletList] = useState([]);
  const [editSharedToilet, setEditSharedToilet] = useState(null);
  const [sharedToiletFormData, setSharedToiletFormData] = useState(initSharedToiletForm);


  //fetch shared toilet data
  useEffect(() => {
    const fetchSharedToiletData = async () => {
      //make sure user login
      if (user) {
        try {
          //fetch shared toilet data by id
          const userSharedToiletDataRes = await axios.get(`/routes/sharedToiletRoute/user/${user.uid}`);
          setSharedToiletList(userSharedToiletDataRes.data);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchSharedToiletData();
  }, [user]);


  //submit button toilet action
  const addSharedToiletAction = async (e) => {
    e.preventDefault();
    try {
      //send request to post new shared toilet data
      const newSharedToiletRes = await axios.post('/routes/sharedToiletRoute', {
        ...sharedToiletFormData,
        createdAt: new Date(),
        userId: user.uid
      }
      );

      //add new shared toilet to sharedToiletList
      setSharedToiletList([...sharedToiletList, newSharedToiletRes.data]);
      setSharedToiletFormData(initSharedToiletForm);
    } catch (error) {
      console.error(error);
    }
  };


  //detele toilet button action
  const deleteSharedToiletAction = async (id) => {
    try {
      //delete by id
      await axios.delete(`/routes/sharedToiletRoute/${id}`);
      //remove toilet in frontend
      setSharedToiletList(sharedToiletList.filter(toilet => toilet._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  //edit button action
  const editSharedToiletAction = (toilet) => {
    setEditSharedToilet(toilet);
    setSharedToiletFormData({
      ...toilet,
    });

    //scroll screen to top automatically
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };


  //update button click action
  const updateSharedToiletAction = async (e) => {
    e.preventDefault();
    try {
      //send put request to update shared toilet data 
      const updatedSharedToiletDataRes = await axios.put(`/routes/sharedToiletRoute/${editSharedToilet._id}`, {
        ...sharedToiletFormData,
        createdAt: new Date(),
        userId: user.uid
      });

      //update shared toilet data in list
      setSharedToiletList(
        sharedToiletList.map(toilet => {
          if (toilet._id === editSharedToilet._id) {
            return updatedSharedToiletDataRes.data; 
          } else {
            return toilet; //
          }
        })
      );
      alert('Shared toilet updated successfully!');

      // reset form
      setEditSharedToilet(null);
      setSharedToiletFormData(initSharedToiletForm);
    } catch (error) {
      console.error(error);
    }
  };


  // function to update the form data for shared toilet fields
  const changeFormValue = (field, value) => {
    setSharedToiletFormData(sharedToiletFormData => ({ ...sharedToiletFormData, [field]: value }));
  };

  return (
    <div className="shared-toilet-page-container">
      <div className="shared-toilet-page-submit">
        <div className="shared-toilet-page-title">For Commercial Owner Only</div>

        {/*change the subtitle base on if it is updating information or sharing new information */}
        <div className="shared-toilet-page-subtitle">{editSharedToilet ? 'Edit Your Shared Toilet' : 'Share Your Toilet'}</div>

        <form onSubmit={editSharedToilet ? updateSharedToiletAction : addSharedToiletAction} className="shared-toilet-page-form">
          <input
            type="text"
            value={sharedToiletFormData.toilet_name}
            onChange={(e) => changeFormValue('toilet_name', e.target.value)}
            placeholder="Toilet Name"
            className="shared-toilet-page-input"
            maxLength="50"
            minLength="1"
          />
          <input
            type="text"
            value={sharedToiletFormData.toilet_description}
            onChange={(e) => changeFormValue('toilet_description', e.target.value)}
            placeholder="Toilet Description"
            className="shared-toilet-page-input"
            maxLength="500"
            minLength="1"
          />
          <input
            type="text"
            value={sharedToiletFormData.eircode}
            onChange={(e) => changeFormValue('eircode', e.target.value)}
            placeholder="Eircode (e.g. D02 X285)"
            className="shared-toilet-page-input"
          />
          <input
            type="number"
            value={sharedToiletFormData.price}
            onChange={(e) => changeFormValue('price', e.target.value)}
            placeholder="Set A Price"
            className="shared-toilet-page-input"
            max="20"
          />
          <input
            type="number"
            value={sharedToiletFormData.contact_number}
            onChange={(e) => changeFormValue('contact_number', e.target.value)}
            placeholder="Your Contact Number (e.g., 00353 123456789)"
            className="shared-toilet-page-input"
            maxLength="15"
          />
          <label className="shared-toilet-page-availability">
            <input
              type="checkbox"
              checked={sharedToiletFormData.toilet_paper_accessibility}
              onChange={(e) => changeFormValue('toilet_paper_accessibility', e.target.checked)}
              className="shared-toilet-page-checkbox"
            />
            Toilet Paper Availability
          </label>
          <button type="submit" className="shared-toilet-page-button">{editSharedToilet ? 'Update' : 'Submit'}</button>
        </form>
      </div>

      <div className="shared-toilet-page-update">
        <div className="shared-toilet-page-title">Waiting For Verification First</div>

         {/* display message if no toilets have been shared also ensure it is an array*/}
        {Array.isArray(sharedToiletList) && sharedToiletList.length === 0 ? (
          <div className="shared-toilet-page-empty">
            <p>Your Shared Toilets Will Show Here</p>
          </div>
        ) : (
          <ul>
            {sharedToiletList.map(toilet => (
              <li key={toilet._id} className="shared-toilet-page-item">
                <div><strong>Toilet Name:</strong> {toilet.toilet_name}</div>
                <div><strong>Description:</strong> {toilet.toilet_description}</div>
                <div><strong>Eircode:</strong> {toilet.eircode} </div>
                <div><strong>Price:</strong> €{toilet.price}</div>
                <div><strong>Contact Number: </strong>{toilet.contact_number}</div>
                <div><strong>Toilet Paper:</strong> {toilet.toilet_paper_accessibility ? 'Available' : 'Not Available'}</div>
                <div><strong>Status:</strong> {toilet.approved_by_admin ? 'Approved' : 'Pending Approval'}</div>
                <div className="shared-toilet-page-update-bottons" >
                  <button onClick={() => editSharedToiletAction(toilet)}>Edit</button>
                  <button onClick={() => deleteSharedToiletAction(toilet._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default SharedToiletPage;
