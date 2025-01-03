import {
  FaTimes,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaUser,
  FaPhone,
} from "react-icons/fa";
import dayjs from "dayjs";

const SuccessModal = ({ bookingSummary, onClose }) => {
  const formattedTime = dayjs(
    `${bookingSummary.date}T${bookingSummary.time}`
  ).format("hh:mm A");
  const formattedDate = dayjs(bookingSummary.date).format("DD-MM-YYYY");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-80 sm:w-full max-w-lg sm:max-w-md md:max-w-lg lg:max-w-xl">
        {/* Title Section */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-lg md:text-xl font-bold text-white">
            Booking Successful!
          </h2>
          <button onClick={onClose}>
            <FaTimes className="text-white text-lg hover:text-gray-300 transition" />
          </button>
        </div>

        {/* Body Section */}
        <div className="p-4 md:p-6 text-center">
          {/* Success Tick Icon with Animation */}
          <div className="flex justify-center mb-6">
            <FaCheckCircle className="text-green-500 text-6xl md:text-7xl animate-success" />
          </div>

          {/* Summary Details in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[60%_40%] gap-4 sm:gap-6">
            {/* Name */}
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <FaUser className="text-purple-500 text-lg mr-2" />
              <span className="font-medium text-gray-700">
                {bookingSummary.name}
              </span>
            </div>

            {/* Contact */}
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <FaPhone className="text-purple-500 text-lg mr-2 rotate-90" />
              <span className="font-medium text-gray-700">
                {bookingSummary.contact}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <FaCalendarAlt className="text-purple-500 text-lg mr-2" />
              <span className="font-medium text-gray-700">{formattedDate}</span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <FaClock className="text-purple-500 text-lg mr-2" />
              <span className="font-medium text-gray-700">{formattedTime}</span>
            </div>

            {/* Guests */}
            <div className="flex items-center justify-center sm:justify-start col-span-1 sm:col-span-2">
              <FaUsers className="text-purple-500 text-lg mr-2" />
              <span className="font-medium text-gray-700">
                {bookingSummary.guests} Guests
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
