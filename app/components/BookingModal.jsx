"use client";

import { useState, useEffect } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaUsers,
} from "react-icons/fa";
import dayjs from "dayjs";
import SuccessModal from "./SuccessModal";

const BookingModal = ({ isOpen, onClose, refreshBookings, bookingData }) => {
  const initialFormState = {
    time: "",
    guests: 1,
    name: "",
    contact: "",
    date: new Date().toISOString().split("T")[0], // Default to today's date
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);

  const resetForm = () => {
    setFormData(initialFormState);
    setFormErrors({});
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return /^[a-zA-Z\s]+$/.test(value)
          ? ""
          : "Name must contain only alphabets and spaces.";
      case "contact":
        return /^\d{10}$/.test(value)
          ? ""
          : "Contact must be a 10-digit number.";
      case "guests":
        return value > 0 ? "" : "Guests must be a positive number.";
      default:
        return "";
    }
  };

  const handleValidation = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/bookings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json(); // Parse error message if any
        throw new Error(error.error || "Failed to delete booking");
      }

      refreshBookings(); // Update the list after deletion
      alert("Booking deleted successfully");
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert(error.message);
    }
  };

  const fetchAvailableSlots = async (selectedDate) => {
    try {
      const response = await fetch(
        `http://localhost:5000/available-slots?date=${selectedDate}`
      );
      const data = await response.json();

      const formattedSlots = (data.availableSlots || [])
        .map((time) =>
          dayjs(`${selectedDate}T${time}`).isValid()
            ? dayjs(`${selectedDate}T${time}`).format("hh:mm A")
            : null
        )
        .filter(Boolean); // Remove null or invalid slots

      setAvailableTimes(formattedSlots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableTimes([]); // Default to empty if error occurs
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "date") {
      fetchAvailableSlots(value); // Fetch slots for the new date
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!handleValidation()) return;

    try {
      // Convert selected time back to backend format (HH:mm)
      const selectedTime = dayjs(
        `${formData.date} ${formData.time}`,
        "YYYY-MM-DD hh:mm A"
      ).format("HH:mm");

      const payload = {
        ...formData,
        time: selectedTime, // Ensure time is in backend's expected format
      };

      const url = bookingData
        ? `http://localhost:5000/bookings/${bookingData._id}` // Update booking
        : `http://localhost:5000/bookings`; // Create new booking
      const method = bookingData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody.error || "Failed to save booking");
      }

      setBookingSummary(payload);
      setShowSuccessModal(true);
      resetForm();
      onClose();
      refreshBookings();
    } catch (error) {
      console.error("Error during submission:", error);
      alert(error.message);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    let start = 10; // Start at 10:00 AM
    const end = 20; // End at 8:00 PM
    while (start <= end) {
      const hours = Math.floor(start);
      const minutes = (start % 1) * 60;
      slots.push(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
      );
      start += 1; // Increment by 1 hour
    }
    return slots;
  };

  const ALL_TIME_SLOTS = generateTimeSlots();
  useEffect(() => {
    const initializeForm = async () => {
      if (isOpen) {
        if (bookingData) {
          const formattedDate = dayjs(bookingData.date, "YYYY-MM-DD").format(
            "YYYY-MM-DD"
          );
          const formattedTime = dayjs(
            `${bookingData.date}T${bookingData.time}`,
            "YYYY-MM-DDTHH:mm"
          ).format("hh:mm A");

          setFormData({
            time: "", // Temporarily set blank; will update after fetching slots
            guests: bookingData.guests || 1,
            name: bookingData.name || "",
            contact: bookingData.contact || "",
            date: formattedDate,
          });

          // Fetch available slots for the booking date
          await fetchAvailableSlots(formattedDate);

          // Check if the booking's time matches an available slot
          if (availableTimes.includes(formattedTime)) {
            setFormData((prev) => ({
              ...prev,
              time: formattedTime,
            }));
          }
        } else {
          resetForm();
        }
      }
    };

    initializeForm();
  }, [isOpen, bookingData]);

  if (!isOpen && !showSuccessModal) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-4/5 md:w-3/4 lg:w-2/3 max-w-lg max-h-[96vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-lg md:text-xl font-bold text-white">
                {bookingData ? "Edit Booking" : "Book a Table"}
              </h2>
              <button onClick={onClose}>
                <FaTimes className="text-white text-lg hover:text-gray-300 transition" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-4 md:p-6 space-y-4">
              <form onSubmit={handleSubmit}>
                {/* Name Input */}
                <div className="mb-5">
                  <label className="block text-gray-700 font-medium mb-1 flex items-center">
                    <FaUser className="mr-2 text-purple-500" />
                    Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.name ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Contact Input */}
                <div className="mb-5">
                  <label className="block text-gray-700 font-medium mb-1 flex items-center">
                    <FaPhone className="mr-2 text-purple-500 rotate-90" />
                    Contact:
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    className={`border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.contact ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.contact && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.contact}
                    </p>
                  )}
                </div>

                {/* Date and Time Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Date Input */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 flex items-center">
                      <FaCalendarAlt className="mr-2 text-purple-500" />
                      Select Date:
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Time Input */}
                  <div className="mb-5">
                    <label className="block text-gray-700 font-medium mb-1 flex items-center">
                      <FaClock className="mr-2 text-purple-500" />
                      Available Time Slot:
                    </label>
                    <select
                      name="time"
                      value={formData.time || ""}
                      onChange={handleChange}
                      required
                      className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a time</option>
                      {availableTimes.length > 0
                        ? availableTimes.map((time, index) => (
                            <option key={`${time}-${index}`} value={time}>
                              {time}
                            </option>
                          ))
                        : ALL_TIME_SLOTS.map((time) => (
                            <option key={`${time}`} value={time}>
                              {dayjs(`${formData.date}T${time}`).format(
                                "hh:mm A"
                              )}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                {/* Guests Input */}
                <div className="mb-5">
                  <label className="block text-gray-700 font-medium mb-1 flex items-center">
                    <FaUsers className="mr-2 text-purple-500" />
                    Number of Guests:
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                    min="1"
                    className={`border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.guests ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.guests && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.guests}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end items-center mt-6 space-x-4">
                  <button
                    type="button"
                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          bookingSummary={bookingSummary}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </>
  );
};

export default BookingModal;
