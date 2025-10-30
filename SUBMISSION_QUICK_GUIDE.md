# Quick Submission Guide - Action Items

## ⚠️ URGENT: Complete These 3 Things Before Submitting

### 1. 🎥 Record Demo Video (CRITICAL)

**Time Required:** 2-3 hours  
**Priority:** 🔴 HIGHEST

**Steps:**

1. Download OBS Studio (https://obsproject.com/) or use Loom
2. Prepare your script (see HACKATHON_SUBMISSION_CHECKLIST.md for content outline)
3. Record your screen showing:
   - Certificate issuance (2 min)
   - Certificate claiming (2 min)
   - Public verification (1.5 min)
   - Hedera integration (1.5 min)
4. Upload to YouTube
5. Get the video link
6. Update README.md line ~125:
   ```markdown
   - [YouTube Demo Video](https://youtu.be/YOUR_VIDEO_ID)
   ```

### 2. 📜 Add Team Certifications

**Time Required:** 30 minutes  
**Priority:** 🟡 HIGH

**Steps:**

1. Gather team members' certification links
2. Update README.md "Team" section (around line 1400)
3. Format:
   ```markdown
   **[Your Name]** - Founder & Lead Developer

   - [Hedera Certification](https://link-to-cert.com)
   - [Other Certification](https://link-to-cert.com)
   ```
4. If no certifications, list relevant experience

### 3. ✅ Test Complete User Flow

**Time Required:** 1 hour  
**Priority:** 🟡 HIGH

**Steps:**

1. Open incognito browser
2. Go to your deployed site
3. Complete full flow:
   - Sign up → DID setup → Issue cert → Claim cert → Verify
4. Test on mobile device
5. Test with HashPack and Blade wallets
6. Fix any bugs found

---

## 📝 README Updates Needed

**Find and replace these in README.md:**

```bash
# Search for these placeholders:
YOUR_VIDEO_ID
Add your video link here
Add your team's relevant certifications here
[Add your video]

# Replace with actual values
```

**Specific Lines to Update:**

- Line ~125: Demo video link
- Line ~130: Loom alternative link
- Line ~135-140: Certifications section
- Line ~1400-1420: Team section

---

## 🚀 When You're Ready to Submit

### BUIDL Platform Submission

**Required Information:**

1. **Project Title:**

   ```
   CertChain - Decentralized Certificate Verification on Hedera
   ```

2. **Short Description (150 chars):**

   ```
   Blockchain certificate verification eliminating fraud. 99.98% cost reduction. Instant verification. Built on Hedera HTS + HCS + DID.
   ```

3. **Long Description:**

   ```
   CertChain is a production-ready decentralized certificate verification platform built on Hedera Hashgraph. It addresses the $6B global credential fraud problem by issuing tamper-proof NFT certificates that are instantly verifiable. Key features: DID-based identity, IPFS storage, multi-wallet support, 2-5 second issuance, $0.01 per certificate (vs $50 traditional), and 10 deployed edge functions. Target market: 3,000+ African institutions and 50M+ students.
   ```

4. **Links:**

   ```
   GitHub: https://github.com/Josephjbassey/certchain
   Live Demo: https://certchain.pages.dev
   Video: [YOUR YOUTUBE LINK]
   Pitch Deck: https://gamma.app/docs/CertChain-zfg1c329e73e6jc
   ```

5. **Hedera Resources:**

   ```
   HTS Token: 0.0.7115182 (https://hashscan.io/testnet/token/0.0.7115182)
   HCS Topic: 0.0.7115183 (https://hashscan.io/testnet/topic/0.0.7115183)
   Operator: 0.0.6834167 (https://hashscan.io/testnet/account/0.0.6834167)
   ```

6. **Tech Stack:**
   ```
   React 18 + Vite, TypeScript, TailwindCSS, Supabase, Hedera SDK, IPFS/Pinata, Cloudflare Pages
   ```

---

## ✅ Pre-Submit Checklist

**Run through this 30 minutes before submitting:**

- [ ] GitHub repo is public
- [ ] README has no "TODO" or "YOUR\_" placeholders
- [ ] Demo video uploaded and linked
- [ ] Pitch deck link works
- [ ] Live demo is accessible
- [ ] All HashScan links work
- [ ] Test certificate issuance works
- [ ] Test certificate claiming works
- [ ] Test public verification works
- [ ] Mobile site works
- [ ] No console errors in production
- [ ] Team information complete
- [ ] Certifications added (or noted if none)

---

## 🎯 Submission Timeline Recommendation

**3 Days Before Deadline:**

- Record demo video
- Test everything thoroughly
- Fix critical bugs

**2 Days Before Deadline:**

- Update README with video link
- Add certifications
- Final documentation review

**1 Day Before Deadline:**

- Complete pre-submit checklist
- Fill out BUIDL submission form
- **SUBMIT** (don't wait until last minute!)

---

## 🆘 Emergency Contacts

**If Something Goes Wrong:**

1. **Hedera Discord:** https://hedera.com/discord

   - Channel: #hackathon
   - Ask for help from community

2. **Check GitHub Issues:**

   - Look for similar problems
   - Community may have solutions

3. **Hackathon Organizers:**
   - Check official Discord announcement
   - Follow submission guidelines carefully

---

## 💡 Final Tips

**Do:**

- ✅ Submit early (24h before deadline)
- ✅ Test on fresh browser/device
- ✅ Record video showing real features
- ✅ Highlight Hedera integration
- ✅ Show working testnet transactions

**Don't:**

- ❌ Wait until last minute
- ❌ Submit with broken features
- ❌ Leave placeholder text
- ❌ Forget to test on mobile
- ❌ Skip the demo video

---

## 🎬 Quick Video Recording Script

**Use this 5-minute script:**

**0:00-0:30** - Intro
"Hi, I'm [Name], creator of CertChain. We're solving credential fraud using Hedera blockchain."

**0:30-2:30** - Certificate Issuance
"Watch as I issue a certificate. It takes just 3 seconds..." [Show dashboard → Issue → NFT mint → HashScan]

**2:30-4:30** - Claiming
"Recipients get an email with a claim link..." [Show email → Claim page → Wallet connect → NFT transfer]

**4:30-5:30** - Verification
"Anyone can verify instantly..." [Show QR scan → Verification result → Blockchain proof]

**5:30-6:00** - Close
"CertChain: Tamper-proof credentials on Hedera. Thank you!"

---

**You've got this! 🚀**

Your project is already excellent. Just complete these final steps and submit with confidence.

**Questions?** Check HACKATHON_SUBMISSION_CHECKLIST.md for detailed guides.
