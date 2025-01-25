import React, { useEffect, useState, useRef } from 'react';
import {
  HashRouter as Router,
  Route,
  Routes,
  NavLink,
  Navigate,
} from 'react-router-dom';
import QrCodeScanner from './QrCodeScanner';
import apiCallHelper from './apiCallHelper';
import UnpaidEmployees from './UnpaidEmployees';
import AllTransactions from './AllTransactions';
import './App.css';

// 1) Import the Toast component
import Toast from './Toast';

function App() {
  const [employees, setEmployees] = useState([]);
  const [showScanner, setShowScanner] = useState(true);
  const [matchedEmployee, setMatchedEmployee] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Toast State ---
  const [toast, setToast] = useState({
    message: '',
    type: 'success', // or 'error', 'warning', etc.
    isVisible: false,
  });
  const toastTimerRef = useRef(null);

  // Show toast for 3 seconds or until user closes
  const showToast = (message, type = 'success', duration = 5000) => {
    // Clear any previous timeout
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ message, type, isVisible: true });

    if (duration > 0) {
      toastTimerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  // Hide toast immediately
  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Fetch all employees
  const fetchAllEmployees = async () => {
    setShowScanner(false); // Disable scanner until data is loaded
    try {
      const result = await apiCallHelper('/employees');
      console.log('result', result);
      setEmployees(result);
      setLoading(false);
      setShowScanner(true); // Enable scanner once data is loaded
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      showToast('Error loading employees', 'error');
    }
  };

  // Handle QR code scan
  const handleScanResult = (scanResult) => {
    if (!employees.length) return;
    const employee = employees.find((emp) => emp.staff_no === scanResult);
    if (employee) {
      setMatchedEmployee(employee);
      setShowScanner(false);
    }
  };

  // Meal selection toggle
  const handleMealSelection = (meal) => {
    setSelectedMeals((prevMeals) =>
      prevMeals.includes(meal)
        ? prevMeals.filter((m) => m !== meal)
        : [...prevMeals, meal]
    );
  };

  // Submit selected meals
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (matchedEmployee && selectedMeals.length > 0) {
      setIsSubmitting(true);

      const payload = {
        staff_id: matchedEmployee.staff_no,
        breakfast: selectedMeals.includes('Breakfast'),
        tea: selectedMeals.includes('Tea'),
        lunch: selectedMeals.includes('Lunch'),
      };

      try {
        await apiCallHelper('/transactions', 'POST', payload);
        showToast('Transaction successful!', 'success');
        setMatchedEmployee(null);
        setSelectedMeals([]);
        setShowScanner(true);
      } catch (error) {
        console.error('Error submitting transaction:', error);
        showToast('Failed to submit transaction.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      showToast('Please select at least one meal.', 'error');
    }
  };

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // Capitalize name
  const capitalizeName = (name) => {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return <div className='loading'>Loading data...</div>;
  }

  return (
    <Router>
      <div className='App'>
        {/* 2) Render Toast only if isVisible is true */}
        {toast.isVisible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}

        <nav>
          <NavLink
            to='/'
            className={({ isActive }) =>
              isActive ? 'active-link' : 'inactive-link'
            }
          >
            Home
          </NavLink>
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
                    disabled={isSubmitting}
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setMatchedEmployee(null);
                      setSelectedMeals([]);
                      setShowScanner(true);
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
