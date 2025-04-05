const universData = require('../assets/univers');

class Univers {

  #data;
  #usedWords = new Set();

  constructor() {
    this.#data = universData;
  }

  // Liste des univers (clés principales avec des "themes")
  getUniversList() {
    return Object.keys(this.#data).filter(key => this.#data[key].themes);
  }
  
  getUniversTitles() {
    return Object.entries(this.#data)
      .filter(([_, value]) => value.title)
      .map(([key, value]) => ({ name: key, title: value.title }));
  }

  // Liste des thèmes pour un univers donné
  getThemesFor(universeKey) {
    const universe = this.#data[universeKey];
    return universe?.themes ? Object.keys(universe.themes) : [];
  }
  
  getThemesTitles(universeKey) {
    const universe = this.#data[universeKey];
    if (!universe || !universe.themes) return [];
  
    return Object.entries(universe.themes).map(([key, value]) => ({
      name: key,
      title: value.title
    }));
  }

  // Titre de l’univers ou thème
  getTitle(key) {
    if (this.#data[key]?.title) return this.#data[key].title;

    for (const universe of Object.values(this.#data)) {
      if (universe.themes?.[key]?.title) return universe.themes[key].title;
    }

    return null;
  }

  // Pitch d’un thème
  getPitch(universeKey, themeKey) {
    return this.#data[universeKey]?.themes?.[themeKey]?.pitch || null;
  }

  // Obtenir un mot aléatoire unique depuis un univers ou neutre
  getRandomWord(context = 'neutre') {
    const wordList = this.#data[context]?.words || [];
    const available = wordList.filter(word => !this.#usedWords.has(word));
    if (available.length === 0) return null;

    const word = available[Math.floor(Math.random() * available.length)];
    this.#usedWords.add(word);
    return word;
  }

  // Réinitialiser les mots utilisés
  resetUsedWords() {
    this.#usedWords.clear();
  }
}

module.exports = Univers;