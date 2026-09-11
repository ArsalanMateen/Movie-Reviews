import React from "react";
import { Routes, Route } from "react-router-dom";
import "./styles/main.css";
import styles from "./App.module.css";

import Sidebar from "./components/Sidebar";
import AddReview from "./components/AddReview";
import MoviesList from "./components/MoviesList";
import Movie from "./components/Movie";
import Login from "./components/Login";

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
          <Route path="/" element={<MoviesList />} />
          <Route path="/movies" element={<MoviesList />} />
          <Route
            path="/movies/:id/review"
            element={<AddReview user={user} />}
          />
          <Route path="/movies/:id" element={<Movie user={user} />} />
          <Route path="/login" element={<Login login={login} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
