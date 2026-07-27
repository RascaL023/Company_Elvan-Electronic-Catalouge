import { useDataContext } from '../services/DataProvider';

export function useRepository() {
  return useDataContext();
}
