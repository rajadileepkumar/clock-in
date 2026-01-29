// store/index.ts or store.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import timeTrackingReducer from "./slices/timeTrackingSlice";
import usersReducer from "./slices/usersSlice"; // Import users reducer

const authPersistConfig = {
  key: "auth",
  storage,
};

const timeTrackingPersistConfig = {
  key: "timeTracking",
  storage,
};

const usersPersistConfig = {
  key: "users",
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedTimeTrackingReducer = persistReducer(
  timeTrackingPersistConfig,
  timeTrackingReducer
);
const persistedUsersReducer = persistReducer(usersPersistConfig, usersReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    timeTracking: persistedTimeTrackingReducer,
    users: persistedUsersReducer, // Add this line
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);