export default function List() {
  const places = [
    { name: "Berkeley Heights", lat: 40.6764, lng: -74.4244 },
    { name: "Livingston", lat: 40.7855, lng: -74.3291 },
    { name: "Maplewood", lat: 40.733, lng: -74.2712 },
    { name: "Millburn", lat: 40.7394, lng: -74.324 },
  ];
  return(
    <div >
        {places?.map((place, i) => (
            <li key = {i}>{place.name} {place.lat}</li>
        ))}
    </div>
  )
}
