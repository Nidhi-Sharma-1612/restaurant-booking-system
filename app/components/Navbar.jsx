"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";

const Navbar = ({ refreshBookings }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        {/* Logo */}
        <h1 className="text-white text-lg md:text-xl font-extrabold tracking-wide mb-2 md:mb-0">
          Restaurant Booking
        </h1>

        {/* Button */}
        <button
          className="bg-white text-purple-600 font-medium px-4 py-2 md:px-6 md:py-2 rounded-lg shadow-lg hover:bg-purple-100 transition-all duration-200"
          onClick={openModal}
        >
          Book Now
        </button>

        {/* Booking Modal */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={closeModal}
          refreshBookings={refreshBookings}
        />
      </div>
    </nav>
  );
};

export default Navbar;
