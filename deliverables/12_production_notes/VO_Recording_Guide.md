# VO Recording Guide

The ad is finished and **VO-ready**. The one thing it still needs is your voice.

**Why your voice and not a voice actor or AI:** the script is first-person («أنا نبنيلك…», «راسلني ونبداو»). The brief asks for a real Algerian creative professional talking to another creator, and explicitly rules out an AI voice. The person who will answer the messages should be the one inviting them.

## What to record

The script is verbatim, with one spelling normalization for the captions only (line 10 «تبعت» → «تبعث»; pronounce it however you naturally do).

| Line | Say it like… | Target window | Length |
|---|---|---|---|
| **1** إذا كنت UGC Creator، Content Creator، Voice Over Artist ولا Influencer… | **Direct.** Talking to one creator. A light beat after each role. | 0.15 – 3.95 | 3.8 s |
| **2** ومازال تبعث خدمتك للـ Clients في Google Drive وWhatsApp، لازم تبدل هاد الطريقة. | **Slightly faster**, knowing, a little amused. Land «لازم تبدل». | 4.05 – 8.10 | 4.0 s |
| **3** Videos هنا… Files هنا… Links هنا… | **Rhythmic.** Three even beats, a small pause after each «هنا». | 8.30 – 10.80 | 2.5 s |
| **4** والـ Client لازم يقعد يقلب باش يفهم شكون نتا وشنو تقدم؟ | Put yourself in the client's shoes. A real question at the end. | 10.95 – 14.10 | 3.2 s |
| **5** لا. | **Very deliberate.** Short, calm, final. Not shouted. A clean stop before and after. | 14.45 | 0.4 s |
| **6** خدمتك تستاهل Presentation أحسن. | Warm, confident. Breathe first. | 15.35 – 17.35 | 2.0 s |
| **7** أنا نبنيلك Premium Website Portfolio من الصفر، مصمم حولك وحول خدمتك. | **Confident**, a little proud. Stress «أنا نبنيلك» and «حولك». | 17.55 – 21.55 | 4.0 s |
| **8** أفضل Work تاعك، خدماتك، معلوماتك وStyle تاعك… كلش منظم في تجربة واحدة. | **Premium, unhurried.** A list with commas you can hear, then settle on «تجربة واحدة». | 21.75 – 26.25 | 4.5 s |
| **9** بدل ما تبعث 10 Links… | Light, almost a smile. | 26.45 – 27.85 | 1.4 s |
| **10** تبعث Link واحد. | Clean and simple. The satisfying one. | 28.05 – 29.05 | 1.0 s |
| **11** يفتحه الـ Client… ويشوف Portfolio احترافي ومختلف. | Visual: you're describing what they see. | 29.30 – 32.00 | 2.7 s |
| **12** خلي خدمتك تبان كيما تستاهل. | **The emotional line.** Slower, sincere. | 32.25 – 33.95 | 1.7 s |
| **13** راسلني ونبداو. | **Friendly invitation**, a smile in the voice. Not a sales push. | 34.15 – 35.10 | 1.0 s |

Natural beats you're allowed to take: after «Influencer…», after each «هنا…», before «لا.», after «Link واحد.». **Don't rush to hit numbers.** A natural read that runs ±0.5 s is fine, because the timeline re-times to your take (see below).

## How to record (10 minutes)

1. **Room:** a quiet, soft room: a closet of clothes, or a bedroom with curtains. Avoid tiles and empty rooms.
2. **Mic:** any decent USB mic, or your phone's voice memo app. Hold it 15–20 cm from your mouth, slightly off-axis to avoid pops.
3. **Headphones on.** Play `VO_Guide_Teleprompter_9x16.mp4` on a laptop or second screen. It counts **3-2-1**, plays a short **beep (the "2-pop") at the "2"**, then shows each line with a progress bar as the ad plays under you at low volume.
4. **Start recording before you press play**, so the beep ends up in your file. Read along with the teleprompter. Do three takes and keep the best one, or combine lines.
5. **Export:** WAV 48 kHz / 24-bit (44.1 kHz and 16-bit are accepted too). Mono or stereo.

## How to drop it in

1. Trim the recording so that it **starts exactly 2.000 s after the beep** (the beep marks t = −2 s). Or send me the raw file and I'll align it.
2. Save it as `audio/vo.wav`.
3. Run `npm run export`. The mix is re-built with the VO on top and the music ducked under it, mastered to −14 LUFS, and every deliverable is re-encoded.

## Fine-tuning the edit to your read (optional, recommended)

If your natural pacing differs, open `src/config/timeline.json` and set each phrase's `t` to your real in/out times (read them off a waveform in Audacity, Premiere or CapCut). Scenes, captions, SRT, the teleprompter and sound design all follow automatically on the next `npm run export`. Keep `markers.freeze` equal to the start of your «لا».

## Darija notes

- «مازال تبعث»: «مازالك تبعث» is also natural if that's how you speak. The captions can be changed in `timeline.json`.
- «وشنو تقدم؟»: say it the way you normally say «واش/شنو»; keep the rising question.
- English terms (UGC Creator, Clients, Google Drive, WhatsApp, Premium Website Portfolio, Link, Style, Work) should sound like you use them every day, not like announcements.
