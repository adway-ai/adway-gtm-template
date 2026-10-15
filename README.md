# Adway tag template for Google Tag Manager

Installs Adway on a career site through Google Tag Manager:

- **Adway Apply** lights the page's own Apply buttons and opens the Adway Apply form over the page, for every open Adway job whose posting is that page. It works before any cookie consent.
- **Tracking** (Adway's Meta pixel and visit beacon) waits for the visitor's marketing consent. With Google Consent Mode it follows `ad_storage` and `ad_user_data`, so a consent tool that supports Consent Mode v2 (Cookiebot, CookieYes, OneTrust, Usercentrics and others) needs no setup.

## Install in a GTM container (no Google approval needed)

1. In GTM, open **Templates → Tag Templates → New**, open the ⋮ menu and choose **Import**. Pick `template.tpl` and save.
2. Open **Tags → New**, choose the **Adway** template and fill in:
   - **Adway workspace ID**: in Adway, Audiences → Tracking, the value after `wid=` in the snippet.
   - **Adway Apply**: *Apply buttons and the Apply bar* (default), *Apply buttons only*, or *Off*.
   - **Cookie consent**: keep *Google Consent Mode* unless the site's consent tool speaks IAB TCF v2.2 or the site calls `Adway.consent(...)` itself.
3. **Trigger:** *Initialization – All Pages*.
4. **Consent settings** (under Advanced settings): *No additional consent required*. Adway Apply must load before consent; the template holds tracking back itself. Requiring `ad_storage` here would hide Apply from visitors who have not answered the cookie banner.
5. Preview, then publish the container.

On the career pages, mark the Apply buttons:

```html
<button type="button" data-adway-apply hidden>Apply now</button>
<p data-adway-apply-fallback>Applications opening soon</p>
```

A button without a value means the current page's job (its canonical URL). A link keeps its own `href` when the page has no Adway job; any other element stays hidden.

## Develop

`node scripts/test-template.mjs` runs the template's own test scenarios against its code. GTM's sandbox is not reproduced: import the template into a container and run its **Tests** tab before publishing.

## Community Template Gallery

The gallery needs this template in the root of a public GitHub repository with `metadata.yaml` and an Apache 2.0 `LICENSE`, then a submission that Google reviews. Until then, import `template.tpl` directly as above.
