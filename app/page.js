"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import BookingsTable from "./components/BookingsTable";

const Home = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const refreshBookings = () => {
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <>
      <Navbar refreshBookings={refreshBookings} />
      <div className="container mx-auto p-4">
        <BookingsTable refreshTrigger={refreshTrigger} />
      </div>
    </>
  );
};

export default Home;
