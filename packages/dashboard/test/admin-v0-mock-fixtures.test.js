import test from "node:test";
import assert from "node:assert/strict";

import {
  approvedFixtureFiles,
  validateAdminV0MockFixtures
} from "../scripts/validate-admin-v0-mock-fixtures.mjs";

test("Admin Dashboard v0 mock fixtures pass local safety validation", () => {
  const result = validateAdminV0MockFixtures();

  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
  assert.equal(result.filesValidated, approvedFixtureFiles.length);
});
