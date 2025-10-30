Tyre Shop Billing - Deploy Ready (plain)
---------------------------------------

This package is a deploy-ready plain billing app (frontend + backend) with render.yaml for one-click import on Render.com.

How to use:
1. Extract the zip and upload files to a new GitHub repo (name: wheelzoon-billing).
2. On Render, choose Import from GitHub and select this repo - Render will use render.yaml to create services.
3. After services are created, copy backend public URL and set frontend env var VITE_API_BASE to that URL, then redeploy frontend.
