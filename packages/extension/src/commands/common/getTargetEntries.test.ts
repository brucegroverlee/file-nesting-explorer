import * as assert from "assert";

import { getTargetEntries } from "./getTargetEntries";
import { fileEntry } from "../../test/helpers/fixtures";

suite("getTargetEntries", () => {
  test("returns only the clicked entry when it is NOT in the selection", () => {
    const clicked = fileEntry("/tmp/A.tsx");
    const selection = [fileEntry("/tmp/B.tsx"), fileEntry("/tmp/C.tsx")];

    const result = getTargetEntries(clicked, selection);

    assert.deepStrictEqual(result, [clicked]);
  });

  test("returns the full selection when the clicked entry IS in the selection", () => {
    const clicked = fileEntry("/tmp/B.tsx");
    const selection = [fileEntry("/tmp/B.tsx"), fileEntry("/tmp/C.tsx")];

    const result = getTargetEntries(clicked, selection);

    assert.deepStrictEqual(result, selection);
  });

  test("returns the selection when the clicked entry is undefined (Windows delete key)", () => {
    const selection = [fileEntry("/tmp/B.tsx")];

    const result = getTargetEntries(
      undefined as unknown as ReturnType<typeof fileEntry>,
      selection,
    );

    assert.deepStrictEqual(result, selection);
  });
});
