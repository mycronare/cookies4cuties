# Cookies for Cuties 🍪

Online storefront and admin dashboard for **Cookies for Cuties**, a small cookie shop with pickup locations in Pampanga, Katipunan, and Rockwell.

Customers pick their cookies, check out, and pay by QR code or cash on pickup. The shop owner manages incoming orders from a private dashboard.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Backend | FastAPI + Supabase (separate repo: `cookies4cuties_server`) |
| Hosting | Vercel |

## Features

- Browse cookies and add them to an order
- Checkout with order summary and pickup locations
- Pay by QR code (with proof-of-payment upload) or cash on pickup
- Admin dashboard at `/admin` to filter, sort, and update orders, verify payments, and view proof of payment

## Deployment

The site deploys to Vercel from this repo. Set the environment variables above in the Vercel project settings and redeploy after changing them. `vercel.json` rewrites all routes to `index.html` so `/admin` works on refresh.

## Find us

- Instagram: [@cookiesforcuties_](https://instagram.com/cookiesforcuties_)
- Branding: [Cookies for Cuties]([https://www.behance.net/your-name](https://www.behance.net/gallery/258208361/Cookies-for-Cuties))

Designed and built by Audrey 🤍 done with my better half, [Elijah Galang](https://github.com/jijahh/cookies4cuties_server), who made the backend server handling email confirmations and database management.
