import { createSlice } from "@reduxjs/toolkit"
import { RegisterUser } from "./operation"

const AuthInitialState = {
    user: {username: null, email: null},
    token: '',
    isRefreshing: false,
    isLogin: false
}

const AuthSlice = createSlice({
    name: 'auth',
    initialState: AuthInitialState,

    reducers: {
        setToken(state, action) {
            state.token = action.payload
            state.isLogin = true
        },
        LogOut(state) {
            state.user = {username: null, email: null}
            state.token = ''
            state.isLogin = false;
        }
    },

    extraReducers: (builder) => {
        builder
             .addCase(RegisterUser.pending, (state) => {
                state.isRefreshing = true
             })
             .addCase(RegisterUser.fulfilled, (state, action) => {
                state.isRefreshing = false
                state.user = action.payload
                state.isLogin = true;
             })
    }
})

export const {setToken, LogOut} = AuthSlice.actions

export const AuthReducer = AuthSlice.reducer