/* eslint-disable no-undef */
const util = require("../util/util");
const { assert } = require("./set_up");

describe("sortTest", () => {
  it("should order by timestamp - minus test", () => {
    const a = [{ timestamp: -123 }, { timestamp: -70 }, { timestamp: -30 }];
    util.sortData(a);
    assert(a, [{ timestamp: -30 }, { timestamp: -70 }, { timestamp: -123 }]);
  });
  it("should order by timestamp - plus test", () => {
    const a = [{ timestamp: 1 }, { timestamp: 70 }, { timestamp: 68 }];
    util.sortData(a);
    assert(a, [{ timestamp: 1 }, { timestamp: 68 }, { timestamp: 70 }]);
  });
  it("should order by timestamp - mix test", () => {
    const a = [{ timestamp: 1 }, { timestamp: -70 }, { timestamp: 68 }];
    util.sortData(a);
    assert(a, [{ timestamp: -70 }, { timestamp: 1 }, { timestamp: 68 }]);
  });
});
