# CV builder

Generates a one-page A4 PDF CV from `cv.yaml`. Standalone from the website
(own `package.json`), but reuses shared assets (e.g. the profile photo) from
the repo root so nothing is duplicated.

Layout is two columns: a dark sidebar (photo, contact, skills, languages,
hobbies) and a light main column (profile summary, work experience,
projects, education).

## Editing

Open `cv.yaml`. It's organized into sections: `profile`, `summary`, `skills`,
`experience`, `projects`, `education`, `languages`, `hobbies`.

- **Every section is optional.** Delete a whole block (e.g. `projects:`,
  `hobbies:`) and it won't render — nothing here is mandatory. `contact`
  (phone/email/location/links) is drawn from `profile` and disappears the
  same way if those fields are absent.
- Fields like `summary`, `highlights`, and `note` support **markdown**
  (bold, italic, `[links](url)`).
- Asset paths (e.g. `profile.photo`) are written relative to this `cv/`
  directory — e.g. `../assets/me.jpg` points at the shared site asset.
- Move sections between columns (or drop them) with the optional `layout:`
  block — see the commented example at the bottom of `cv.yaml`. Default:
  sidebar = `[contact, skills, languages, hobbies]`, main =
  `[summary, experience, projects, education]`.

## Building

```sh
cd cv
npm install     # first time only
npm run build
```

This writes:

- `cv/dist/cv.html` — the intermediate HTML (for quick inspection in a browser)
- `cv/dist/cv.pdf` — the generated PDF
- `../assets/reports/CV.pdf` — copied automatically so the website can link it

The build prints a warning if the content overflows a single A4 page —
shorten `cv.yaml` (fewer entries, tighter wording) until the warning is gone.

## Linking from the site

The generated file lives at `assets/reports/CV.pdf`, served by GitHub Pages
at `https://rasmushogslatt.com/assets/reports/CV.pdf`. `index.html` links to
it directly — remember to re-run `npm run build` and commit the updated PDF
after editing `cv.yaml`.
