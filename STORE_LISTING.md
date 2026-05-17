# Play Store Listing — AI Photo Editor

## App Name
AI Photo Editor

## Short Description (80 chars max)
Professional photo editing powered by Claude AI — for everyone.

## Full Description (4000 chars max)
AI Photo Editor puts professional-grade editing tools and AI intelligence in your pocket.

**Edit with precision**
• Brightness, contrast, saturation, hue, sharpness, vignette, blur
• Freehand drawing with 8 colors and 4 brush sizes
• Text overlays and emoji stickers — drag to reposition
• Rotate, flip, and free-rotate with a smooth slider
• Aspect-ratio crop (Free, 1:1, 4:3, 3:2, 16:9)
• Undo/redo with a visual history timeline

**AI-powered features (Claude by Anthropic)**
• Auto-caption: Get a description, mood, and keywords for any photo
• Smart enhance: AI-suggested brightness/contrast/saturation adjustments
• Object recognize: Identify objects, scenes, and dominant colors
• Background detect: Locate your photo's subject automatically

**Filters and presets**
• 6 built-in filter presets (Vivid, Noir, Warm, Cool, Sharp, Fade)
• Save your own custom presets and sync them across devices

**Export your way**
• JPEG, PNG, or WebP format
• Quality control from 60% to 100%
• Resize to Full / 2048 / 1080 / 720 px (long edge)
• Save to camera roll or share to any app

**Cloud & profile**
• Sign in with Google
• Edits automatically backed up to the cloud
• Browse your editing history in the Profile tab

**Secure and private**
• Your API calls are routed through our secure server — your Anthropic API key is never stored on your device
• Photos are only uploaded to the cloud when you explicitly export

---

## Category
Photography

## Content Rating
Everyone (no objectionable content)

## Tags / Keywords
photo editor, AI photo, image editor, filters, crop, brightness, Claude AI, photo enhance, camera roll, stickers

## Privacy Policy URL
https://aiphotoedit.app/privacy

## Support Email
support@aiphotoedit.app

---

## What's New (version 1.0.0)
Initial release of AI Photo Editor — professional editing tools powered by Claude AI.

---

## Checklist Before Submission
- [ ] Replace `your-eas-project-id` in app.json with actual EAS project ID (`eas init`)
- [ ] Add real `google-services.json` (from Firebase Console → Android app)
- [ ] Add real `GoogleService-Info.plist` (iOS, from Firebase Console)
- [ ] Add `google-play-service-account.json` for automated Play Store submission
- [ ] Create and upload app icon (512×512 PNG, no rounded corners — Play Store adds them)
- [ ] Create feature graphic (1024×500 PNG)
- [ ] Take 2–8 screenshots per device size (phone + 7-inch tablet)
- [ ] Set ANTHROPIC_API_KEY in EAS secrets: `eas secret:create --name ANTHROPIC_API_KEY --value sk-...`
- [ ] Set FIREBASE_SERVICE_ACCOUNT_JSON in EAS secrets
- [ ] Publish a privacy policy at the URL above
- [ ] Run `eas build --platform android --profile production`
- [ ] Test the production AAB on a real device via internal track
- [ ] Submit via `eas submit --platform android --profile production`
