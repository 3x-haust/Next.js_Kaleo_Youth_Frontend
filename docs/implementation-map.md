# KALEO YOUTH Home — Implementation Map

Source of truth: `designs/figma-data.json` (Figma file `cZAPpH8yhcV5PA2KtAfwJ2`, frame `63:6` 홈 1920×5885).
Design PNG: `designs/desktop.png`.

| Figma node (id) | Section | Component / file | Selector / anchor |
| --- | --- | --- | --- |
| 70:733 App / 102:1253 App Bar | Header (logo·nav·right logo) | `components/layout/Header.tsx` + `Header.module.css` | `[data-zone="global-nav"]`, `.navItem` (absolute, home) |
| 65:336 Background + 65:335 Glow | Hero background (photo·navy·white veil·under-glow) | `app/(site)/page.module.css` | `.heroImage`, `.heroShade`, `.heroShade::before/::after` |
| 65:205 title | Hero title / lead / CTA | `app/(site)/page.tsx` + `page.module.css` | `.heroTitle`, `.heroLead`, `.heroContent .button` |
| 66:345 소개 | About (bg photo, WE/GROW/TOGETHER, copy) | `app/(site)/page.tsx` + `page.module.css` | `.about`, `.growMark`, `.aboutCopy` |
| 98:3122 말씀 | Message (intro + sermon feature) | `app/(site)/page.tsx` + `page.module.css`, `components/media/YouTubeFacade.tsx` | `.sectionIntro`, `.featureFrame`, `.featureMeta` |
| 98:3123/98:3145 소개(J-Teen) | Worship band | `app/(site)/page.tsx` + `page.module.css` | `.worship`, `.worshipCopy` |
| 98:3048 갤러리 | Gallery (bg photo, 4 story cards) | `app/(site)/page.tsx` + `page.module.css` | `.gallery`, `.storyGrid`, `.story` |
| 73:1983 연락 | Contact (info rows·SNS·CTA·map visual) | `app/(site)/page.tsx` + `page.module.css` | `.contactCopy`, `.contactVisual` |
| 푸터 (y 5534) | Footer | `components/layout/Footer.tsx` + `Footer.module.css` | `.footer`, `.content` |

## Assets

| Figma hash / node | Used as | File |
| --- | --- | --- |
| 65:336 background | Hero photo | `public/images/hero/hero-worship.jpg` |
| 66:345 section fill | About bg (composite export) | `public/images/sections/about-bg.png` |
| 98:3048 section fill | Gallery bg (composite export) | `public/images/sections/gallery-bg.png` |
| 98:3134 feature | Message poster (composite export) | `public/images/sections/message-artwork.png` |
| 102:1228 footer logo | Church mark | `public/images/logo/church-mark.png` |
| 98:3062/3098/3103/3108 | Gallery cards | `public/images/gallery/design-story-{1..4}.jpg` |