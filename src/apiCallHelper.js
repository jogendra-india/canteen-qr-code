import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const apiCallHelper = async (
  endpoint,
  method = 'GET',
  data = null,
  headers = {}
) => {
  const baseUrl = process.env.REACT_APP_SERVER_URL; // Load the server address from .env
  let url;
  if (endpoint.includes('?')) {
    url = `${baseUrl}${endpoint}`;
} else {
    url = `${baseUrl}${endpoint}/`;
  }

  try {
    const response = await axios({
      url,
      method,
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || 'Something went wrong!';
    toast.error(errorMessage); // Use toast directly without configure
    throw error;
  }
};

export default apiCallHelper;
