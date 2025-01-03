"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaEdit,
  FaTrash,
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import Loader from "./Loader";
import BookingModal from "./BookingModal";

const BookingsTable = ({ refreshTrigger }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(
        "https://restaurant-booking-system-backend.onrender.com/bookings"
      );
      const formattedBookings = data.map((booking) => ({
        ...booking,
        date: dayjs(booking.date, "YYYY-MM-DD").format("DD-MM-YYYY"), // Format date for display
      }));

      setBookings(formattedBookings);
    } catch (err) {
      setError("Failed to fetch bookings. Please try again.");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = formData._id
        ? `https://restaurant-booking-system-backend.onrender.com/bookings/${formData._id}` // Update booking
        : `https://restaurant-booking-system-backend.onrender.com/bookings`; // Create new booking
      const method = formData._id ? "PUT" : "POST";

      const payload = {
        ...formData,
        date: dayjs(formData.date, "DD-MM-YYYY").format("YYYY-MM-DD"), // Convert back to backend format
      };

      await axios({
        method,
        url,
        data: payload,
      });

      fetchBookings();
    } catch (err) {
      console.error("Error saving booking:", err);
      alert("Failed to save booking. Please try again.");
    }
  };

  // Add a new booking
  const handleNewBookingAdded = (newBooking) => {
    const formattedBooking = {
      ...newBooking,
      date: dayjs(newBooking.date).format("YYYY-MM-DD"),
    };

    setBookings((prev) => [formattedBooking, ...prev]); // Add the latest booking to the top
  };

  useEffect(() => {
    fetchBookings();
  }, [refreshTrigger]);

  // Delete a booking
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://restaurant-booking-system-backend.onrender.com/bookings/${id}`
      );
      setBookings((prev) => prev.filter((booking) => booking._id !== id));
      setShowDeleteModal(false);
    } catch (err) {
      setError("Failed to delete booking. Please try again.");
      console.error("Error deleting booking:", err);
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking({
      ...booking,
      date: dayjs(booking.date, "YYYY-MM-DD").format("DD-MM-YYYY"), // Format date for the modal
    });
    setEditModalOpen(true);
  };

  // Table column configuration
  const columns = useMemo(
    () => [
      {
        accessorKey: "sno",
        header: "S.No.",
        cell: (info) => info.row.index + 1,
      },
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) =>
          dayjs(row.original.date, "DD-MM-YYYY").isValid()
            ? dayjs(row.original.date, "DD-MM-YYYY").format("MM-DD-YYYY")
            : "Invalid Date",
      },
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => {
          const date = dayjs(row.original.date, "DD-MM-YYYY").format(
            "YYYY-MM-DD"
          );
          const time = row.original.time; // Assume time is in HH:mm format
          const datetime = `${date}T${time}`;
          return dayjs(datetime, "YYYY-MM-DDTHH:mm").isValid()
            ? dayjs(datetime).format("hh:mm A")
            : "Invalid Time";
        },
      },

      { accessorKey: "guests", header: "Guests" },
      { accessorKey: "contact", header: "Contact" },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleEdit(row.original)}
            >
              <FaEdit className="mr-5" />
            </button>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => {
                setSelectedBooking(row.original);
                setShowDeleteModal(true);
              }}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: bookings,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) return <Loader />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  if (bookings.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No bookings yet. Create a booking to get started!
      </p>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-600">
        Bookings
      </h1>
      <div className="overflow-x-auto rounded-lg">
        <table className="table-auto w-full border border-gray-400 shadow-lg rounded-lg">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border border-gray-300 p-3 text-left font-semibold cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === "asc" ? (
                          <FaArrowUp />
                        ) : (
                          <FaArrowDown />
                        )
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-100">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border border-gray-300 p-3 text-gray-700 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          <FaAngleDoubleLeft />
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          <FaAngleLeft />
        </button>
        <span className="text-gray-700 font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          <FaAngleRight />
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          <FaAngleDoubleRight />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-80 sm:w-full max-w-md p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Deletion
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-red-400 hover:text-red-500 transition"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this booking?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
              >
                No
              </button>
              <button
                onClick={() => handleDelete(selectedBooking._id)}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      <BookingModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        refreshBookings={fetchBookings}
        bookingData={selectedBooking}
      />
    </div>
  );
};

export default BookingsTable;
