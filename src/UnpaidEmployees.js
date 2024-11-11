import React, { useEffect, useState } from 'react';
import apiCallHelper from './apiCallHelper';

const UnpaidEmployees = () => {
  const [unpaidTransactions, setUnpaidTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch unpaid transactions
  const fetchUnpaidTransactions = async () => {
    try {
      const result = await apiCallHelper('/transactions/?is_paid=false');
      setUnpaidTransactions(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching unpaid transactions:', error);
      setLoading(false);
    }
  };

  // Function to mark a transaction as paid
  const markAsPaid = async (transactionId) => {
    const confirm = window.confirm(
      'Are you sure you want to mark this transaction as paid?'
    );
    if (confirm) {
      try {
        await apiCallHelper(`/transactions/${transactionId}`, 'PATCH', {
          is_paid: true,
        });
        alert('Transaction marked as paid successfully!');
        // Refresh the list after marking as paid
        fetchUnpaidTransactions();
      } catch (error) {
        console.error('Error marking transaction as paid:', error);
        alert('Failed to mark transaction as paid.');
      }
    }
  };

  useEffect(() => {
    fetchUnpaidTransactions();
  }, []);

  if (loading) {
    return <div className='loading'>Loading unpaid transactions...</div>;
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
      <h2>Unpaid Transactions</h2>
      {unpaidTransactions.length > 0 ? (
        <div className='transactions-table-container'>
        <table className='transactions-table'>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name (Staff)</th>
              <th>Total Cost</th>
              <th>Meals</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {unpaidTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.date)}</td>
                <td>
                  {`${transaction.staff.name
                    .toLowerCase()
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')} (${transaction.staff.staff_no})`}
                </td>
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
                <td>
                  <button
                    onClick={() => markAsPaid(transaction.id)}
                    className='mark-as-paid-button'
                  >
                    Mark as Paid
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        <p>No unpaid transactions found.</p>
      )}
    </div>
  );
};

export default UnpaidEmployees;
