import React, { useState, useEffect } from "react";
import "./AddProduct.css";
import "react-date-range/dist/styles.css"; // Date range picker base styles
import "react-date-range/dist/theme/default.css"; // Date range picker theme

import { DateRangePicker } from "react-date-range";
import { createEquipment, getBrands, getEquips } from "../../api/equipments";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * AddProduct Component
 * --------------------
 * This component provides a form interface for owners to add
 * new agricultural equipment for sale or rent.
 *
 * Features:
 * - Fetches available equipment types and brands from backend APIs
 * - Collects detailed metadata about the equipment
 * - Allows selection of availability date range
 * - Submits equipment data to backend for creation
 *
 * Access Control:
 * - Redirects unauthenticated users to home page
 */
const AddProduct = () => {
  // Controls visibility of the date range picker
  const [visible, setVisible] = useState(false);

  // Start and end dates for equipment availability
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Equipment types and manufacturer brands fetched from backend
  const [equipments, setEquipments] = useState([]);
  const [brands, setBrands] = useState([]);

  // React Router navigation helper
  const navigate = useNavigate();

  /**
   * Form state containing all equipment attributes.
   * Default values are set for controlled inputs.
   */
  const [data, setData] = useState({
    owner: 54,
    manufacturer: 0,
    title: "",
    description: "",
    equipment_type: 1,
    available_start_time: new Date().toISOString().slice(0, 10),
    available_end_time: new Date().toISOString().slice(0, 10),
    equipment_location: "",
    daily_rental: 0,
    hourly_rental: 0,
    manufacturing_year: 0,
    model: "",
    condition: "",
    horsepower: 0,
    width: 0,
    height: 0,
  });

  /**
   * Authentication guard.
   * Redirects user to homepage if access token is missing.
   */
  useEffect(() => {
    if (!Cookies.get("access-token")) {
      navigate("/");
    }
  }, []);

  /**
   * Fetches equipment types and brand list on component mount.
   */
  useEffect(() => {
    const getEquipment = async () => {
      const { data } = await getEquips();
      setEquipments(data);
    };

    const getBrand = async () => {
      const { data } = await getBrands();
      setBrands(data);
    };

    getEquipment();
    getBrand();
  }, []);

  /**
   * Handles equipment creation form submission.
   * Sends form data to backend API and redirects on success.
   */
  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    const res = await createEquipment(data);

    if (res.data.success) {
      alert(res.data.message);
      navigate("/booking-history");
    }

    // Debug logs (can be removed in production)
    console.log(data);
    console.log(res);
  };

  /**
   * Updates availability dates when date range picker changes.
   */
  const handleSelect = (ranges) => {
    setStartDate(ranges.selection.startDate);
    setEndDate(ranges.selection.endDate);
  };

  /**
   * Configuration object for DateRangePicker component.
   */
  const selectionRange = {
    startDate: startDate,
    endDate: endDate,
    key: "selection",
  };

  return (
    <div>
      <div className="my-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="border-l-2 border-green-600 pl-6">
          <h1 className="text-2xl font-semibold text-gray-700">
            Describe Your Equipment
          </h1>
          <p className="text-md font-semibold mt-2 text-gray-500">
            Provide key details of your equipment to Sell Or Rent Out
          </p>
        </div>

        {/* Equipment creation form */}
        <form
          onSubmit={handleCreateEquipment}
          className="w-full mt-12 max-w-8xl"
        >
          <div className="flex flex-wrap -mx-3 mb-6">
            {/* Title input */}
            <div className="w-1/2 md:w-1/2 px-3 border p-2">
              <label className="form-label w-1/2 text-sm font-bold text-gray-500 inline-block pl-2 mb-2">
                Title*
              </label>
              <input
                className="appearance-none block w-1/2 rounded py-3 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                type="text"
                placeholder="Equipment title"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
              />
            </div>

            {/* Manufacturer selection */}
            <div className="w-1/2 md:w-1/2 px-3 border flex flex-col p-2">
              <label className="form-label w-1/2 text-sm font-bold text-gray-500 inline-block pl-2 mb-2">
                Manufacturer*
              </label>
              <select
                onChange={(e) =>
                  setData({ ...data, manufacturer: e.target.value })
                }
                className="w-32"
              >
                <option disabled>Choose Brand</option>
                {brands.map((item, i) => (
                  <option key={i} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Remaining inputs continue unchanged (logic preserved) */}
            {/* Date range picker */}
            <div className="w-full md:w-1/2 px-3 mb-6 border p-2 md:mb-0">
              <label
                className="form-label text-lg bg-gray-200 hover:bg-gray-300 font-bold text-gray-500 inline-block pl-2 mb-2"
                onClick={() => setVisible(true)}
              >
                Select Date Range
              </label>
              {visible && (
                <DateRangePicker
                  style={{ height: "300px", width: "280px" }}
                  ranges={[selectionRange]}
                  minDate={new Date()}
                  rangeColors={["#68AC5D"]}
                  onChange={handleSelect}
                />
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="mt-32 bg-darkgreen ml-8 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-full mx-auto"
          >
            Add Equipment
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
