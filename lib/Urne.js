class Urne {

  static getUUID () {
    return (Date.now()+Math.floor(Math.random()*10000)).toString(36);
  }

  #electorLists = new Map();

  constructor () {}

  makeList () {
    const electorList = new ElectorList(this.#electorLists);
    return electorList;
  }
}

class ElectorList {

  #uuid;
  #voterList = new Map();
  #electionList = new Map();
  #recordedVotes = new Map();

  constructor ( electorLists ) {
    this.#uuid = Urne.getUUID();
    electorLists.set(this.#uuid, this);
  }

  addVoter ( _voter ) {
    let voter = new Voter( this.#voterList, _voter );
    return voter;
  }

  removeVoter ( _voter ) {
    this.#voterList.delete(_voter.uuid);
  }

  addElection ( _electionData ) {

    let election = [...this.#electionList.values()]
      .find( _election => _election.name === _electionData.name );

    if(election) return election;

    election = new Election( this, _electionData.name );
    _electionData.candidates.forEach(candidate => election.addCandidate(candidate));
    election.actionVote = _electionData.actionVote;
    election.actionVoted = _electionData.actionVoted;

    return election;
  }

  get voterList() {
    return this.#voterList;
  }

  get electionList() {
    return this.#electionList;
  }

  get recordedVotes() {
    return this.#recordedVotes;
  }

}

class Election {

  #electorList;
  #uuid;
  name;
  #candidateList = new Map();
  #votingClosed = false;
  winnerIs;

  constructor ( _electorList, _name ) {
    this.#uuid = Urne.getUUID();
    this.name = _name;
    this.#electorList = _electorList;
    _electorList.electionList.set(this.#uuid, this);
  }

  addCandidate ( _candidate ) {
    let candidate = new Candidate( this.#candidateList, _candidate );
    return candidate;
  }
  
  submitVote ( voter, candidate ) {
    // Si l'élection est fermée, renvoyer une erreur
    if (this.#votingClosed) {
      console.error("Urne : Les votes sont clos pour cette éléction.");
      return 1;
    }

    // Clé unique pour voter + election + candidat
    const key = `${voter.uuid}_${this.#uuid}_${candidate.uuid}`;

    // Vérifier si le vote existe déjà
    const recordedVotes = this.#electorList.recordedVotes;
    if (recordedVotes.has(key)) {
      recordedVotes.delete(key);  // Supprimer le vote existant
      const results = this.getResults();
      if (this.actionVote) this.actionVote(results);  // Appeler l'action de vote si définie
      return this.getResults();
    }

    // Si aucun vote n'existe pour cette clé, enregistrer un nouveau vote
    recordedVotes.set(key, { 
      uuid: key,
      election: this.#uuid,
      voter: voter.uuid,
      candidate: candidate.uuid
    });

    const results = this.getResults();
    if( this.actionVote ) this.actionVote( results );

    // Si la progression atteint 100%, fermer l'élection et appeler l'action associée
    if ( this.hasUnanimity () ) {
      this.#votingClosed = true;
      if (this.actionVoted) this.actionVoted( results, this.winnerIs );
    }

    return results;
  }

  hasUnanimity () {
    const totalVotes = this.#electorList.voterList.size;
    const voteCounts = {};
    const progress = {};

    // Compter le nombre de votes pour chaque candidat
    this.#electorList.recordedVotes.forEach(vote => {
      voteCounts[vote.candidate] = voteCounts[vote.candidate] ? voteCounts[vote.candidate]+1 : 1;
      progress[vote.candidate] = voteCounts[vote.candidate] / totalVotes;
    })

    const winner = Object.entries(progress).find(([key, percent]) => percent === 1);
    if( winner ) this.winnerIs = this.#candidateList.get(winner[0]);
    return this.winnerIs;
  }

  getResults () {
    const votes = [...this.#electorList.recordedVotes.values()]
      .filter(vote => vote.election === this.uuid);
  
    const totalVoters = this.#electorList.voterList.size;
    const resultMap = new Map();
  
    // Initialisation des résultats avec 0 vote
    for (let [uuid, candidate] of this.candidateList.entries()) {
      resultMap.set(uuid, { name: candidate.name, votes: 0, percentage: 0 });
    }
  
    // Comptage des votes
    for (let vote of votes) {
      const result = resultMap.get(vote.candidate);
      if (result) {
        result.votes += 1;
        result.percentage = totalVoters > 0
          ? result.votes / totalVoters : 0;
      }
    }
  
    // Conversion en tableau pour faciliter l'affichage
    return [...resultMap.values()];
  }

  get uuid() {
    return this.#uuid;
  }

  get candidateList() {
    return this.#candidateList;
  }

}

class Voter {

  #uuid;
  name;

  constructor ( voterList, _name ) {
    this.#uuid = Urne.getUUID();
    this.name = _name;
    voterList.set(this.#uuid, this);
  }

  get uuid() {
    return this.#uuid;
  }

}

class Candidate {

  #uuid;
  name;

  constructor ( candidateList, _name ) {
    this.#uuid = Urne.getUUID();
    this.name = _name;
    candidateList.set(this.#uuid, this);
  }

  get uuid() {
    return this.#uuid;
  }

}

module.exports = Urne;