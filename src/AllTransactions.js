import React, { useEffect, useState } from 'react';
import apiCallHelper from './apiCallHelper';

const AllTransactions = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch all transactions
  const fetchAllTransactions = async () => {
    try {
      const result = await apiCallHelper('/transactions');
      setAllTransactions(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  if (loading) {
    return <div className='loading'>Loading all transactions...</div>;
  }

  // Helper function to format date in DD-MM-YYYY format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper function to format currency in Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className='centered-container'>
      <h2>All Transactions</h2>
      {allTransactions.length > 0 ? (
        <table className='transactions-table'>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Staff No</th>
              <th>Canteen Menu</th>
              <th>Total Cost</th>
              <th>Meals</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {allTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.date)}</td>
                <td>{transaction.staff.name}</td>
                <td>{transaction.staff.staff_no}</td>
                <td>{transaction.canteen_menu}</td>
                <td>{formatCurrency(transaction.total_cost)}</td>
                <td>
                  {[
                    transaction.breakfast && 'Breakfast',
                    transaction.lunch && 'Lunch',
                    transaction.tea && 'Tea',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </td>
                <td>{transaction.is_paid ? 'Paid' : 'Not Paid'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
};

export default AllTransactions;
