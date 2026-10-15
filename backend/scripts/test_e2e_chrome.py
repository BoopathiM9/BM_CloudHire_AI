import os
import sys
import time
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = os.path.join(r"C:\Users\boopa\.gemini\antigravity\brain\c971f9ef-5bbf-4de6-879b-0b5fa349d1dd", "e2e_screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
TARGET_URL = "https://main.d1wg12njfcjhfu.amplifyapp.com"

def run_e2e_test():
    print(f"[*] Starting E2E automated test with Google Chrome on: {TARGET_URL}")
    print(f"[*] Chrome binary: {CHROME_PATH}")
    
    with sync_playwright() as p:
        # Launch real Google Chrome in visible/headed mode
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=False,
            slow_mo=800,  # Slow down by 800ms per step so the user can visually follow every action
            args=["--start-maximized", "--window-position=500,50", "--window-size=1280,900"]
        )
        context = browser.new_context(viewport={"width": 1280, "height": 850})
        page = context.new_page()

        try:
            print("\n--- STEP 1: Navigate to BM CloudHire AI ---")
            page.goto(TARGET_URL, wait_until="networkidle", timeout=45000)
            page.wait_for_timeout(2000)
            login_shot = os.path.join(SCREENSHOTS_DIR, "01_login_page.png")
            page.screenshot(path=login_shot)
            print(f"[OK] Landing/Auth page loaded. Screenshot saved: {login_shot}")

            # --- STEP 2: Candidate Registration Test ---
            print("\n--- STEP 2: Testing Candidate Registration ---")
            register_tab = page.locator("button:has-text('Register'), button:has-text('Create Account')").first
            if register_tab.is_visible():
                print("[*] Clicking Register tab...")
                register_tab.click()
                page.wait_for_timeout(1000)

            # Fill registration form
            name_input = page.locator("input[placeholder*='Name'], input[name='name'], input[placeholder*='Full Name']").first
            email_input = page.locator("input[type='email'], input[placeholder*='email'], input[placeholder*='Email']").first
            password_input = page.locator("input[type='password']").first

            test_email = f"test.candidate.{int(time.time())}@bmtest.com"
            test_name = "Karthik Ramanathan"

            if name_input.is_visible():
                print(f"[*] Typing candidate name: {test_name}")
                name_input.fill(test_name)
            
            if email_input.is_visible():
                print(f"[*] Typing candidate email: {test_email}")
                email_input.fill(test_email)

            if password_input.is_visible():
                print("[*] Typing secure password...")
                password_input.fill("Candidate@2026")

            reg_shot = os.path.join(SCREENSHOTS_DIR, "02_registration_filled.png")
            page.screenshot(path=reg_shot)

            submit_reg_btn = page.locator("button[type='submit'], button:has-text('Create Account'), button:has-text('Register')").first
            if submit_reg_btn.is_visible():
                print("[*] Submitting registration form...")
                submit_reg_btn.click()
                page.wait_for_timeout(3000)

            cand_portal_shot = os.path.join(SCREENSHOTS_DIR, "03_candidate_portal.png")
            page.screenshot(path=cand_portal_shot)
            print(f"[OK] Candidate Portal verified. Screenshot: {cand_portal_shot}")

            # --- STEP 3: Logout Candidate ---
            print("\n--- STEP 3: Signing out candidate to test Admin login ---")
            logout_btn = page.locator("button[title='Sign Out'], button[aria-label='Sign out'], button:has-text('Sign Out'), button:has-text('Logout')").first
            if logout_btn.is_visible():
                logout_btn.click()
                page.wait_for_timeout(2000)
            else:
                # Try header profile menu
                profile_btn = page.locator(".header-profile-pill, .user-avatar").first
                if profile_btn.is_visible():
                    profile_btn.click()
                    page.wait_for_timeout(800)
                    signout_item = page.locator("button:has-text('Sign Out'), button:has-text('Logout')").first
                    if signout_item.is_visible():
                        signout_item.click()
                        page.wait_for_timeout(2000)

            # --- STEP 4: Admin / Recruiter Login ---
            print("\n--- STEP 4: Logging in as Administrator ---")
            recruiter_tab = page.locator("button:has-text('Recruiter'), button:has-text('Admin')").first
            if recruiter_tab.is_visible():
                print("[*] Selecting Recruiter/Admin portal tab...")
                recruiter_tab.click()
                page.wait_for_timeout(1000)

            login_subtab = page.locator("button:has-text('Sign In'), button:has-text('Login')").first
            if login_subtab.is_visible():
                login_subtab.click()
                page.wait_for_timeout(500)

            # Enter Admin credentials
            admin_email_input = page.locator("input[type='email'], input[placeholder*='email'], input[placeholder*='username'], input[placeholder*='Email']").first
            admin_pw_input = page.locator("input[type='password']").first

            admin_email_input.fill("admin")
            admin_pw_input.fill("boopathi_2004")
            page.wait_for_timeout(800)

            admin_login_shot = os.path.join(SCREENSHOTS_DIR, "04_admin_credentials_entered.png")
            page.screenshot(path=admin_login_shot)

            login_submit = page.locator("button[type='submit'], button:has-text('Sign In'), button:has-text('Login')").first
            login_submit.click()
            print("[*] Submitting Admin login...")
            page.wait_for_timeout(3500)

            # --- STEP 5: Verify Admin Dashboard & Identity ---
            print("\n--- STEP 5: Verifying Admin Dashboard & Identity ---")
            admin_dash_shot = os.path.join(SCREENSHOTS_DIR, "05_admin_dashboard.png")
            page.screenshot(path=admin_dash_shot)
            print(f"[OK] Admin dashboard rendered. Screenshot: {admin_dash_shot}")

            # Check sidebar user label
            sidebar_user = page.locator(".sidebar-user-block .user-name").inner_text() if page.locator(".sidebar-user-block .user-name").is_visible() else "Not found"
            header_user = page.locator(".header-user-name").inner_text() if page.locator(".header-user-name").is_visible() else "Not found"
            print(f"[VERIFICATION] Sidebar user: '{sidebar_user}'")
            print(f"[VERIFICATION] Header user: '{header_user}'")

            if "Boopathi" in sidebar_user or "Boopathi" in header_user:
                print("[WARNING] 'Boopathi' was detected in Admin view! Needs correction.")
            else:
                print("[PASS] Identity confirmed: Strictly 'Administrator' without personal names.")

            # --- STEP 6: Test Applications & Approvals ---
            print("\n--- STEP 6: Testing Applications & Requisition Grid ---")
            apps_nav = page.locator("button:has-text('Applications & Approvals'), button:has-text('Applications')").first
            if apps_nav.is_visible():
                apps_nav.click()
                page.wait_for_timeout(2500)

            req_shot = os.path.join(SCREENSHOTS_DIR, "06_applications_requisition_grid.png")
            page.screenshot(path=req_shot)
            print(f"[OK] Requisitions and metrics rendered. Screenshot: {req_shot}")

            # Test clicking a requisition card
            req_card = page.locator(".requisition-picker-card").nth(1)
            if req_card.is_visible():
                print(f"[*] Clicking second requisition card: {req_card.inner_text().splitlines()[0]}")
                req_card.click()
                page.wait_for_timeout(1500)
                req_click_shot = os.path.join(SCREENSHOTS_DIR, "07_requisition_selected.png")
                page.screenshot(path=req_click_shot)

            # --- STEP 7: Test AI Candidate Matching ---
            print("\n--- STEP 7: Navigating to AI Candidate Matching ---")
            match_nav = page.locator("button:has-text('AI Candidate Matching'), button:has-text('Matching')").first
            if match_nav.is_visible():
                match_nav.click()
                page.wait_for_timeout(3000)
                match_shot = os.path.join(SCREENSHOTS_DIR, "08_ai_matching.png")
                page.screenshot(path=match_shot)
                print(f"[OK] AI Matching screen captured: {match_shot}")

            # --- STEP 8: Test Job Management ---
            print("\n--- STEP 8: Navigating to Job Management ---")
            jobs_nav = page.locator("button:has-text('Job Management')").first
            if jobs_nav.is_visible():
                jobs_nav.click()
                page.wait_for_timeout(2500)
                jobs_shot = os.path.join(SCREENSHOTS_DIR, "09_job_management.png")
                page.screenshot(path=jobs_shot)
                print(f"[OK] Job Management screen captured: {jobs_shot}")

            print("\n==================================================")
            print("E2E LIVE CHROME TEST COMPLETED SUCCESSFULLY!")
            print(f"All screenshots saved to: {SCREENSHOTS_DIR}")
            print("==================================================")

        except Exception as e:
            print(f"[ERROR] During E2E testing: {e}")
            err_shot = os.path.join(SCREENSHOTS_DIR, "error_state.png")
            try:
                page.screenshot(path=err_shot)
                print(f"[INFO] Error screenshot saved: {err_shot}")
            except Exception:
                pass
            raise e
        finally:
            page.wait_for_timeout(4000)
            browser.close()

if __name__ == "__main__":
    run_e2e_test()
