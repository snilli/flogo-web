import { FlogoStreamState } from '..';

/* This function should return the Stream api structure */
export function generateResourceFromState(state: FlogoStreamState): any {
  return {
    id: state.id,
    name: state.name,
    description: state.description,
  };
}
