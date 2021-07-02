import locationTiles from "./data.locationTiles.js";
import LocationTile from "./class.LocationTile.js";

export default function getAllLocationTiles() {
  return locationTiles.map((data) => new LocationTile(data));
}
