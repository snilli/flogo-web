import { uniqueId } from 'lodash';
import { BRANCH_PREFIX } from '../../constants';

export function newBranchId() {
  return uniqueId(BRANCH_PREFIX);
}
