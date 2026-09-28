# 01 — Creative Strategy

## 0. Asset inspection (step 1 of the execution command)

The repository was empty when production started. Nothing was supplied:

| Expected asset | Status | Decision |
|---|---|---|
| Reference image / video | **Not supplied** | Worked from the visual language named in the brief (§12, §32). Nothing was copied from any specific ad. |
| Brand purple asset | **Not supplied** | Picked a purple on purpose (see `10_color_system.md`). It lives in one token, `accent` in `src/config/theme.js`: change that value and re-render to rebrand. |
| Voice-over recording | **Not supplied** | **Not synthesized.** The brief forbids an AI voice, and the script is in the first person ("أنا نبنيلك", "راسلني"), so it has to be the owner's own voice. The ad is built VO-ready: a cue sheet, a teleprompter guide video and a one-command mix (`npm run export` picks up `audio/vo.wav`). |
| Creator footage / photos | **Not supplied** | All "work" imagery is generated as 3D product and cinematic stills with Three.js. It contains no people, no stock and no AI-generated faces. |
| Contact details | **Not supplied** | The CTA uses only «راسلني ونبداو.» plus a message-composer visual. The action is the Meta "Send message" button. |

## 1. Reference analysis (brief's named references → extracted grammar)

| Reference | What we take | What we refuse |
|---|---|---|
| Apple product film | One hero object per shot, generous white, slow controlled camera, type as the voice | Product worship with no story |
| Awwwards portfolios | Oversized names, serif/grotesk contrast, strict grid, hover-alive thumbnails | Experimental navigation that hurts clarity |
| Premium SaaS launch film | UI as the hero, a cursor-driven demo, builds that assemble in front of you | Blue gradients, dashboard clichés |
| Creator branding | Vertical content cards, personal voice, "available for projects" signals | Link-in-bio templates |

## 2. Audience

**Who:** Algerian and Maghrebi creators who already sell: UGC creators (mostly beauty and lifestyle), content creators, voice-over artists, influencers and creative freelancers. They already have work and skills. What they lack is a clean way to present them.

**Current workflow (which the ad has to mirror exactly):** they close deals in WhatsApp and Instagram DMs. They send Drive folders (and the client hits "Request access"), raw MP4s that need a 48 MB download, voice notes, PDFs of their rates and ten links in a row. The client has to dig through all of it just to work out who they are.

**Emotional path:** recognition ("that's literally me") → mild frustration → relief («لا.») → aspiration → pride → an easy next step. We never say the work is bad. We say the **presentation** lets it down.

## 3. Script analysis

The script is used verbatim. Line timing is estimated from syllable counts at a confident conversational pace (about 6.3–6.8 syllables per second in fast lines, with natural pauses).

| # | Line | Job | ≈Syll. | Slot |
|---|---|---|---|---|
| 1 | إذا كنت UGC Creator، Content Creator، Voice Over Artist ولا Influencer… | Identify | 25 | 0.15–3.95 |
| 2 | ومازال تبعث خدمتك للـ Clients في Google Drive وWhatsApp، لازم تبدل هاد الطريقة. | Problem | 26 | 4.05–8.10 |
| 3 | Videos هنا… Files هنا… Links هنا… | Chaos rhythm | 9 | 8.30–10.80 |
| 4 | والـ Client لازم يقعد يقلب باش يفهم شكون نتا وشنو تقدم؟ | Client friction | 20 | 10.95–14.10 |
| 5 | لا. | Pattern interrupt | 1 | 14.45 |
| 6 | خدمتك تستاهل Presentation أحسن. | Insight | 12 | 15.35–17.35 |
| 7 | أنا نبنيلك Premium Website Portfolio من الصفر، مصمم حولك وحول خدمتك. | Service reveal | 27 | 17.55–21.55 |
| 8 | أفضل Work تاعك، خدماتك، معلوماتك وStyle تاعك… كلش منظم في تجربة واحدة. | System | 26 | 21.75–26.25 |
| 9 | بدل ما تبعث 10 Links… | Contrast | 9 | 26.45–27.85 |
| 10 | تبعث Link واحد. | One link | 5 | 28.05–29.05 |
| 11 | يفتحه الـ Client… ويشوف Portfolio احترافي ومختلف. | Client experience | 20 | 29.30–32.00 |
| 12 | خلي خدمتك تبان كيما تستاهل. | Payoff | 12 | 32.25–33.95 |
| 13 | راسلني ونبداو. | CTA | 6 | 34.15–35.10 |

Total runtime is **36.3 s** (speech ends at 35.1 s, then the end card holds). This matches the brief's own scene plan, which ends at 0:36.

**Darija QA.** The wording is unchanged. There is one spelling normalization: line 10 «تبعت» → «تبعث». Lines 2 and 9 both use «تبعث», and a caption that switches spelling looks like a typo. The pronunciation is unchanged. A hair space is set between a joined Arabic prefix and an English word («و WhatsApp»), so the two scripts never collide on screen.

## 4. Three creative directions

**A — ONE CANVAS.** The whole ad is one continuous editorial surface with no hard cuts. The same white page fills up with Drive and WhatsApp debris, freezes on «لا.», collapses into a single purple point, and a portfolio grows from that point. Chaos and clarity happen in the same place, so the contrast needs no explanation.

**B — GLASS LINKS.** This is a 3D object metaphor. Links are glass capsules that orbit, collide and overflow, then fuse into one capsule that becomes the website. It looks like a product film.

**C — THE CLIENT'S PHONE.** The story is told inside the client's WhatsApp: a flood of files, voice notes and Drive links. The client scrolls and gets lost. Then one link arrives, and one tap opens the portfolio.

| Criterion (0–10) | A | B | C |
|---|---|---|---|
| Immediate audience recognition | 9 | 6 | 10 |
| Clarity with sound off | 9 | 6 | 8 |
| Retention (curve of novelty) | 8 | 8 | 8 |
| Premium perception | 9 | 9 | 6 |
| Service demonstration ("he BUILDS it") | 10 | 6 | 7 |
| Emotional contrast (chaos → clarity) | 9 | 8 | 7 |
| CTA strength | 8 | 7 | 9 |
| Production risk (lower = riskier) | 8 | 5 | 8 |
| **Total / 80** | **70** | **55** | **63** |

**Selected: A — ONE CANVAS**, with the two strongest beats from the other directions folded in:
- from **C**: the client-POV friction details («Request access», «Downloading 48 MB», endless scroll) and a callback, where the client's unanswered questions come back answered with ticks;
- from **B**: the signature physical merge, where ten URLs fuse into one, the URL stretches into a browser, and the portfolio opens.

B was rejected as the lead because it is abstract. Without sound, a viewer would not recognize their own Drive/WhatsApp workflow. C was rejected as the lead because the phone frame boxes in both the typography and the build sequence.

## 5. Devices that carry the idea

1. **Colour arc: purple = clarity.** Purple appears as a promise in the hook, drains out during the chaos (third-party UI colours take over), and comes back as ONE purple point, the full stop of «لا.». That point seeds the portfolio.
2. **Motion arc: chaos moves fast, clarity moves with control.** Chaos uses hard ease-outs, overlap, jitter and cuts. Clarity uses critically damped springs with no overshoot, long ease-in-outs, and everything snaps to a grid.
3. **The full stop.** The dot of «لا.» becomes the full stop of «Presentation أحسن.», which becomes the seed of the website.
4. **The callback.** In the chaos the client asks "Who are you?", "What do you offer?" and "Where's the best work?". In the client experience scene the same questions come back ticked.
5. **Captions as design.** Wherever the scene's own typography already says the line (hook, «هنا», «لا.», «10 Links», «Link واحد», the CTA), the caption is removed. Everywhere else it is a karaoke-timed line with semantic emphasis: ink for problem words, purple for solution words.
