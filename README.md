# Fanatikoin - Team Token Marketplace

**Fanatikoin** is a next-generation sports fan platform on the Chiliz blockchain. Fans can buy, sell, and auction team tokens, participate in fan engagement activities, and support their favorite teams in a gamified, secure, and transparent environment.

---

## 🚀 Demo & Judge Instructions

- **Live Demo:** [Netlify Deploy Link](https://your-netlify-link.netlify.app) *(replace with your actual link)*
- **Test Accounts:** See below or use your own wallet (Chiliz Spicy Testnet)
- **Quick Start:**
  1. Connect your wallet (MetaMask or Web3Auth)
  2. Register as a fan or team
  3. Explore the marketplace and auctions
  4. Try creating a team token or reward (team role)
  5. View analytics and engagement features

---

## 🏆 Hackathon Judging Criteria
- **Innovation:** Fan engagement, auctions, and marketplace features
- **Technical Excellence:** Robust blockchain integration, error handling, and fallback logic
- **User Experience:** Responsive, multilingual UI (EN/ES), easy onboarding
- **Reliability:** Mock data fallback for demos, handles blockchain/network errors gracefully
- **Documentation:** Clear setup, usage, and roadmap for hackathon and launch

---

## 🔑 Features
- Buy, sell, and auction team tokens
- Team dashboard: create rewards, manage engagement, view analytics
- Mock/fallback data for reliable demos
- Wallet connection via MetaMask & Web3Auth
- Email and wallet-based registration
- Admin tools and analytics (post-hackathon)

---

## ⚙️ Tech Stack
- **Frontend:** Next.js, React, TailwindCSS
- **Blockchain:** Chiliz Chain, Ethers.js, Web3.js
- **Backend:** MongoDB Atlas (user/registration)
- **Testing:** Jest, React Testing Library, Playwright (planned)
- **Deployment:** Netlify

---

## 📝 Setup & Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/rodrigojille/fanatikoin.git
   cd fanatikoin
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in required values (see ROADMAP.md)
4. **Run locally:**
   ```sh
   npm run dev
   ```

---

## 👥 Team & Contact
- Rodrigo Jille (Lead Dev)
- [Add other team members here]
- Contact: [your-email@example.com]

---

## 📅 Milestones & Roadmap
See [ROADMAP.md](./ROADMAP.md) and [MILESTONES.md](./MILESTONES.md) for detailed goals and launch plan.

---

## 🧪 Test Accounts (for Judges)
- **Wallet:** Use MetaMask with Chiliz Spicy Testnet (Chain ID: 88882)
- **Email Registration:** Any valid email (for demo)
- **Mock Data:** Marketplace and auctions work even if blockchain is unavailable

---

## 🙏 Thanks for Judging!
If you have any questions or need help during your evaluation, please reach out via GitHub Issues or the contact email above.

3. Run the development server
```
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Next.js pages
- `/src/contracts` - Smart contract interfaces and ABIs
- `/src/utils` - Utility functions
- `/src/assets` - Static assets like images
- `/public` - Public files served at the root

## Deployment

Instructions for deploying to production will be added soon.

## License

[MIT](LICENSE)
