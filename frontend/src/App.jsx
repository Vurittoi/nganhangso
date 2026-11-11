import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Transfer from "./pages/Transfer/Transfer";
import Transactions from "./pages/Transactions/Transactions";
import Admin from "./pages/Admin/Admin";
import Account from "./pages/Account/Account";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/transfer" element={<Transfer />} />

        <Route path="/transactions" element={<Transactions />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/account" element={<Account />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;