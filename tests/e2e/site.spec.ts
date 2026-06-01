import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );

  expect(overflow).toBeLessThanOrEqual(1);
}

test("serves the home page", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "Welcome to the St. Margaret of Cortona Fraternity | St. Margaret of Cortona Fraternity"
  );
  await expect(
    page.getByRole("heading", {
      name: "Welcome to the St. Margaret of Cortona Fraternity"
    })
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Saint Thomas More Region Secular Franciscan members gathered around a regional banner."
    })
  ).toHaveAttribute("src", "/uploads/images/new-rec-2025-2028.jpg");
  await expect(page.getByText("Saint Thomas More Region")).toBeVisible();
});

test("serves each fixed content route", async ({ page }) => {
  const routes = [
    {
      path: "/who-we-are",
      heading: "Who We Are",
      text: "Saint Gabriel the Archangel Church"
    },
    {
      path: "/get-involved",
      heading: "Get Involved",
      text: "Is God calling you to the Secular Franciscan Order?"
    },
    {
      path: "/news",
      heading: "Regional Franciscan News",
      text: "Early spring issue of Our Franciscan Scoop"
    },
    {
      path: "/faq",
      heading: "FAQ",
      text: "What is the best way to find out about joining the Secular Franciscans?"
    }
  ];

  for (const route of routes) {
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: route.heading, level: 1 })
    ).toBeVisible();
    await expect(page.getByText(route.text)).toBeVisible();
  }
});

test("renders static contact information without a dead form", async ({ page }) => {
  await page.goto("/get-involved");

  const contact = page.locator(".contact-info");

  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
  await expect(contact.getByText("4240 Miaomiao Ave")).toBeVisible();
  await expect(contact.getByText("North Las Vegas, NV 89084")).toBeVisible();
  await expect(
    contact.getByRole("link", { name: "stmargaretofcortona@endian.dev" })
  ).toBeVisible();
  await expect(page.getByLabel("First Name")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send" })).toHaveCount(0);
});

test("renders FAQ entries from the content collection", async ({ page }) => {
  await page.goto("/faq");

  await expect(
    page.getByRole("heading", { name: /Who are the Franciscans/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /What if I realize I am not called to be a Secular Franciscan/i
    })
  ).toBeVisible();
  await expect(page.locator(".list-entry")).toHaveCount(13);
});

test("renders resource links and text-only resources intentionally", async ({
  page
}) => {
  await page.goto("/news");

  await expect(
    page.getByRole("link", { name: "View Summer 2025 PDF" })
  ).toHaveAttribute(
    "href",
    "https://www.stmregionofs.com/_files/ugd/9af1c7_9b9850224ce048f1b3f8ec01bcd755ff.pdf"
  );
  await expect(
    page.getByText("No document link is currently available.")
  ).toBeVisible();
});

test("primary navigation links work", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "FAQ" })
    .click();
  await expect(page).toHaveURL("/faq");
  await expect(page.getByRole("heading", { name: "FAQ" })).toBeVisible();
});

test("primary navigation keeps Get Involved as the final CTA", async ({
  page
}) => {
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const expectedLinks =
    viewportWidth <= 480
      ? ["Who We Are", "News", "FAQ", "Get Involved"]
      : ["Home", "Who We Are", "News", "FAQ", "Get Involved"];

  await expect(nav.getByRole("link")).toHaveText(expectedLinks);

  const cta = nav.getByRole("link", { name: "Get Involved" });
  await expect(cta).toHaveClass(/primary-nav__link--cta/);

  if (viewportWidth <= 480) {
    await expect(nav.getByRole("link", { name: "Home" })).toHaveCount(0);
  }
});

test("keeps key layouts readable across configured viewports", async ({
  page
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("navigation", { name: "Primary navigation" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Welcome to the St. Margaret of Cortona Fraternity"
    })
  ).toBeVisible();
  await expect(
    page.locator(".home-hero__actions").getByRole("link", {
      name: "Get involved"
    })
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/faq");
  await expect(
    page.getByRole("heading", { name: "Questions and answers" })
  ).toBeVisible();
  await expect(page.locator(".faq-entry").first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/news");
  await expect(
    page.getByRole("heading", { name: "Regional Franciscan News" })
  ).toBeVisible();
  await expect(page.locator(".resource-entry").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View Summer 2025 PDF" })
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/get-involved");
  await expect(page.locator(".site-footer")).toContainText("4240 Miaomiao Ave");
  await expect(page.locator(".site-footer")).toContainText(
    "North Las Vegas, NV 89084"
  );
  await expectNoHorizontalOverflow(page);
});

test("serves the custom 404 page for missing routes", async ({ page }) => {
  const response = await page.goto("/missing-page");

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle(
    "Page not found | St. Margaret of Cortona Fraternity"
  );
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
});
