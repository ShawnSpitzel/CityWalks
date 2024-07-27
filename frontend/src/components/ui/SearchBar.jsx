import React, { useState } from "react";
import Search from "../form/Search.jsx";

export default function SearchBar() {
  const [cityName, setCityName] = useState("");
  const [distance, setDistance] = useState("");

  // Handles changes within the search bar
  const handleChange = (e) => {
    setCityName(e.target.value);
  };

    // Handles changes for the dropdown
  const handleValue = (e) => {
    setDistance(e.target.value);
  };

  const fetchWalkability = async() => {
    const response = await fetch(`/walkability?city=${encodeURIComponent(cityName)}&radius=${encodeURIComponent(distance)}`);
    const data = await response.json();
    console.log(data)
}
  // Console logs the inputted values
  const onSubmit = (e) => {
    e.preventDefault();
    fetchWalkability();
    console.log(cityName);
    console.log(distance);
  };

  return (
    <div className="">
      <form id="form" onSubmit={onSubmit} className="max-w-lg mx-auto">
        <div className="flex">
          <div className="flex relative w-full items-center">
            <Search value={cityName} onChange={handleChange} />
            <div className="">
              <select
                className={`p-2.5 ms-2 text-sm bg-gray-50 rounded-lg border hover:bg-gray-100 focus:ring-4 focus:outline-none ${
                  distance === "" ? "text-gray-400" : "text-gray-900"
                }`}
                onChange={handleValue}
                value={distance}
              >
                <option value="" disabled>
                  Select distance
                </option>
                <option value={5}>5 miles</option>
                <option value={10}>10 miles</option>
                <option value={20}>20 miles</option>
                <option value={50}>50 miles</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
