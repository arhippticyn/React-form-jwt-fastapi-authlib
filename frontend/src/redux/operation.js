import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios' 

axios.defaults.baseURL = 'http://127.0.0.1:8000'

export const SetAuthHeaders = (token) => {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const clearAuthHeaders = () => {
    return axios.defaults.common.Authorization = ''
}

export const RegisterUser = createAsyncThunk('auth/RegisterUser', async (User, { rejectWithValue }) => {
    try {
        const response = await axios.post('/register', User)

        SetAuthHeaders(response.data.access_token)

        return await response.data
    } catch (error) {
        return rejectWithValue(error.message)
    }
})