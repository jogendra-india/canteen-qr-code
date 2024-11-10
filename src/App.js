import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, NavLink } from 'react-router-dom';
import QrCodeScanner from './QrCodeScanner';
import apiCallHelper from './apiCallHelper';
import UnpaidEmployees from './UnpaidEmployees'; // Import the new component
import AllTransactions from './AllTransactions';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [showScanner, setShowScanner] = useState(true);
  const [matchedEmployee, setMatchedEmployee] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch all employees
  const fetchAllEmployees = async () => {
    setShowScanner(false); // Disable scanner until data is loaded
    try {
      const result = await apiCallHelper('/employees');
      console.log('result', result);
      setEmployees(result);
      setLoading(false); // Data has loaded
      setShowScanner(true); // Enable scanner once data is loaded
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Function to handle QR code scan result
  const handleScanResult = (scanResult) => {
    if (!employees.length) return; // Exit if employees data is not loaded
    const employee = employees.find((emp) => emp.staff_no === scanResult);
    if (employee) {
      setMatchedEmployee(employee);
      setShowScanner(false);
    }
  };

  // Function to handle meal selection
  const handleMealSelection = (meal) => {
    setSelectedMeals(
      (prevMeals) =>
        prevMeals.includes(meal)
          ? prevMeals.filter((m) => m !== meal) // Deselect if already selected
          : [...prevMeals, meal] // Add to selection
    );
  };

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // Function to submit selected meals
  const handleSubmit = async () => {
    if (matchedEmployee && selectedMeals.length > 0) {
      // Prepare the payload in the required format
      const payload = {
        staff_id: matchedEmployee.staff_no,
        breakfast: selectedMeals.includes('Breakfast'),
        tea: selectedMeals.includes('Tea'),
        lunch: selectedMeals.includes('Lunch'),
      };

      try {
        await apiCallHelper('/transactions', 'POST', payload);
        alert('Transaction successful!');
        setMatchedEmployee(null);
        setSelectedMeals([]);
        setShowScanner(true);
      } catch (error) {
        console.error('Error submitting transaction:', error);
        alert('Failed to submit transaction.');
      }
    } else {
      alert('Please select at least one meal.');
    }
  };

  if (loading) {
    return <div className='loading'>Loading data...</div>;
  }

  return (
    <Router>
      <div className='App'>
        <nav>
          <NavLink
            to='/'
            className={({ isActive }) => (isActive ? 'active-link' : 'inactive-link')}
          >
            Home
          </NavLink>
          <NavLink
            to='/unpaid-employees'
            className={({ isActive }) => (isActive ? 'active-link' : 'inactive-link')}
          >
            Unpaid Employees
          </NavLink>
          <NavLink
            to='/all-transactions'
            className={({ isActive }) => (isActive ? 'active-link' : 'inactive-link')}
          >
            All Transactions
          </NavLink>
        </nav>
        <Routes>
          <Route
            path='/'
            element={
              showScanner ? (
                <QrCodeScanner onScan={handleScanResult} />
              ) : matchedEmployee ? (
                <div className='centered-container'>
                  <h2>Welcome, {matchedEmployee.name}</h2>
                  <div className='meal-options'>
                    {['Breakfast', 'Tea', 'Lunch'].map((meal) => (
                      <div
                        key={meal}
                        className={`meal-card ${
                          selectedMeals.includes(meal) ? 'selected' : ''
                        }`}
                        onClick={() => handleMealSelection(meal)}
                      >
                        {meal}
                      </div>
                    ))}
                  </div>
                  <button onClick={handleSubmit} className='submit-button'>
                    Submit
                  </button>
                </div>
              ) : null
            }
          />
          <Route path='/unpaid-employees' element={<UnpaidEmployees />} />
          <Route path='/all-employees' element={<UnpaidEmployees />} />
          <Route path='/all-transactions' element={<AllTransactions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
