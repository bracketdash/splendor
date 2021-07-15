import characterCards from "./data.characterCards.js";
import CharacterCard from "./class.CharacterCard.js";

export default function getAllCharacterCards() {
  return characterCards.map((data) => new CharacterCard(data));
}
