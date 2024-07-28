import SubmitButton from "../form/SubmitButton"
export default function Search({onChange, value}) {
  
  return (
    <div>
      <div className="relative">
        <input
          type="text"
          id="simple-search"
          onChange = {onChange}
          value = {value}
          className="bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Enter City and State"
          required
        />
        <SubmitButton></SubmitButton>
      </div>
    </div>
  );
}