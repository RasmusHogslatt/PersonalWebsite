const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const yaml = require('js-yaml');
const { marked } = require('marked');
const { renderDocument } = require('./template');

marked.setOptions({ breaks: false });

/**
 * markdown helper passed into template renderers.
 * inline=true strips the wrapping <p> (used inside compact entry rows).
 */
function md(text, inline = false) {
  if (!text) return '';
  const trimmed = String(text).trim();
  return inline ? marked.parseInline(trimmed) : marked.parse(trimmed);
}

function loadData(yamlPath) {
  const raw = fs.readFileSync(yamlPath, 'utf8');
  return yaml.load(raw) || {};
}

/**
 * Asset paths in cv.yaml (e.g. profile.photo) are written relative to the
 * cv/ directory, e.g. "../assets/me.jpg" points at the repo-root assets
 * folder. Resolve them to absolute file:// URLs so the generated HTML
 * renders correctly regardless of where dist/cv.html physically sits.
 */
function resolveAssetPaths(data, baseDir) {
  if (data.profile?.photo) {
    const abs = path.resolve(baseDir, data.profile.photo);
    data.profile.photo = pathToFileURL(abs).href;
  }
  return data;
}

function render(yamlPath, cssPath) {
  const data = resolveAssetPaths(loadData(yamlPath), path.dirname(yamlPath));
  const css = fs.readFileSync(cssPath, 'utf8');
  return renderDocument(data, md, css);
}

module.exports = { render, loadData };
