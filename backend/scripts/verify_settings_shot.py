import os
from playwright.sync_api import sync_playwright

SCREENSHOT_PATH = os.path.join(r"C:\Users\boopa\.gemini\antigravity\brain\c971f9ef-5bbf-4de6-879b-0b5fa349d1dd", "settings_modal_verified.png")
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
TARGET_URL = "https://main.d1wg12njfcjhfu.amplifyapp.com"

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=CHROME_PATH,
        headless=True
    )
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(TARGET_URL, wait_until="networkidle")
    page.wait_for_timeout(1000)

    # Login as Administrator
    page.locator("button:has-text('Administrator')").first.click()
    page.locator("input[placeholder*='admin'], input[type='text'], input[type='email']").first.fill("admin")
    page.locator("input[type='password']").first.fill("boopathi_2004")
    page.locator("button[type='submit']").first.click()
    page.wait_for_timeout(3500)

    # Open Settings Modal
    page.locator("button:has-text('Settings')").first.click()
    page.wait_for_timeout(1500)

    page.screenshot(path=SCREENSHOT_PATH)
    print(f"[OK] Settings modal screenshot saved: {SCREENSHOT_PATH}")
    browser.close()
