"use client";
import React from "react";
import { store, persistor } from "../lib/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import Loader from "./Loader";
import useStripe from "../app/hooks/useStripe";
import CartSync from "./CartSync";

const Layout = ({ children }: { children: React.ReactNode }) => {
  useStripe();
  return (
    <Provider store={store}>
      <PersistGate
        loading={<Loader size={48} color="#DD4952" />}
        persistor={persistor}
      >
        <CartSync />
        {children}
      </PersistGate>
    </Provider>
  );
};

export default Layout;
