import computeStayFee from "../../src/util/computeStayFee.ts";
import { expect, test} from '@jest/globals';

test('days of stay * roomFee', () => {
  expect(computeStayFee({
    timeIn: '2026-01-01',
    timeOut: '2026-01-01',
    roomFee: 2000
  })).toBe(2000);
});
