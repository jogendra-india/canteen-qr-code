import React, { useEffect, useState } from 'react';
import {
  HashRouter as Router,
  Route,
  Routes,
  NavLink,
  Navigate,
} from 'react-router-dom';
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
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for disabling Submit button

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
    if (isSubmitting) return; // Prevent multiple submissions
    if (matchedEmployee && selectedMeals.length > 0) {
      setIsSubmitting(true); // Disable Submit button

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
        setSelectedMeals([]); // Reset selection
        setShowScanner(true);
      } catch (error) {
        console.error('Error submitting transaction:', error);
        alert('Failed to submit transaction.');
      } finally {
        setIsSubmitting(false); // Enable Submit button
      }
    } else {
      alert('Please select at least one meal.');
    }
  };

  if (loading) {
    return <div className='loading'>Loading data...</div>;
  }

  const capitalizeName = (name) => {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Router>
      <div className='App'>
        <nav>
          <NavLink
            to='/'
            className={({ isActive }) =>
              isActive ? 'active-link' : 'inactive-link'
            }
          >
            Home
          </NavLink>
          {/* <NavLink
            to='/unpaid-transactions'
            className={({ isActive }) =>
              isActive ? 'active-link' : 'inactive-link'
            }
          >
            Unpaid Transactions
          </NavLink> */}
          <NavLink
            to='/all-transactions'
            className={({ isActive }) =>
              isActive ? 'active-link' : 'inactive-link'
            }
          >
            Transactions
          </NavLink>
        </nav>
        <Routes>
          <Route
            path='/'
            element={
              showScanner ? (
                <QrCodeScanner onScan={handleScanResult} />
              ) : matchedEmployee ? (
                <div className='centered-container-home'>
                  <h2>Welcome, {capitalizeName(matchedEmployee.name)}</h2>
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
                  <button
                    onClick={handleSubmit}
                    className='submit-button'
                    disabled={isSubmitting} // Disable button when submitting
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setMatchedEmployee(null);
                      setSelectedMeals([]); // Reset selection
                      setShowScanner(true); // Show the scanner again
                    }}
                    className='cancel-button'
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className='default-content'>
                  <h2>Welcome to the Home Page</h2>
                  <p>Please scan a QR code to begin.</p>
                </div>
              )
            }
          />
          <Route path='/unpaid-transactions' element={<UnpaidEmployees />} />
          <Route path='/all-transactions' element={<AllTransactions />} />
          {/* Fallback Route: Redirect to Home */}
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
