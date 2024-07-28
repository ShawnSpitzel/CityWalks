import SearchBar from "./SearchBar.jsx"
export default function Header() {
    return (
        <div className = "flex h-[80px] px-[40px] items-center justify-end">
            <SearchBar></SearchBar>
        </div>
    )
}