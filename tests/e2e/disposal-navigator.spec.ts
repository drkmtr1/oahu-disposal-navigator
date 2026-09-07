import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const fallback = {
  title: "View City and County of Honolulu resident disposal guidance",
  url: "https://www.honolulu.gov/env/ref/waste-drop-off-rules-residents/",
};

const successResponse = {
  requestId: "request-success",
  status: "success",
  category: { id: "mattresses", name: "Mattresses" },
  guidance: {
    action: "Take the mattress to an applicable City resident waste-drop-off facility.",
    requirements: [
      "Use this guidance only for Oʻahu residential household disposal.",
      "Follow the facility rules shown by the official source.",
    ],
    where: "An applicable City resident waste-drop-off facility.",
  },
  source: {
    organization: "City and County of Honolulu Department of Environmental Services",
    title: "Rules and Guidelines for Residents",
    url: fallback.url,
    apparentUpdatedOn: "2025-04-22",
    verifiedOn: "2026-09-05",
    reviewBy: "2026-12-04",
  },
  evidence: [
    {
      id: "ev-mattresses-drop-off",
      summary: "The reviewed source lists mattresses as regular refuse.",
      locator: "Regular Refuse",
      claimScope: "Oʻahu residential mattress drop-off.",
      reviewedOn: "2026-09-05",
    },
  ],
  trustMessage: "Disposal rules come from official sources.",
} as const;

const ambiguousResponse = {
  requestId: "request-ambiguous",
  status: "ambiguous",
  question: "What kind of battery is it?",
  candidates: [
    {
      id: "alkaline-and-single-use-batteries",
      name: "Alkaline and single-use batteries",
    },
    {
      id: "standalone-rechargeable-batteries",
      name: "Standalone rechargeable batteries",
    },
    {
      id: "car-and-motorcycle-lead-acid-batteries",
      name: "Car and motorcycle lead-acid batteries",
    },
  ],
  allowUnsure: true,
  fallback,
} as const;

const unsupportedResponse = {
  requestId: "request-unsupported",
  status: "unsupported",
  reasonCode: "UNSUPPORTED",
  message: "This item is not reliably covered yet.",
  fallback,
} as const;

const errorResponse = {
  requestId: "request-error",
  status: "error",
  reasonCode: "DATABASE_UNAVAILABLE",
  retryable: true,
  message: "Disposal guidance is temporarily unavailable. Please try again.",
} as const;

async function mockApi(page: Page) {
  await page.route("**/api/disposal-options", async (route) => {
    const payload = route.request().postDataJSON() as {
      item: string;
      selectedCategoryId?: string;
    };

    if (payload.selectedCategoryId) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...successResponse,
          requestId: "request-selected",
          category: {
            id: payload.selectedCategoryId,
            name: "Standalone rechargeable batteries",
          },
        }),
      });
      return;
    }

    const normalized = payload.item.trim().toLocaleLowerCase("en-US");
    const response =
      normalized === "old mattress"
        ? successResponse
        : normalized === "battery"
          ? ambiguousResponse
          : normalized === "temporary failure"
            ? errorResponse
            : unsupportedResponse;

    await route.fulfill({
      status: response.status === "error" ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

async function submitItem(page: Page, item: string) {
  const input = page.getByLabel("Household item");
  await input.fill(item);
  await input.press("Enter");
}

async function expectNoAccessibilityViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const fitsViewport = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(fitsViewport).toBe(true);
}

async function expectPrimaryTargetsAtLeast44Pixels(page: Page) {
  const controls = page.locator("input, button");
  for (let index = 0; index < (await controls.count()); index += 1) {
    const box = await controls.nth(index).boundingBox();
    expect(box, `control ${index} should be visible`).not.toBeNull();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
}

test("BL-006 / AC-FR-001-01 and AC-NFR-004-01 provide a labeled keyboard-first initial state", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response?.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-powered-by"]).toBeUndefined();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Find out how to dispose of a household item",
  );
  const input = page.getByLabel("Household item");
  await expect(input).toBeVisible();
  await expect(page.getByRole("button", { name: "Find disposal options" })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#item-error")).toContainText("Enter one household item");
  await expect(input).toBeFocused();
  await expectNoAccessibilityViolations(page);
});

test("BL-006 / AC-NFR-004-01 announces loading and prevents duplicate submission", async ({
  page,
}) => {
  let releaseResponse: (() => void) | undefined;
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });
  await page.route("**/api/disposal-options", async (route) => {
    await responseGate;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(successResponse),
    });
  });
  await page.goto("/");

  await submitItem(page, "old mattress");
  const submit = page.getByRole("button", { name: "Finding options…" });
  await expect(submit).toBeDisabled();
  await expect(page.getByRole("status")).toHaveText("Finding disposal options…");

  releaseResponse?.();
  await expect(page.getByRole("heading", { name: "Mattresses" })).toBeFocused();
});

test("BL-006/007 / AC-FR-006-01, AC-FR-007-01, AC-FR-011-01, and AC-FR-012-01 render inspectable provenance and recovery controls", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/");
  await submitItem(page, "old mattress");

  const resultHeading = page.getByRole("heading", { level: 2, name: "Mattresses" });
  await expect(resultHeading).toBeFocused();
  await expect(page.getByRole("heading", { name: "What to do" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Important requirements" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Where" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Official source" })).toBeVisible();
  await expect(page.getByText(successResponse.source.organization)).toBeVisible();
  await expect(page.getByRole("link", { name: successResponse.source.title })).toHaveAttribute(
    "href",
    fallback.url,
  );
  await expect(page.getByText("Project verified: September 5, 2026")).toBeVisible();
  await expect(page.getByText("Review due by: December 4, 2026")).toBeVisible();
  await expect(page.getByText("Source page date: April 22, 2025")).toBeVisible();
  const evidence = page.getByText("Evidence supporting this guidance");
  await expect(evidence).toBeVisible();
  await evidence.click();
  await expect(page.getByText(successResponse.evidence[0].summary)).toBeVisible();
  await expect(page.getByText(`Claim covered: ${successResponse.evidence[0].claimScope}`)).toBeVisible();
  await expect(page.getByText("Source location: Regular Refuse")).toBeVisible();
  await expect(page.getByText("Evidence reviewed: September 5, 2026")).toBeVisible();
  await expect(page.getByText(successResponse.trustMessage)).toBeVisible();

  await page.getByRole("button", { name: "Edit description" }).click();
  await expect(page.getByLabel("Household item")).toHaveValue("old mattress");
  await expect(page.getByLabel("Household item")).toBeFocused();

  await submitItem(page, "old mattress");
  await page.getByRole("button", { name: "Search another item" }).click();
  await expect(page.getByLabel("Household item")).toHaveValue("");
  await expect(page.getByLabel("Household item")).toBeFocused();
  await expectNoAccessibilityViolations(page);
});

test("BL-006 / AC-FR-008-01 and AC-FR-008-02 resolve a bounded clarification or safely abstain", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/");
  await submitItem(page, "battery");

  await expect(page.getByRole("heading", { name: ambiguousResponse.question })).toBeFocused();
  await expect(page.getByRole("button", { name: /batteries/i })).toHaveCount(3);
  await expect(page.getByRole("button", { name: "I’m not sure" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What to do" })).toHaveCount(0);
  await expectNoAccessibilityViolations(page);

  const selectedRequest = page.waitForRequest((request) => {
    if (!request.url().endsWith("/api/disposal-options")) return false;
    return request.postDataJSON()?.selectedCategoryId === "standalone-rechargeable-batteries";
  });
  await page.getByRole("button", { name: "Standalone rechargeable batteries" }).click();
  await selectedRequest;
  await expect(
    page.getByRole("heading", { level: 2, name: "Standalone rechargeable batteries" }),
  ).toBeFocused();

  await page.getByRole("button", { name: "Search another item" }).click();
  await submitItem(page, "battery");
  await page.getByRole("button", { name: "I’m not sure" }).click();
  await expect(page.getByRole("heading", { name: "No reliable match yet" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "What to do" })).toHaveCount(0);
});

test("BL-006 / AC-FR-009-01 and AC-NFR-005-01 distinguish unsupported and retryable failure states", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/");
  await submitItem(page, "paint");

  await expect(page.getByRole("heading", { name: "No reliable match yet" })).toBeFocused();
  await expect(page.getByText(unsupportedResponse.message)).toBeVisible();
  await expect(page.getByRole("heading", { name: "What to do" })).toHaveCount(0);

  await page.getByRole("button", { name: "Search another item" }).click();
  await submitItem(page, "temporary failure");
  await expect(page.getByRole("heading", { name: "We couldn’t complete the lookup" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Try once more" })).toBeVisible();
  await expect(page.getByRole("link", { name: fallback.title })).toHaveAttribute(
    "href",
    fallback.url,
  );
  await expectNoAccessibilityViolations(page);
});

for (const width of [320, 375, 768, 1280]) {
  test(`BL-006 / AC-NFR-004-03, AC-NFR-005-01, and AC-NFR-006-01 fit all states at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockApi(page);
    await page.goto("/");

    await expectNoHorizontalOverflow(page);
    await expectPrimaryTargetsAtLeast44Pixels(page);

    for (const item of ["old mattress", "battery", "paint", "temporary failure"]) {
      await submitItem(page, item);
      await expect(page.locator("#result-heading")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectPrimaryTargetsAtLeast44Pixels(page);
    }
  });
}

test("BL-006 / AC-NFR-004-02 supports a 200% zoom-equivalent effective viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await mockApi(page);
  await page.goto("/");
  await submitItem(page, "old mattress");

  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("heading", { name: "Mattresses" })).toBeVisible();
  await expect(page.getByRole("link", { name: successResponse.source.title })).toBeVisible();
});

test("BL-006 / AC-NFR-009-01 keeps no item history or location data in browser storage", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/");
  await submitItem(page, "old mattress");

  const storage = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
  expect(storage).toEqual({ local: {}, session: {} });
  await expect(page.locator('input[name*="location" i], input[name*="email" i]')).toHaveCount(0);
});
