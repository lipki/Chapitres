/**
 * Nextor est un gestionnaire d'étapes et d'actions simples.
 * Il permet d'exécuter une suite d'étapes éphémères via `next()`,
 * ou d'invoquer des actions nommées indépendamment via `please()`.
 */
export default class Nextor {

  /**
   * Liste d'étapes à usage unique.
   * Chaque fonction est exécutée à la suite via `next()`.
   * Une fonction doit retourner `true` pour être retirée de la pile.
   */
  static mayflyActionList = [];

  /**
   * Map d'actions nommées persistantes, invoquées à la demande.
   */
  static actionList = new Map();

  /**
   * Ajoute une ou plusieurs étapes à la file des actions éphémères.
   * @param  {...Function} args Fonctions à exécuter dans l'ordre.
   */
  static addStep ( ...args ) {
    Nextor.mayflyActionList = Nextor.mayflyActionList.concat( args );
  }
  
  /**
  * Exécute l’étape courante de `mayflyActionList`.
  * L’étape est retirée si elle retourne une valeur true.
  * @param  {...any} args Arguments transmis à la fonction exécutée.
  */
  static start = Nextor.next;
  static next ( ...args ) {
    const action = Nextor.mayflyActionList[0];
    if (action) {
      const res = action( ...args );
      if ( res ) Nextor.mayflyActionList.shift();
    } 
  }

  /**
   * Ajoute une action nommée persistante.
   * @param {string} name Nom de l'action.
   * @param {Function} action Fonction à exécuter.
   */
  static addAction ( name, action ) {
    Nextor.actionList.set(name, action);
  }

  /**
   * Supprime une action nommée.
   * @param {string} name Nom de l'action à retirer.
   */
  static removeAction(name) {
    Nextor.actionList.delete(name);
  }

  /**
   * Vérifie si une action est enregistrée.
   * @param {string} name Nom de l'action.
   * @returns {boolean}
   */
  static hasAction(name) {
    return Nextor.actionList.has(name);
  }

  /**
   * Invoque une action nommée si elle existe.
   * @param {string} name Nom de l'action à invoquer.
   * @param  {...any} args Arguments transmis à la fonction exécutée.
   */
  static invoke = Nextor.please;
  static please(name, ...args) {
    const action = Nextor.actionList.get(name);
    if (action) {
      action(...args);
    } else {
      console.warn(`Nextor : Action "${name}" not found.`);
    }
  }

}