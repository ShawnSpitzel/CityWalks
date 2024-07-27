export default function Filter({ onChange }) {
    return (
      <div className="">
        <select
          className="p-2.5 ms-2 text-sm text-gray-400 bg-gray-50 rounded-lg border hover:bg-gray-100 focus:ring-4 focus:outline-none"
          onChange={onChange}
          defaultValue=""
         
        >
          <option value="" disabled>Select distance</option>
          <option value={5}>5 miles</option>
          <option value={10}>10 miles</option>
          <option value={20}>20 miles</option>
          <option value={50}>50 miles</option>
        </select>
      </div>
    );
  }
  