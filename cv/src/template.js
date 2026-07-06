// Pure HTML-string renderers for a two-column CV: a dark sidebar (photo,
// contact, skills, languages, hobbies) and a light main column (profile
// summary, work experience, projects, education). Every "content" renderer
// returns '' when its data is missing/empty, so absent sections simply
// disappear — and because section wrapping (title + column styling) is
// applied generically in renderSection(), any section can be placed in
// either column via cv.yaml's optional `layout:` override.

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// ---- Icons (inline SVG, offline-safe, inherit currentColor) ----------------

const ICON_PATHS = {
  phone:
    '<path d="M5 4h3.2l1.6 4-2 2c1 2.4 2.8 4.2 5.2 5.2l2-2 4 1.6V19a2 2 0 0 1-2 2C9.6 21 3 14.4 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 6l10 7 10-7"/>',
  pin: '<path d="M12 22s7-7.58 7-12A7 7 0 0 0 5 10c0 4.42 7 12 7 12z"/><circle cx="12" cy="10" r="2.3"/>',
  link:
    '<path d="M10 14a3.5 3.5 0 0 0 5 .3l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5"/><path d="M14 10a3.5 3.5 0 0 0-5-.3l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5"/>',
};

function icon(name) {
  const path = ICON_PATHS[name];
  if (!path) return '';
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

// ---- Sidebar header (photo / name / title) — always pinned at the top -----

function renderSidebarHeader(profile) {
  if (!profile) return '';
  const photo =
    profile.photo &&
    `<img class="photo" src="${esc(profile.photo)}" alt="${esc(profile.name || '')}" />`;
  return `
    <div class="sidebar-header">
      ${photo || ''}
      ${profile.name ? `<h1>${esc(profile.name)}</h1>` : ''}
      ${profile.title ? `<p class="title">${esc(profile.title)}</p>` : ''}
    </div>`;
}

// ---- Content renderers — return inner HTML only, no wrapper/heading -------
// (renderSection() below adds the <section><h2> wrapper with the right
// column styling, so these stay agnostic of which column they land in.)

function renderContactContent(profile) {
  if (!profile) return '';
  const rows = [];
  if (profile.phone) {
    const tel = esc(profile.phone.replace(/[^+\d]/g, ''));
    rows.push(['phone', `<a href="tel:${tel}">${esc(profile.phone)}</a>`]);
  }
  if (profile.email) {
    rows.push(['mail', `<a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>`]);
  }
  if (profile.location) {
    rows.push(['pin', esc(profile.location)]);
  }
  for (const link of profile.links || []) {
    rows.push(['link', `<a href="${esc(link.url)}">${esc(link.label || link.url)}</a>`]);
  }
  if (!rows.length) return '';
  return `<div class="contact-list">${rows
    .map(([iconName, html]) => `<div class="contact-row">${icon(iconName)}<span>${html}</span></div>`)
    .join('')}</div>`;
}

function renderSkillsContent(skills) {
  if (!skills || !Object.keys(skills).length) return '';
  const groups = Object.entries(skills).filter(([, items]) => items && items.length);
  if (!groups.length) return '';
  return groups
    .map(
      ([group, items]) => `
      <div class="skill-group">
        <p class="skill-group-label">${esc(group)}</p>
        <ul class="skill-items">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      </div>`
    )
    .join('');
}

function renderLanguagesContent(languages) {
  if (!languages || !languages.length) return '';
  return `<div class="lang-list">${languages
    .map(
      (l) => `
      <div class="lang-row">
        <span class="lang-name">${esc(l.name)}</span>
        ${l.level ? `<span class="lang-level">${esc(l.level)}</span>` : ''}
      </div>`
    )
    .join('')}</div>`;
}

function renderHobbiesContent(hobbies) {
  if (!hobbies || !hobbies.length) return '';
  return `<ul class="hobby-list">${hobbies.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`;
}

function renderSummaryContent(summary, md) {
  if (!summary) return '';
  return md(summary);
}

// "Role | Company" on one line, period right-aligned — a clear pipe
// separator (no em-dashes) keeps the employer unambiguous without a
// second row.
function renderEntryHeadWithMeta(title, metaPrimary, metaPeriod) {
  const heading = metaPrimary
    ? `<span class="entry-title">${title}</span><span class="entry-org"> | ${metaPrimary}</span>`
    : `<span class="entry-title">${title}</span>`;
  return `
        <div class="entry-head">
          <span class="entry-heading">${heading}</span>
          ${metaPeriod ? `<span class="entry-period">${metaPeriod}</span>` : ''}
        </div>`;
}

function renderExperienceContent(experience, md) {
  if (!experience || !experience.length) return '';
  return experience
    .map((job) => {
      const highlights =
        job.highlights && job.highlights.length
          ? `<ul class="highlights">${job.highlights.map((h) => `<li>${md(h, true)}</li>`).join('')}</ul>`
          : '';
      return `
      <div class="entry">
        ${renderEntryHeadWithMeta(esc(job.role), job.company && esc(job.company), job.period && esc(job.period))}
        ${job.summary ? `<div class="entry-summary">${md(job.summary, true)}</div>` : ''}
        ${highlights}
      </div>`;
    })
    .join('');
}

function renderProjectsContent(projects, md) {
  if (!projects || !projects.length) return '';
  return projects
    .map((p) => {
      const title = p.link
        ? `<a href="${esc(p.link)}">${esc(p.name)}</a>`
        : esc(p.name);
      const tags =
        p.tags && p.tags.length
          ? `<div class="tags">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`
          : '';
      return `
      <div class="entry">
        <div class="entry-head">
          <span class="entry-title">${title}</span>
          ${p.period ? `<span class="entry-period">${esc(p.period)}</span>` : ''}
        </div>
        ${p.summary ? `<div class="entry-summary">${md(p.summary, true)}</div>` : ''}
        ${tags}
      </div>`;
    })
    .join('');
}

function renderEducationContent(education, md) {
  if (!education || !education.length) return '';
  return education
    .map(
      (e) => `
      <div class="entry">
        ${renderEntryHeadWithMeta(esc(e.degree), e.school && esc(e.school), e.year && esc(e.year))}
        ${e.note ? `<div class="entry-summary">${md(e.note, true)}</div>` : ''}
      </div>`
    )
    .join('');
}

// ---- Section registry: title + content renderer, keyed by cv.yaml name ----

const SECTIONS = {
  contact: { title: 'Contact', render: (data) => renderContactContent(data.profile) },
  skills: { title: 'Skills', render: (data) => renderSkillsContent(data.skills) },
  languages: { title: 'Languages', render: (data) => renderLanguagesContent(data.languages) },
  hobbies: { title: 'Hobbies', render: (data) => renderHobbiesContent(data.hobbies) },
  summary: { title: 'Profile', render: (data, md) => renderSummaryContent(data.summary, md) },
  experience: {
    title: 'Work Experience',
    render: (data, md) => renderExperienceContent(data.experience, md),
  },
  projects: { title: 'Projects', render: (data, md) => renderProjectsContent(data.projects, md) },
  education: { title: 'Education', render: (data, md) => renderEducationContent(data.education, md) },
};

const SIDEBAR_DEFAULT = ['contact', 'skills', 'languages', 'hobbies'];
const MAIN_DEFAULT = ['summary', 'experience', 'projects', 'education'];

// Wraps a section's content in <section><h2> with column-specific styling
// (via the `${columnClass}-section` class), so the same content renderer
// works correctly regardless of which column cv.yaml's `layout:` puts it in.
function renderSection(key, data, md, columnClass) {
  const def = SECTIONS[key];
  if (!def) return '';
  const inner = def.render(data, md);
  if (!inner) return '';
  return `
    <section class="section ${columnClass}-section">
      <h2>${esc(def.title)}</h2>
      ${inner}
    </section>`;
}

function renderColumn(order, data, md, columnClass) {
  return order.map((key) => renderSection(key, data, md, columnClass)).join('\n');
}

function renderDocument(data, md, css) {
  const layout = data.layout || {};
  const sidebarOrder = layout.sidebar && layout.sidebar.length ? layout.sidebar : SIDEBAR_DEFAULT;
  const mainOrder = layout.main && layout.main.length ? layout.main : MAIN_DEFAULT;

  const sidebar = renderColumn(sidebarOrder, data, md, 'side');
  const main = renderColumn(mainOrder, data, md, 'main');

  const name = data.profile?.name || 'CV';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(name)} CV</title>
<style>${css}</style>
</head>
<body>
  <div class="bg-fill"></div>
  <div class="page">
    <aside class="sidebar">
      ${renderSidebarHeader(data.profile)}
      ${sidebar}
    </aside>
    <main class="main">
      ${main}
    </main>
  </div>
</body>
</html>`;
}

module.exports = { renderDocument };
