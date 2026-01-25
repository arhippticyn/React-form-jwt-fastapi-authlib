import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios' 

axios.defaults.baseURL = 'http://127.0.0.1:8000'

export const SetAuthHeaders = (token) => {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const clearAuthHeaders = () => {
    axios.defaults.common.Authorization = ''
}

export const RegisterUser = createAsyncThunk('auth/RegisterUser', async (User, { rejectWithValue }) => {
    try {
        const response = await axios.post('/register', User)


        return await response.data
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const Login = createAsyncThunk(
  'auth/Login',
  async (creditials, { rejectWithValue }) => {
    try {
      const data = new URLSearchParams();
      data.append('username', creditials.username);
      data.append('password', creditials.password);
      const response = await axios.post('/token', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      SetAuthHeaders(response.data.access_token);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const GetUser = createAsyncThunk('auth/GetUser', async (_, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token

        if (!token) return rejectWithValue('error')
        
        SetAuthHeaders(token)

        const response = await axios.get('/user')

        return response.data
    } catch (error) {
        return rejectWithValue(error.message)
    }
});