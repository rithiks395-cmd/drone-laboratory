# UAV VIRTUAL LAB – PUBLIC HOSTING & SHARING GUIDE

This guide explains how to host the **UAV Virtual Lab** online so that all your teammates, classmates, and professors can access the platform and fly drones from anywhere in the world.

---

## 🚀 METHOD 1: Netlify Drop (FASTEST — Takes 30 Seconds, No CLI Needed)

The production build is already compiled into the `dist/` folder!

1. Open **[https://app.netlify.com/drop](https://app.netlify.com/drop)** in your web browser.
2. Open Windows File Explorer and navigate to:
   ```
   C:\Users\ELCOT\Documents\drone-laboratory
   ```
3. **Drag and drop the `dist` folder** directly into the upload area on Netlify.
4. Netlify will publish your site in 10 seconds and give you a live public URL (e.g. `https://uav-virtual-lab-2026.netlify.app`).
5. You can change the subdomain in *Site settings > Change site name* to whatever you like.

---

## ⚡ METHOD 2: Vercel with GitHub (RECOMMENDED — Professional & Auto-Updates)

1. **Create a GitHub Repository:**
   - Go to [https://github.com/new](https://github.com/new)
   - Name it `drone-laboratory` and set to Public or Private.
2. **Push your code to GitHub:**
   Run these commands in PowerShell inside `C:\Users\ELCOT\Documents\drone-laboratory`:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/drone-laboratory.git
   git branch -M main
   git push -u origin main
   ```
3. **Deploy on Vercel:**
   - Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
   - Click **"Add New..."** > **"Project"**.
   - Select your `drone-laboratory` repository.
   - Framework Preset will be automatically detected as **Vite**.
   - Click **"Deploy"**.
4. In under 1 minute, you will have a live URL like `https://drone-laboratory.vercel.app`!
   - Every time you commit changes, Vercel updates the website automatically.

---

## 🔗 METHOD 3: Instant Live Tunnel (Test with Teammates Right Now)

If you want your teammates to test right this second while you are running Vite locally:

1. In PowerShell, run:
   ```bash
   npx localtunnel --port 5173
   ```
2. It will output a public URL such as `https://happy-drone-42.loca.lt`.
3. Send that link to your teammates. They can open it on their phones or laptops immediately!

---

## 📱 How Teammates Use the Mobile Controller on Hosted Sites

When hosted on Netlify or Vercel:
1. One teammate opens `https://your-domain.vercel.app` on their laptop screen (Flight Simulator).
2. They click **"📱 Phone Joystick"** to see the QR code.
3. On their phone (connected to 4G/5G or any Wi-Fi), they scan the QR code.
4. The phone immediately loads the dual-stick RC flight controller and pairs with the laptop via low-latency WebRTC!
