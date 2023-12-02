import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const Map = ({ location }) => {
  return (
    <>
      {location ? (
        <MapContainer
          center={[37.385535, -5.986213]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '20rem' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.entries(location).map((site, index) => (
            <Marker key={index} position={[37.389239, -5.984596]}>
              <Popup>ID Site: {site[0]}</Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <></>
      )}
    </>
  );
};

export default Map;
