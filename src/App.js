import React, { useEffect, useState, useRef } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  NavLink,
  Navigate,
} from "react-router-dom";
import QrCodeScanner from "./QrCodeScanner";
import ManualCameraExposure from "./QrCodeScannerWithManualControl";
import apiCallHelper from "./apiCallHelper";
import UnpaidEmployees from "./UnpaidEmployees";
import AllTransactions from "./AllTransactions";
import "./App.css";

// Import the Toast component
import Toast from "./Toast";

function App() {
  const [employees, setEmployees] = useState([]);
  const [showScanner, setShowScanner] = useState(true);
  const [matchedEmployee, setMatchedEmployee] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Toasts State: an array of toast objects ---
  // Each toast: { id, message, type }
  const [toasts, setToasts] = useState([]);

  // 1) Show a new toast
  const showToast = (message, type = "success", duration = 3000) => {
    // Generate a unique ID for this toast
    const id = Date.now() + Math.random();

    const newToast = {
      id,
      message,
      type,
    };

    // Add this toast to the array
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Automatically remove after `duration` ms, unless duration = 0 for persistent
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  // 2) Remove a toast (either after timeout or on "x" button click)
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Fetch all employees
  const fetchAllEmployees = async () => {
    setShowScanner(false); // Disable scanner until data is loaded
    try {
      const result = await apiCallHelper("/employees");
      console.log("result", result);
      setEmployees(result);
      setLoading(false);
      setShowScanner(true); // Enable scanner once data is loaded
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      showToast("Error loading employees", "error");
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
        breakfast: selectedMeals.includes("Breakfast"),
        tea: selectedMeals.includes("Tea"),
        lunch: selectedMeals.includes("Lunch"),
      };

      try {
        // Make POST
        const responseData = await apiCallHelper(
          "/transactions",
          "POST",
          payload
        );
        // Example response: see your sample, e.g. responseData.staff.name
        const empName = responseData?.staff?.name || "No Name";

        // Show success toast with employee's name
        showToast(`Transaction successful for ${empName}!`, "success");

        // Reset UI
        setMatchedEmployee(null);
        setSelectedMeals([]);
        setShowScanner(true);
      } catch (error) {
        console.error("Error submitting transaction:", error);
        showToast("Failed to submit transaction.", "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      showToast("Please select at least one meal.", "error");
    }
  };

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // Capitalize name
  const capitalizeName = (name) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return <div className="loading">Loading data...</div>;
  }

  return (
    <Router>
      <div className="App">
        {/* 3) Render ALL toasts: map over the toasts array */}
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} message={toast.message} type={toast.type} />
          ))}
        </div>

        <nav>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "active-link" : "inactive-link"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/all-transactions"
            className={({ isActive }) =>
              isActive ? "active-link" : "inactive-link"
            }
          >
            Transactions
          </NavLink>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              showScanner ? (
                <ManualCameraExposure onScan={handleScanResult} />
              ) : matchedEmployee ? (
                <div className="centered-container-home">
                  <h2>Welcome, {capitalizeName(matchedEmployee.name)}</h2>
                  <div className="meal-options">
                    {["Breakfast", "Tea", "Lunch"].map((meal) => (
                      <div
                        key={meal}
                        className={`meal-card ${
                          selectedMeals.includes(meal) ? "selected" : ""
                        }`}
                        onClick={() => handleMealSelection(meal)}
                      >
                        {meal}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="submit-button"
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
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="default-content">
                  <h2>Welcome to the Home Page</h2>
                  <p>Please scan a QR code to begin.</p>
                </div>
              )
            }
          />
          <Route path="/unpaid-transactions" element={<UnpaidEmployees />} />
          <Route path="/all-transactions" element={<AllTransactions />} />
          {/* Fallback Route: Redirect to Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
