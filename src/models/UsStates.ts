import statesJSON from './us-states.json';

export interface UsState {
  name: string;
  abbreviation: string;
}

export default class UsStates {
  states: UsState[];
  constructor() {
    this.states = statesJSON;
  }
}
