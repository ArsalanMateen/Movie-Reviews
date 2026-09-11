import React from "react";
import { Routes, Route } from "react-router-dom";
import "./styles/main.css";
import styles from "./App.module.css";
import Sidebar from "./components/Sidebar";

function App() {
  const [user, setUser] = React.useState(null);

  async function login(user = null) {
    setUser(user);
  }

  async function logout() {
    setUser(null);
  }

  return (
    <div className={styles.app}>
      <Sidebar user={user} logout={logout} />
      <div className={styles.main}>
        <Routes>
          <Route path="/" element={<div>Movies Catalog</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
