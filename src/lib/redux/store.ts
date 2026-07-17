import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import { cartSyncListener } from "./cartSyncListener";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    WebStorage,
} from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";

export const createPersistStorage = (): WebStorage => {
    const isServerAction = typeof window === "undefined";

    // We will create a dummy server
    if (isServerAction) {
        return {
            getItem() {
                return Promise.resolve(null);
            },
            setItem() {
                return Promise.resolve();
            },
            removeItem() {
                return Promise.resolve();
            },
        };
    }

    return createWebStorage("local");
};

const storage =
    typeof window !== "undefined"
        ? createWebStorage("local")
        : createPersistStorage();

const persistConfig = {
    key: "root",
    storage,
};

const persistedReducer = persistReducer(persistConfig, cartReducer);

export const makeStore = () => {
    return configureStore({
        reducer: {
            cart: persistedReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [
                        FLUSH,
                        REHYDRATE,
                        PAUSE,
                        PERSIST,
                        PURGE,
                        REGISTER,
                    ],
                },
            }).prepend(cartSyncListener.middleware),
    });
};

export const store = makeStore();
export const persistor = persistStore(store);

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
