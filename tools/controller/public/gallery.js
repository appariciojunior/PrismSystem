/* =========================================================================
   Prism controller — gallery
   Zero dependency. Everything renders inside #preview, so every page is
   painted by the live theme tokens: change the seed, the radius, the
   material or the type and all 61 component pages move with it.
   ========================================================================= */
(function () {
  'use strict';

  var REG = {};
  var ORDER = [];
  var PAGES = {};
  var CURRENT = 'brand';

  function C(slug, name, desc, tags, demos) {
    REG[slug] = { slug: slug, name: name, desc: desc, tags: tags || [], demos: demos || [] };
    ORDER.push(slug);
  }
  function d(label, note, html) { return { label: label, note: note, html: html }; }

  var SCREENS = [
    { slug: 'brand',        name: 'Brand overview', kind: 'page' },
    { slug: 'dashboard',    name: 'Dashboard',      kind: 'pane', pane: 'pane-dash' },
    { slug: 'mail',         name: 'Mail',           kind: 'pane', pane: 'pane-mail' },
    { slug: 'chat',         name: 'Chat',           kind: 'page' },
    { slug: 'finances',     name: 'Finances',       kind: 'page' },
    { slug: 'moodboard',    name: 'Moodboard',      kind: 'pane', pane: 'pane-mood' },
    { slug: 'kitchen-sink', name: 'Kitchen sink',   kind: 'pane', pane: 'pane-components' },
    { slug: 'type',         name: 'Type',           kind: 'pane', pane: 'pane-type' },
    { slug: 'colours',      name: 'Colours',        kind: 'pane', pane: 'pane-colours' }
  ];

  var SCREEN_MAP = {};
  SCREENS.forEach(function (s) { SCREEN_MAP[s.slug] = s; });

  /* ---------- small helpers ---------- */

  function el(id) { return document.getElementById(id); }
  function pv() { return document.getElementById('preview'); }

  function tok(name) {
    var p = pv();
    if (!p) return '';
    try { return getComputedStyle(p).getPropertyValue('--' + name).trim(); } catch (e) { return ''; }
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- page rendering ---------- */

  function head(title, desc, tags) {
    var t = (tags && tags.length)
      ? '<div class="gx-page-meta">' + tags.map(function (x) { return '<span class="gx-tag">' + esc(x) + '</span>'; }).join('') + '</div>'
      : '';
    return '<div class="gx-page-head">' +
      '<div class="gx-page-title">' + esc(title) + '</div>' +
      (desc ? '<div class="gx-page-desc">' + esc(desc) + '</div>' : '') +
      t + '</div>';
  }

  function demoBlock(x) {
    return '<div class="gx-demo">' +
      '<div class="gx-demo-head"><div class="gx-demo-label">' + esc(x.label) + '</div>' +
      (x.note ? '<div class="gx-demo-note">' + esc(x.note) + '</div>' : '') + '</div>' +
      '<div class="gx-demo-canvas">' + x.html + '</div></div>';
  }

  function componentHTML(def) {
    return head(def.name, def.desc, def.tags) +
      def.demos.map(demoBlock).join('');
  }

  /* ---------- navigation ---------- */

  function navItem(slug, name) {
    return '<button type="button" class="gx-item" data-slug="' + slug + '">' +
      '<i class="gx-dot"></i>' + esc(name) + '</button>';
  }

  function buildNav(q) {
    var list = el('gx-list');
    if (!list) return;
    q = (q || '').trim().toLowerCase();

    function match(slug, name, tags) {
      if (!q) return true;
      if (slug.indexOf(q) !== -1 || name.toLowerCase().indexOf(q) !== -1) return true;
      return (tags || []).some(function (t) { return t.toLowerCase().indexOf(q) !== -1; });
    }

    var screens = SCREENS.filter(function (s) { return match(s.slug, s.name); });
    var comps = ORDER.filter(function (s) { return match(s, REG[s].name, REG[s].tags); });

    var html = '';
    if (screens.length) {
      html += '<div class="gx-group">Screens <span>' + screens.length + '</span></div>';
      html += screens.map(function (s) { return navItem(s.slug, s.name); }).join('');
    }
    if (comps.length) {
      html += '<div class="gx-group">Components <span>' + comps.length + '</span></div>';
      html += comps.map(function (s) { return navItem(s, REG[s].name); }).join('');
    }
    if (!html) html = '<div class="gx-empty">Nothing matches &ldquo;' + esc(q) + '&rdquo;.</div>';

    list.innerHTML = html;
    markActive();
  }

  function markActive() {
    var list = el('gx-list');
    if (!list) return;
    list.querySelectorAll('.gx-item').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-slug') === CURRENT);
    });
  }

  /* ---------- selection ---------- */

  function showPane(id) {
    document.querySelectorAll('#preview .pane').forEach(function (p) {
      p.classList.toggle('active', p.id === id);
    });
  }

  function select(slug, pushHash) {
    if (!slug) slug = 'brand';
    if (!SCREEN_MAP[slug] && !REG[slug]) slug = 'brand';
    CURRENT = slug;

    var screen = SCREEN_MAP[slug];
    if (screen && screen.kind === 'pane') {
      showPane(screen.pane);
      if (screen.pane === 'pane-mood' && typeof window.renderMood === 'function') window.renderMood();
      if (screen.pane === 'pane-colours' && typeof window.renderColours === 'function') window.renderColours();
    } else {
      var canvas = el('gx-canvas');
      if (canvas) {
        if (screen && PAGES[slug]) canvas.innerHTML = PAGES[slug]();
        else if (REG[slug]) canvas.innerHTML = componentHTML(REG[slug]);
      }
      showPane('pane-gallery');
    }

    markActive();

    var main = document.querySelector('.main');
    if (main) main.scrollTop = 0;

    if (pushHash !== false) {
      var h = '#preview/' + slug;
      try { history.replaceState(null, '', h); } catch (e) { /* ignore */ }
    }
  }

  function refresh() { select(CURRENT, false); }

  /* ---------- interaction inside demos ---------- */

  function wireDemoClicks() {
    var canvas = el('gx-canvas');
    if (!canvas) return;
    canvas.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      var group = b.closest('.pv-tabs, .pv-tgroup, .pv-menubar, .pv-carousel-dots');
      if (group) {
        if (group.classList.contains('pv-tgroup') && group.hasAttribute('data-multi')) {
          b.classList.toggle('on');
          return;
        }
        group.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
        var panel = group.parentNode.querySelector('.pv-tabpanel');
        if (panel && b.hasAttribute('data-panel')) panel.textContent = b.getAttribute('data-panel');
        return;
      }
      if (b.classList.contains('pv-toggle') && !b.closest('.pv-tgroup')) b.classList.toggle('on');
    });
  }

  /* ---------- boot ---------- */

  function init() {
    var search = el('gx-search');
    if (search) {
      search.addEventListener('input', function () { buildNav(search.value); });
      search.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') { search.value = ''; buildNav(''); search.blur(); }
      });
    }
    var list = el('gx-list');
    if (list) {
      list.addEventListener('click', function (ev) {
        var b = ev.target.closest('.gx-item');
        if (b) select(b.getAttribute('data-slug'));
      });
    }
    wireDemoClicks();

    var parts = (location.hash || '').replace(/^#/, '').split('/');
    var start = (parts[0] === 'preview' && parts[1]) ? parts[1] : 'brand';
    buildNav('');
    select(start, false);
  }

  window.PrismGallery = {
    init: init,
    select: select,
    refresh: refresh,
    current: function () { return CURRENT; },
    count: function () { return ORDER.length; }
  };

  /* =======================================================================
     Component registry — A to C
     ======================================================================= */

  function cal(opts) {
    opts = opts || {};
    var dow = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    var h = '<div class="pv-cal"><div class="pv-cal-head">' +
      '<div class="pv-cal-title">' + (opts.title || 'March 2026') + '</div>' +
      '<div class="pv-cal-nav"><button type="button">&#8249;</button><button type="button">&#8250;</button></div>' +
      '</div><div class="pv-cal-grid">';
    h += dow.map(function (x) { return '<div class="pv-cal-dow">' + x + '</div>'; }).join('');
    var lead = opts.lead === undefined ? 6 : opts.lead;
    var i;
    for (i = 0; i < lead; i++) h += '<button type="button" class="pv-cal-day out">' + (22 + i) + '</button>';
    for (i = 1; i <= 31; i++) {
      var cls = 'pv-cal-day';
      if (opts.today === i) cls += ' today';
      if (opts.sel === i) cls += ' sel';
      if (opts.range && i > opts.range[0] && i < opts.range[1]) cls += ' range';
      if (opts.range && i === opts.range[0]) cls += ' sel';
      if (opts.range && i === opts.range[1]) cls += ' sel';
      h += '<button type="button" class="' + cls + '">' + i + '</button>';
    }
    var tail = (7 - ((lead + 31) % 7)) % 7;
    for (i = 1; i <= tail; i++) h += '<button type="button" class="pv-cal-day out">' + i + '</button>';
    return h + '</div></div>';
  }

  C('accordion', 'Accordion', 'A stack of headings that each reveal a section of content. Only the heading is in the flow until it is opened, so a long page of detail stays scannable.', ['disclosure', 'faq', 'details'], [
    d('Single', 'One panel open at a time. The first is open by default.',
      '<div class="pv-acc gx-w-md" style="max-width:560px">' +
      '<details open><summary>What is a design token?</summary><div class="pv-acc-body">A named decision. Rather than a hex value scattered through a codebase, a token holds the intent, and every platform reads the same name.</div></details>' +
      '<details><summary>How are ramps generated?</summary><div class="pv-acc-body">From a single seed, in OKLCH, with lightness steps tuned so that contrast pairs stay legible at every stop.</div></details>' +
      '<details><summary>Can I override a step?</summary><div class="pv-acc-body">Yes. Overrides are stored against the token name, so a regenerated ramp keeps them.</div></details>' +
      '</div>'),
    d('Multiple', 'Several panels open together.',
      '<div class="pv-acc" style="max-width:560px">' +
      '<details open><summary>Typography</summary><div class="pv-acc-body">Heading and body families, weights and the scale that ties them together.</div></details>' +
      '<details open><summary>Spacing</summary><div class="pv-acc-body">A single multiplier drives every gap, so density is one control rather than fifty.</div></details>' +
      '</div>')
  ]);

  C('alert', 'Alert', 'A short, static message that sits in the page rather than over it. Use it for state the person needs to notice but does not have to act on immediately.', ['feedback', 'banner', 'status'], [
    d('Variants', 'default and destructive, the two the component ships.',
      '<div class="gx-col">' +
      '<div class="pv-alert"><div class="pv-alert-ic"></div><div><div class="pv-alert-t">Heads up</div><div class="pv-alert-d">Your theme has unsaved changes. Export before you close the controller.</div></div></div>' +
      '<div class="pv-alert destructive"><div class="pv-alert-ic"></div><div><div class="pv-alert-t">Contrast failure</div><div class="pv-alert-d">Foreground on primary sits at 3.1:1. WCAG AA for body text needs 4.5:1.</div></div></div>' +
      '</div>'),
    d('Title only', 'The description is optional.',
      '<div class="pv-alert"><div class="pv-alert-ic"></div><div><div class="pv-alert-t">Tokens rebuilt in 240ms</div></div></div>')
  ]);

  C('alert-dialog', 'Alert dialog', 'A modal that interrupts to confirm something consequential. Unlike a dialog it has no dismiss affordance in the corner: the person must choose.', ['modal', 'confirm', 'destructive'], [
    d('Destructive confirm', 'Cancel first, the destructive action last.',
      '<div class="pv-scrim"><div class="pv-surface pv-dialog">' +
      '<div class="pv-dialog-t">Delete this theme?</div>' +
      '<div class="pv-dialog-d">Prism will remove the seed, every generated ramp and the exported token set. This cannot be undone.</div>' +
      '<div class="pv-dialog-foot"><button type="button" class="pv-btn outline">Cancel</button><button type="button" class="pv-btn destructive">Delete theme</button></div>' +
      '</div></div>')
  ]);

  C('aspect-ratio', 'Aspect ratio', 'Holds a box at a fixed ratio while its width flexes, so images and embeds never cause layout shift as they load.', ['layout', 'media', 'image'], [
    d('Common ratios', 'The box keeps its shape at any width.',
      '<div class="gx-two">' +
      '<div><div class="gx-cap">16 / 9</div><div class="pv-aspect r-16-9">16 : 9</div></div>' +
      '<div><div class="gx-cap">4 / 3</div><div class="pv-aspect r-4-3">4 : 3</div></div>' +
      '<div><div class="gx-cap">1 / 1</div><div class="pv-aspect r-1-1">1 : 1</div></div>' +
      '<div><div class="gx-cap">3 / 4</div><div class="pv-aspect r-3-4">3 : 4</div></div>' +
      '</div>')
  ]);

  C('attachment', 'Attachment', 'A file chip: name, type and weight in a form the person can scan in a list or a message composer.', ['file', 'upload', 'chip'], [
    d('Sizes', 'default, sm and xs.',
      '<div class="gx-col" style="align-items:flex-start">' +
      '<div class="pv-attach"><div class="pv-attach-ic">PDF</div><div style="min-width:0"><div class="pv-attach-n">Brand-guidelines-v4.pdf</div><div class="pv-attach-s">2.4 MB</div></div></div>' +
      '<div class="pv-attach sm"><div class="pv-attach-ic">CSV</div><div style="min-width:0"><div class="pv-attach-n">tokens-export.csv</div><div class="pv-attach-s">18 KB</div></div></div>' +
      '<div class="pv-attach xs"><div class="pv-attach-ic">ZIP</div><div class="pv-attach-n">theme.zip</div></div>' +
      '</div>'),
    d('Vertical', 'Thumbnail above the name, for grids.',
      '<div class="gx-row">' +
      '<div class="pv-attach vert"><div class="pv-attach-ic">PNG</div><div style="min-width:0;width:100%"><div class="pv-attach-n">hero-shot.png</div><div class="pv-attach-s">1.1 MB</div></div></div>' +
      '<div class="pv-attach vert"><div class="pv-attach-ic">FIG</div><div style="min-width:0;width:100%"><div class="pv-attach-n">Library.fig</div><div class="pv-attach-s">640 KB</div></div></div>' +
      '</div>')
  ]);

  C('avatar', 'Avatar', 'A person or an entity, reduced to a circle. Falls back to initials when there is no image, and to a neutral fill when there are no initials either.', ['identity', 'user', 'image'], [
    d('Sizes', 'xs through lg.',
      '<div class="gx-row"><span class="pv-avatar xs">AJ</span><span class="pv-avatar sm">AJ</span><span class="pv-avatar">AJ</span><span class="pv-avatar lg">AJ</span></div>'),
    d('Shape and emphasis', 'Square for products and brands, tinted for the current user.',
      '<div class="gx-row"><span class="pv-avatar sq">PS</span><span class="pv-avatar brand">AJ</span><span class="pv-avatar sq brand">TX</span></div>'),
    d('Status and stacking', 'A presence dot, and a group that reads as a count.',
      '<div class="gx-row">' +
      '<span class="pv-avatar-wrap"><span class="pv-avatar">MK</span><i class="pv-avatar-status"></i></span>' +
      '<span class="pv-avatar-group"><span class="pv-avatar sm">AJ</span><span class="pv-avatar sm">MK</span><span class="pv-avatar sm">RT</span><span class="pv-avatar sm brand">+6</span></span>' +
      '</div>')
  ]);

  C('badge', 'Badge', 'A small label attached to something else: a count, a state, a category. It never takes a click on its own.', ['label', 'status', 'tag'], [
    d('Variants', 'The six the component ships.',
      '<div class="gx-row">' +
      '<span class="pv-badge default">Default</span><span class="pv-badge secondary">Secondary</span>' +
      '<span class="pv-badge destructive">Destructive</span><span class="pv-badge outline">Outline</span>' +
      '<span class="pv-badge ghost">Ghost</span><span class="pv-badge link">Link</span>' +
      '</div>'),
    d('Semantic', 'Mapped onto the status tokens.',
      '<div class="gx-row">' +
      '<span class="pv-badge success">Passing</span><span class="pv-badge warning">Review</span>' +
      '<span class="pv-badge info">Beta</span><span class="pv-badge tertiary">Draft</span>' +
      '</div>'),
    d('With a dot', 'For live states where the colour alone is not enough.',
      '<div class="gx-row">' +
      '<span class="pv-badge success dotted"><i class="bdot"></i>Live</span>' +
      '<span class="pv-badge secondary dotted"><i class="bdot"></i>Idle</span>' +
      '<span class="pv-badge destructive dotted"><i class="bdot"></i>Failed</span>' +
      '</div>')
  ]);

  C('breadcrumb', 'Breadcrumb', 'Where the current page sits in the hierarchy, and a way back up. The last item is the page itself and is not a link.', ['navigation', 'hierarchy'], [
    d('Default', '',
      '<nav class="pv-crumbs"><a href="#preview/breadcrumb">Prism</a><span class="sep">/</span><a href="#preview/breadcrumb">Themes</a><span class="sep">/</span><a href="#preview/breadcrumb">Editorial</a><span class="sep">/</span><span class="cur">Colour</span></nav>'),
    d('Collapsed', 'Long trails fold into an ellipsis.',
      '<nav class="pv-crumbs"><a href="#preview/breadcrumb">Prism</a><span class="sep">/</span><a href="#preview/breadcrumb">&#8230;</a><span class="sep">/</span><a href="#preview/breadcrumb">Editorial</a><span class="sep">/</span><span class="cur">Colour</span></nav>')
  ]);

  C('bubble', 'Bubble', 'A single turn in a conversation. Seven variants so an assistant, a person, a system note and an error all read differently without extra chrome.', ['chat', 'message', 'ai'], [
    d('Variants', 'default, secondary, muted, tinted, outline, ghost, destructive.',
      '<div class="gx-col">' +
      '<div class="pv-bubble default">Default. The sender, aligned to the right in a real thread.</div>' +
      '<div class="pv-bubble secondary">Secondary. A quieter counterpart.</div>' +
      '<div class="pv-bubble muted">Muted. Good for the assistant when the conversation is long.</div>' +
      '<div class="pv-bubble tinted">Tinted. Carries the brand without shouting.</div>' +
      '<div class="pv-bubble outline">Outline. Structure only, no fill.</div>' +
      '<div class="pv-bubble ghost">Ghost. Reads as plain text with the rhythm of a bubble.</div>' +
      '<div class="pv-bubble destructive">Destructive. Something went wrong in this turn.</div>' +
      '</div>'),
    d('In a thread', 'Alignment comes from the layout, not the variant.',
      '<div class="gx-col" style="max-width:520px">' +
      '<div class="pv-bubble default me">Can you take the Editorial seed and warm it a little?</div>' +
      '<div class="pv-bubble muted">Warmed the hue by 8 degrees and lifted chroma at the mid stops. Contrast on primary is now 5.2:1.</div>' +
      '<div class="pv-bubble default me">Perfect, save that.</div>' +
      '</div>')
  ]);

  C('button', 'Button', 'The workhorse. Six variants and eight sizes, including icon-only, so a whole interface can be built without a one-off.', ['action', 'form', 'cta'], [
    d('Variants', 'default, secondary, destructive, outline, ghost, link.',
      '<div class="gx-row">' +
      '<button type="button" class="pv-btn primary">Default</button>' +
      '<button type="button" class="pv-btn secondary">Secondary</button>' +
      '<button type="button" class="pv-btn destructive">Destructive</button>' +
      '<button type="button" class="pv-btn outline">Outline</button>' +
      '<button type="button" class="pv-btn ghost">Ghost</button>' +
      '<button type="button" class="pv-btn link">Link</button>' +
      '</div>'),
    d('Sizes', 'xs, sm, default, lg.',
      '<div class="gx-row" style="align-items:center">' +
      '<button type="button" class="pv-btn primary xs">Extra small</button>' +
      '<button type="button" class="pv-btn primary sm">Small</button>' +
      '<button type="button" class="pv-btn primary">Default</button>' +
      '<button type="button" class="pv-btn primary lg">Large</button>' +
      '</div>'),
    d('Icon only', 'Square at every size. Always give it a label for screen readers.',
      '<div class="gx-row" style="align-items:center">' +
      '<button type="button" class="pv-btn outline icon xs" aria-label="Add">+</button>' +
      '<button type="button" class="pv-btn outline icon sm" aria-label="Add">+</button>' +
      '<button type="button" class="pv-btn outline icon" aria-label="Add">+</button>' +
      '<button type="button" class="pv-btn outline icon lg" aria-label="Add">+</button>' +
      '<button type="button" class="pv-btn primary icon" aria-label="Confirm">&#10003;</button>' +
      '</div>'),
    d('States', 'With an icon, loading, disabled, and full width.',
      '<div class="gx-col" style="align-items:flex-start">' +
      '<div class="gx-row">' +
      '<button type="button" class="pv-btn primary">&#43;&nbsp; New theme</button>' +
      '<button type="button" class="pv-btn primary loading"><span class="pv-spin sm on-primary" style="vertical-align:-3px"></span>&nbsp; Building</button>' +
      '<button type="button" class="pv-btn primary" disabled>Disabled</button>' +
      '<button type="button" class="pv-btn outline" disabled>Disabled</button>' +
      '</div>' +
      '<div style="width:100%;max-width:340px"><button type="button" class="pv-btn primary block">Full width</button></div>' +
      '</div>')
  ]);

  C('button-group', 'Button group', 'Buttons welded into one control. Horizontal for a segmented action, vertical for a stacked menu of equals.', ['action', 'segmented', 'toolbar'], [
    d('Horizontal', '',
      '<div class="gx-row">' +
      '<div class="pv-bgroup"><button type="button" class="pv-btn outline">Day</button><button type="button" class="pv-btn outline">Week</button><button type="button" class="pv-btn outline">Month</button></div>' +
      '<div class="pv-bgroup"><button type="button" class="pv-btn primary">Save</button><button type="button" class="pv-btn primary" aria-label="More">&#9662;</button></div>' +
      '</div>'),
    d('Vertical', '',
      '<div class="pv-bgroup vert"><button type="button" class="pv-btn outline">Duplicate</button><button type="button" class="pv-btn outline">Export tokens</button><button type="button" class="pv-btn outline">Archive</button></div>')
  ]);

  C('calendar', 'Calendar', 'A month grid for picking a day or a span. Today, the selection and the days either side of the month all read differently.', ['date', 'picker', 'form'], [
    d('Single date', 'The 14th selected, the 9th is today.',
      cal({ today: 9, sel: 14 })),
    d('Range', 'A span from the 8th to the 19th.',
      cal({ title: 'April 2026', lead: 2, range: [8, 19] }))
  ]);

  C('card', 'Card', 'A container that groups a heading, some content and its actions. The most reused shape in the system, so it carries the radius and the material directly.', ['container', 'layout', 'surface'], [
    d('Anatomy', 'Header, content, footer.',
      '<div class="pv-card gx-w-md">' +
      '<div class="pv-card-title">Editorial</div>' +
      '<div class="pv-card-desc">Generated from a single seed. Twelve ramps, forty-two semantic tokens, contrast checked at every pair.</div>' +
      '<div class="gx-row" style="margin-top:16px"><button type="button" class="pv-btn primary sm">Apply</button><button type="button" class="pv-btn ghost sm">Preview</button></div>' +
      '</div>'),
    d('In a grid', 'Cards carry the same radius and shadow as the rest of the surface set.',
      '<div class="pv-grid">' +
      '<div class="pv-card"><div class="pv-card-title">Contrast</div><div class="pv-card-desc">Every foreground and background pair tested to WCAG 2.2.</div></div>' +
      '<div class="pv-card"><div class="pv-card-title">Ramps</div><div class="pv-card-desc">Perceptually even steps in OKLCH, not sRGB.</div></div>' +
      '<div class="pv-card"><div class="pv-card-title">Export</div><div class="pv-card-desc">CSS, Tailwind, Figma variables and iOS, from one source.</div></div>' +
      '</div>')
  ]);

  C('carousel', 'Carousel', 'A horizontal run of items that scrolls rather than wraps. Snap points keep each item aligned when the person lets go.', ['media', 'scroll', 'gallery'], [
    d('Slides', 'Drag or scroll horizontally.',
      '<div class="pv-carousel"><div class="pv-carousel-track">' +
      '<div class="pv-carousel-slide" style="background:var(--chart-1)">1</div>' +
      '<div class="pv-carousel-slide" style="background:var(--chart-2)">2</div>' +
      '<div class="pv-carousel-slide" style="background:var(--chart-3)">3</div>' +
      '<div class="pv-carousel-slide" style="background:var(--chart-4)">4</div>' +
      '<div class="pv-carousel-slide" style="background:var(--chart-5)">5</div>' +
      '</div><div class="pv-carousel-dots"><i class="on"></i><i></i><i></i><i></i><i></i></div></div>')
  ]);

  /* =======================================================================
     Component registry — C to F
     ======================================================================= */

  function bars(vals, colour) {
    return '<div class="pv-bars">' + vals.map(function (v, i) {
      return '<i class="b" style="height:' + v + '%;background:' + (colour || ('var(--chart-' + ((i % 5) + 1) + ')')) + '"></i>';
    }).join('') + '</div>';
  }

  C('chart', 'Chart', 'Data drawn with the chart token ramp, so a series stays distinguishable in light and dark and never collides with the brand colour.', ['data', 'visualisation', 'analytics'], [
    d('Bars', 'One colour per series, drawn from chart-1 to chart-5.',
      bars([38, 62, 45, 78, 54, 88, 66, 42, 71, 59, 94, 48]) +
      '<div class="pv-legend"><span><i style="background:var(--chart-1)"></i>Sessions</span><span><i style="background:var(--chart-2)"></i>Signups</span><span><i style="background:var(--chart-3)"></i>Activated</span><span><i style="background:var(--chart-4)"></i>Retained</span><span><i style="background:var(--chart-5)"></i>Churned</span></div>'),
    d('Single series', 'When there is only one thing to say, use the brand colour.',
      bars([28, 44, 39, 58, 51, 72, 64, 80, 76, 92], 'var(--primary)')),
    d('Donut', 'The hole picks up the card surface, so it works on any material.',
      '<div class="gx-row" style="gap:28px">' +
      '<div style="position:relative;width:132px;height:132px">' +
      '<div class="pv-donut" style="background:conic-gradient(var(--chart-1) 0 42%, var(--chart-2) 42% 68%, var(--chart-3) 68% 86%, var(--chart-4) 86% 100%)"></div>' +
      '<div class="pv-donut-hole"><div class="pv-h" style="font-size:20px">£13.4k</div><div class="pv-mute" style="font-size:11px">Total</div></div>' +
      '</div>' +
      '<div class="pv-legend" style="flex-direction:column;gap:8px;margin:0">' +
      '<span><i style="background:var(--chart-1)"></i>Direct &nbsp;42%</span>' +
      '<span><i style="background:var(--chart-2)"></i>Search &nbsp;26%</span>' +
      '<span><i style="background:var(--chart-3)"></i>Referral &nbsp;18%</span>' +
      '<span><i style="background:var(--chart-4)"></i>Social &nbsp;14%</span>' +
      '</div></div>')
  ]);

  C('checkbox', 'Checkbox', 'A binary choice that is part of a set. Supports an indeterminate state for a parent whose children disagree.', ['form', 'input', 'selection'], [
    d('States', 'unchecked, checked, indeterminate, disabled.',
      '<div class="gx-col">' +
      '<label class="pv-check"><input type="checkbox"><span class="pv-box"></span><span>Generate dark mode</span></label>' +
      '<label class="pv-check"><input type="checkbox" checked><span class="pv-box"></span><span>Check contrast on every pair</span></label>' +
      '<label class="pv-check"><input type="checkbox" id="gx-cb-ind"><span class="pv-box"></span><span>Include chart ramp</span></label>' +
      '<label class="pv-check disabled"><input type="checkbox" disabled><span class="pv-box"></span><span>Publish to npm</span></label>' +
      '</div>'),
    d('With a description', 'The label carries the decision, the description carries the consequence.',
      '<label class="pv-check gx-w-md"><input type="checkbox" checked><span class="pv-box"></span><span>Lock the seed<span class="pv-check-d">Regenerating will keep this hue and only move lightness and chroma.</span></span></label>')
  ]);

  C('collapsible', 'Collapsible', 'One section that opens and closes. The accordion without the set, for a single optional block of detail.', ['disclosure', 'toggle'], [
    d('Closed and open', '',
      '<div class="gx-col gx-w-md" style="max-width:520px">' +
      '<details class="pv-collapse"><summary>Advanced ramp settings</summary><div class="pv-collapse-body">Chroma ceiling, lightness curve and the number of stops either side of the seed.</div></details>' +
      '<details class="pv-collapse" open><summary>Export targets</summary><div class="pv-collapse-body">CSS custom properties, Tailwind v4 theme, Figma variables, Swift and Compose.</div></details>' +
      '</div>')
  ]);

  C('combobox', 'Combobox', 'An input and a list in one: type to narrow, arrow to choose. Use it when a select would be too long to scan.', ['form', 'search', 'select'], [
    d('Open', 'The query filters the list as it is typed.',
      '<div class="gx-w-md">' +
      '<div class="pv-trigger" style="width:100%;min-width:0">Editorial<span class="caret">&#9662;</span></div>' +
      '<div class="pv-surface" style="margin-top:6px">' +
      '<input class="pv-cmd-input" placeholder="Search themes&#8230;" value="ed">' +
      '<div class="pv-menu-pad">' +
      '<div class="pv-menu-item on"><span class="ic">&#10003;</span>Editorial</div>' +
      '<div class="pv-menu-item"><span class="ic"></span>Editorial mono</div>' +
      '<div class="pv-menu-item"><span class="ic"></span>Edge</div>' +
      '</div></div></div>'),
    d('Multiple', 'Chosen values come back as badges in the trigger.',
      '<div class="pv-trigger" style="min-width:280px">' +
      '<span class="pv-badge secondary">Editorial</span><span class="pv-badge secondary">Mono</span>' +
      '<span class="caret">&#9662;</span></div>')
  ]);

  C('command', 'Command', 'The palette. A search box over every action in the product, grouped and keyboard driven.', ['search', 'palette', 'keyboard'], [
    d('Palette', 'Groups, icons and shortcut hints.',
      '<div class="pv-surface pv-cmd">' +
      '<input class="pv-cmd-input" placeholder="Type a command or search&#8230;">' +
      '<div class="pv-menu-pad">' +
      '<div class="pv-menu-label">Theme</div>' +
      '<div class="pv-menu-item on"><span class="ic">&#9673;</span>Regenerate ramps<span class="kb"><span class="pv-kbd">&#8984;</span> <span class="pv-kbd">R</span></span></div>' +
      '<div class="pv-menu-item"><span class="ic">&#9635;</span>Switch material<span class="kb"><span class="pv-kbd">&#8984;</span> <span class="pv-kbd">M</span></span></div>' +
      '<div class="pv-menu-item"><span class="ic">&#9788;</span>Toggle dark mode<span class="kb"><span class="pv-kbd">&#8984;</span> <span class="pv-kbd">D</span></span></div>' +
      '<div class="pv-menu-sep"></div>' +
      '<div class="pv-menu-label">Export</div>' +
      '<div class="pv-menu-item"><span class="ic">&#8681;</span>Download token set</div>' +
      '<div class="pv-menu-item"><span class="ic">&#9998;</span>Copy CSS variables</div>' +
      '</div></div>')
  ]);

  C('context-menu', 'Context menu', 'The right-click menu. Same surface as the dropdown, different trigger, and it appears where the pointer is.', ['menu', 'right-click', 'overlay'], [
    d('Open', 'With a separator, a shortcut and a destructive item.',
      '<div class="gx-row" style="align-items:flex-start;gap:20px">' +
      '<div class="pv-item outline" style="width:200px;height:120px;justify-content:center;color:var(--muted-foreground);font-size:12.5px">Right-click here</div>' +
      '<div class="pv-surface" style="width:220px">' +
      '<div class="pv-menu-pad">' +
      '<div class="pv-menu-item"><span class="ic">&#9998;</span>Rename<span class="kb"><span class="pv-kbd">F2</span></span></div>' +
      '<div class="pv-menu-item"><span class="ic">&#10697;</span>Duplicate</div>' +
      '<div class="pv-menu-item disabled"><span class="ic">&#8682;</span>Move to&#8230;</div>' +
      '<div class="pv-menu-sep"></div>' +
      '<div class="pv-menu-item danger"><span class="ic">&#9003;</span>Delete</div>' +
      '</div></div></div>')
  ]);

  C('dialog', 'Dialog', 'A modal for a task that needs the whole of someone attention but is not destructive. It can be dismissed.', ['modal', 'overlay', 'form'], [
    d('With a form', '',
      '<div class="pv-scrim"><div class="pv-surface pv-dialog">' +
      '<div class="pv-dialog-t">New theme</div>' +
      '<div class="pv-dialog-d">Give it a name and a seed. Everything else is generated.</div>' +
      '<div class="gx-col" style="margin-top:18px">' +
      '<div class="pv-field"><label class="pv-field-label">Name</label><input class="pv-input" value="Editorial"></div>' +
      '<div class="pv-field"><label class="pv-field-label">Seed</label><input class="pv-input" value="#2F6BFF"></div>' +
      '</div>' +
      '<div class="pv-dialog-foot"><button type="button" class="pv-btn ghost">Cancel</button><button type="button" class="pv-btn primary">Create</button></div>' +
      '</div></div>')
  ]);

  C('direction', 'Direction', 'A provider that flips the whole subtree between left-to-right and right-to-left. Logical properties do the rest.', ['i18n', 'rtl', 'layout'], [
    d('LTR and RTL', 'The same markup, mirrored.',
      '<div class="gx-two">' +
      '<div class="pv-dir" dir="ltr"><div class="gx-cap">dir="ltr"</div>' +
      '<div class="pv-item outline"><span class="pv-avatar sm">AJ</span><div><div class="pv-item-t">Editorial</div><div class="pv-item-d">Updated 2 hours ago</div></div><div class="pv-item-act"><span class="pv-badge secondary">Live</span></div></div>' +
      '</div>' +
      '<div class="pv-dir" dir="rtl"><div class="gx-cap">dir="rtl"</div>' +
      '<div class="pv-item outline"><span class="pv-avatar sm">AJ</span><div><div class="pv-item-t">&#1575;&#1601;&#1578;&#1578;&#1575;&#1581;&#1610;</div><div class="pv-item-d">&#1605;&#1606;&#1584; &#1587;&#1575;&#1593;&#1578;&#1610;&#1606;</div></div><div class="pv-item-act"><span class="pv-badge secondary">&#1605;&#1576;&#1575;&#1588;&#1585;</span></div></div>' +
      '</div></div>')
  ]);

  C('drawer', 'Drawer', 'A panel that comes up from the bottom edge. Built for touch, where a centred modal is awkward to reach.', ['overlay', 'mobile', 'sheet'], [
    d('Bottom drawer', 'The grip signals that it can be dragged.',
      '<div class="pv-scrim bottom"><div class="pv-surface pv-drawer">' +
      '<div class="pv-drawer-grip"></div>' +
      '<div class="pv-dialog-t">Material</div>' +
      '<div class="pv-dialog-d">How surfaces catch light. This changes blur, highlight and the shadow set together.</div>' +
      '<div class="gx-col" style="margin-top:16px">' +
      '<label class="pv-check"><input type="radio" name="gx-mat" checked><span class="pv-box" style="border-radius:50%"></span><span>Flat</span></label>' +
      '<label class="pv-check"><input type="radio" name="gx-mat"><span class="pv-box" style="border-radius:50%"></span><span>Frosted</span></label>' +
      '<label class="pv-check"><input type="radio" name="gx-mat"><span class="pv-box" style="border-radius:50%"></span><span>Elevated</span></label>' +
      '</div>' +
      '<div class="pv-dialog-foot"><button type="button" class="pv-btn primary block">Apply</button></div>' +
      '</div></div>')
  ]);

  C('dropdown-menu', 'Dropdown menu', 'A menu hung off a button. Labels, separators, checkable items and a destructive row at the bottom.', ['menu', 'overlay', 'action'], [
    d('Open', '',
      '<div class="gx-row" style="align-items:flex-start;gap:20px">' +
      '<button type="button" class="pv-btn outline">Account &nbsp;&#9662;</button>' +
      '<div class="pv-surface" style="width:230px">' +
      '<div class="pv-menu-pad">' +
      '<div class="pv-menu-label">Signed in as</div>' +
      '<div class="pv-menu-item"><span class="pv-avatar xs">AJ</span>appariciojunior</div>' +
      '<div class="pv-menu-sep"></div>' +
      '<div class="pv-menu-item"><span class="ic">&#9881;</span>Settings<span class="kb"><span class="pv-kbd">&#8984;</span> <span class="pv-kbd">,</span></span></div>' +
      '<div class="pv-menu-item"><span class="ic">&#9783;</span>Token sets</div>' +
      '<div class="pv-menu-item"><span class="ic">&#9788;</span>Appearance</div>' +
      '<div class="pv-menu-sep"></div>' +
      '<div class="pv-menu-item danger"><span class="ic">&#8592;</span>Sign out</div>' +
      '</div></div></div>')
  ]);

  C('empty', 'Empty', 'What a list looks like before it has anything in it. Two variants: plain, and one with an icon slot.', ['state', 'placeholder', 'zero'], [
    d('With an icon', 'Say what goes here and give one way to start.',
      '<div class="pv-empty">' +
      '<div class="pv-empty-ic">&#9635;</div>' +
      '<div class="pv-empty-t">No themes yet</div>' +
      '<div class="pv-empty-d">Pick a seed colour and Prism will generate the ramps, the semantic tokens and both modes.</div>' +
      '<div class="pv-empty-act"><button type="button" class="pv-btn primary sm">New theme</button><button type="button" class="pv-btn ghost sm">Import tokens</button></div>' +
      '</div>'),
    d('After a search', 'A different message when the emptiness is the query, not the data.',
      '<div class="pv-empty"><div class="pv-empty-t">Nothing matches &ldquo;chartreuse&rdquo;</div><div class="pv-empty-d">Try a hex value, a token name or a preset.</div></div>')
  ]);

  C('field', 'Field', 'The wrapper that ties a label, a control, a description and an error together, and keeps them associated for assistive tech.', ['form', 'label', 'validation'], [
    d('Vertical', 'The default. Label above, help below.',
      '<div class="gx-col gx-w-md">' +
      '<div class="pv-field"><label class="pv-field-label">Theme name</label><input class="pv-input" value="Editorial"><div class="pv-field-desc">Shown in the switcher and used as the export filename.</div></div>' +
      '<div class="pv-field"><label class="pv-field-label">Seed</label><input class="pv-input err" value="#GGGG"><div class="pv-field-err">That is not a valid hex, OKLCH or named colour.</div></div>' +
      '<div class="pv-field"><label class="pv-field-label">Disabled</label><input class="pv-input" value="Locked by the preset" disabled></div>' +
      '</div>'),
    d('Horizontal', 'For settings rows, where the label and the control sit on one line.',
      '<div class="gx-col gx-w-md" style="max-width:480px">' +
      '<div class="pv-field horiz"><div><div class="pv-field-label">Dark mode</div><div class="pv-field-desc">Generate a matching dark set.</div></div><label class="pv-switch"><input type="checkbox" checked><span class="pv-track"></span></label></div>' +
      '<div class="pv-field horiz"><div><div class="pv-field-label">Contrast guard</div><div class="pv-field-desc">Refuse pairs below AA.</div></div><label class="pv-switch"><input type="checkbox"><span class="pv-track"></span></label></div>' +
      '</div>'),
    d('Fieldset', 'A group of related fields with a shared legend.',
      '<fieldset class="pv-fieldset gx-w-md"><legend>Export</legend>' +
      '<div class="gx-col">' +
      '<label class="pv-check"><input type="checkbox" checked><span class="pv-box"></span><span>CSS custom properties</span></label>' +
      '<label class="pv-check"><input type="checkbox" checked><span class="pv-box"></span><span>Tailwind theme</span></label>' +
      '<label class="pv-check"><input type="checkbox"><span class="pv-box"></span><span>Figma variables</span></label>' +
      '</div></fieldset>')
  ]);

  C('form', 'Form', 'Fields, validation and submission wired together. Nothing visual of its own: it is the plumbing under the field components.', ['form', 'validation', 'submit'], [
    d('Sign in', 'A complete form using field, input, checkbox and button.',
      '<div class="pv-card gx-w-sm">' +
      '<div class="pv-card-title">Sign in</div>' +
      '<div class="pv-card-desc" style="margin-bottom:16px">Use your work address.</div>' +
      '<div class="gx-col">' +
      '<div class="pv-field"><label class="pv-field-label">Email</label><input class="pv-input" type="email" placeholder="you@company.com"></div>' +
      '<div class="pv-field"><label class="pv-field-label">Password</label><input class="pv-input" type="password" value="............"></div>' +
      '<label class="pv-check"><input type="checkbox" checked><span class="pv-box"></span><span>Keep me signed in</span></label>' +
      '<button type="button" class="pv-btn primary block">Continue</button>' +
      '<div class="divider-or">or</div>' +
      '<button type="button" class="pv-btn outline block">Continue with SSO</button>' +
      '</div></div>')
  ]);

  /* =======================================================================
     Component registry — H to R
     ======================================================================= */

  C('hover-card', 'Hover card', 'A preview that opens on hover after a short delay. Richer than a tooltip, and it can hold links and images.', ['overlay', 'preview', 'hover'], [
    d('Preview', '',
      '<div class="gx-row" style="align-items:flex-start;gap:20px">' +
      '<a href="#preview/hover-card" style="color:var(--primary);font-size:13px;text-decoration:underline;text-underline-offset:3px">@appariciojunior</a>' +
      '<div class="pv-surface pv-hovercard">' +
      '<div class="gx-row" style="gap:12px;flex-wrap:nowrap"><span class="pv-avatar">AJ</span>' +
      '<div><div class="pv-item-t">Apparicio Junior</div><div class="pv-item-d">Builds design systems that other people can actually use.</div></div></div>' +
      '<div class="pv-mute pv-sm" style="margin-top:12px">Joined March 2019 &middot; 14 themes</div>' +
      '</div></div>')
  ]);

  C('input', 'Input', 'A single line of text. The base for search, email, password and everything else the browser gives us for free.', ['form', 'text', 'field'], [
    d('States', 'default, filled, focused, invalid, disabled.',
      '<div class="gx-col gx-w-md">' +
      '<input class="pv-input" placeholder="Placeholder">' +
      '<input class="pv-input" value="Filled value">' +
      '<input class="pv-input err" value="Invalid value">' +
      '<input class="pv-input" value="Disabled" disabled>' +
      '<input class="pv-input" type="password" value="............">' +
      '</div>'),
    d('Textarea', 'Same treatment, resizable vertically.',
      '<textarea class="pv-input pv-textarea gx-w-md" placeholder="Describe the design language you are after&#8230;"></textarea>')
  ]);

  C('input-group', 'Input group', 'An input welded to something else: a prefix, a suffix, a button, or a toolbar above and below.', ['form', 'compound', 'addon'], [
    d('Inline addons', 'inline-start and inline-end.',
      '<div class="gx-col gx-w-md">' +
      '<div class="pv-igroup"><span class="pv-addon">https://</span><input class="pv-input" value="prism.design"></div>' +
      '<div class="pv-igroup"><input class="pv-input" value="theme-export"><span class="pv-addon">.json</span></div>' +
      '<div class="pv-igroup"><span class="pv-addon">&#9906;</span><input class="pv-input" placeholder="Search tokens"><button type="button" class="pv-btn primary">Go</button></div>' +
      '</div>'),
    d('Block addons', 'block-start and block-end, for a composer.',
      '<div class="pv-igroup-block gx-w-md">' +
      '<div class="bar"><span class="pv-badge secondary">Editorial</span><span class="pv-mute pv-sm" style="margin-left:auto">Markdown</span></div>' +
      '<textarea class="pv-input pv-textarea" placeholder="Write a note about this theme&#8230;"></textarea>' +
      '<div class="bar"><button type="button" class="pv-btn ghost xs">Attach</button><button type="button" class="pv-btn primary xs" style="margin-left:auto">Send</button></div>' +
      '</div>')
  ]);

  C('input-otp', 'Input OTP', 'One box per character for a one-time code. Paste fills every box, and the caret moves on its own.', ['form', 'auth', 'code'], [
    d('Six digits', 'Grouped three and three.',
      '<div class="pv-otp">' +
      '<div class="cell">4</div><div class="cell">1</div><div class="cell">7</div>' +
      '<div class="dash">&ndash;</div>' +
      '<div class="cell">2</div><div class="cell on">&nbsp;</div><div class="cell">&nbsp;</div>' +
      '</div>'),
    d('Four digits', 'Ungrouped, for a shorter code.',
      '<div class="pv-otp"><div class="cell">9</div><div class="cell">3</div><div class="cell">0</div><div class="cell on">&nbsp;</div></div>')
  ]);

  C('item', 'Item', 'A row. Media on the left, text in the middle, actions on the right. The building block of every list in the product.', ['list', 'row', 'layout'], [
    d('Variants', 'default, outline, muted.',
      '<div class="gx-col">' +
      '<div class="pv-item"><span class="pv-avatar sm">AJ</span><div><div class="pv-item-t">Editorial</div><div class="pv-item-d">Updated 2 hours ago</div></div><div class="pv-item-act"><span class="pv-badge secondary">Live</span></div></div>' +
      '<div class="pv-item outline"><span class="pv-avatar sm brand">MK</span><div><div class="pv-item-t">Mono</div><div class="pv-item-d">Updated yesterday</div></div><div class="pv-item-act"><button type="button" class="pv-btn ghost sm">Open</button></div></div>' +
      '<div class="pv-item muted"><span class="pv-avatar sm sq">TX</span><div><div class="pv-item-t">Terrace</div><div class="pv-item-d">Draft</div></div><div class="pv-item-act"><span class="pv-badge outline">Draft</span></div></div>' +
      '</div>'),
    d('Small', 'Tighter padding for dense lists.',
      '<div class="gx-col" style="gap:2px">' +
      '<div class="pv-item sm"><span class="pv-avatar xs">1</span><div class="pv-item-t">primary</div><div class="pv-item-act pv-mute pv-sm">oklch(.58 .19 258)</div></div>' +
      '<div class="pv-item sm"><span class="pv-avatar xs">2</span><div class="pv-item-t">secondary</div><div class="pv-item-act pv-mute pv-sm">oklch(.94 .01 258)</div></div>' +
      '<div class="pv-item sm"><span class="pv-avatar xs">3</span><div class="pv-item-t">destructive</div><div class="pv-item-act pv-mute pv-sm">oklch(.58 .21 27)</div></div>' +
      '</div>')
  ]);

  C('kbd', 'Kbd', 'A key or a chord, drawn to look like a key. Small, monospaced, and it sits inline in a sentence without breaking the line.', ['keyboard', 'shortcut', 'inline'], [
    d('Keys and chords', '',
      '<div class="gx-col">' +
      '<div class="gx-row"><span class="pv-kbd">&#8984;</span><span class="pv-kbd">&#8679;</span><span class="pv-kbd">&#8997;</span><span class="pv-kbd">&#8963;</span><span class="pv-kbd">&#9166;</span><span class="pv-kbd">&#9003;</span><span class="pv-kbd">Esc</span><span class="pv-kbd">Tab</span></div>' +
      '<div class="pv-sm">Press <span class="pv-kbd">&#8984;</span> <span class="pv-kbd">K</span> to open the palette, or <span class="pv-kbd">&#8984;</span> <span class="pv-kbd">&#8679;</span> <span class="pv-kbd">P</span> to jump to a theme.</div>' +
      '</div>')
  ]);

  C('label', 'Label', 'The name of a control. Clicking it focuses the control, which is most of the point.', ['form', 'text', 'a11y'], [
    d('With controls', '',
      '<div class="gx-col gx-w-md">' +
      '<div><label class="pv-field-label" style="display:block;margin-bottom:6px">Theme name</label><input class="pv-input" value="Editorial"></div>' +
      '<label class="pv-check"><input type="checkbox" checked><span class="pv-box"></span><span>The whole row is clickable</span></label>' +
      '<div><label class="pv-field-label" style="display:block;margin-bottom:6px">Required <span style="color:var(--destructive)">*</span></label><input class="pv-input" placeholder="Cannot be empty"></div>' +
      '</div>')
  ]);

  C('marker', 'Marker', 'A line that divides a stream: a date in a chat, a version in a changelog, an unread rule in a list.', ['divider', 'timeline', 'chat'], [
    d('Variants', 'default, separator, border.',
      '<div class="gx-col" style="gap:18px">' +
      '<div class="pv-marker"><span class="pill">Today</span></div>' +
      '<div class="pv-marker separator"><span class="pill">Yesterday</span></div>' +
      '<div class="pv-marker border">v2.4.0 &middot; released 12 March</div>' +
      '</div>'),
    d('In a stream', '',
      '<div class="gx-col" style="max-width:520px">' +
      '<div class="pv-bubble muted">Warmed the seed and regenerated.</div>' +
      '<div class="pv-marker separator"><span class="pill">Today</span></div>' +
      '<div class="pv-bubble default me">Looks right. Export it.</div>' +
      '</div>')
  ]);

  C('menubar', 'Menubar', 'The application menu bar. A row of triggers, each opening the same menu surface as the dropdown.', ['menu', 'navigation', 'desktop'], [
    d('Bar and open menu', 'Click a trigger.',
      '<div class="gx-col" style="align-items:flex-start">' +
      '<div class="pv-menubar"><button type="button" class="on">File</button><button type="button">Edit</button><button type="button">Theme</button><button type="button">View</button><button type="button">Help</button></div>' +
      '<div class="pv-surface" style="width:230px">' +
      '<div class="pv-menu-pad">' +
      '<div class="pv-menu-item">New theme<span class="kb"><span class="pv-kbd">&#8984;</span> <span class="pv-kbd">N</span></span></div>' +
      '<div class="pv-menu-item">Open&#8230;<span class="kb"><span class="pv-kbd">&#8984;</span> <span class="pv-kbd">O</span></span></div>' +
      '<div class="pv-menu-sep"></div>' +
      '<div class="pv-menu-item">Export tokens<span class="kb"><span class="pv-kbd">&#8984;</span> <span class="pv-kbd">E</span></span></div>' +
      '<div class="pv-menu-item disabled">Publish</div>' +
      '</div></div></div>')
  ]);

  C('message', 'Message', 'One entry in a thread: who, when, and what they said. Pairs with bubble when the turn needs a fill.', ['chat', 'thread', 'comment'], [
    d('Thread', '',
      '<div class="gx-col" style="gap:18px;max-width:560px">' +
      '<div class="pv-msg"><span class="pv-avatar sm">AJ</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Apparicio</span><span class="pv-msg-when">09:14</span></div><div class="pv-msg-text">The mid stops on the neutral ramp feel a touch cold against the brand.</div></div></div>' +
      '<div class="pv-msg"><span class="pv-avatar sm brand">PS</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Prism</span><span class="pv-msg-when">09:14</span><span class="pv-badge ghost" style="font-size:10px">assistant</span></div><div class="pv-msg-text">Pulled 4 degrees of the brand hue into the neutrals. Contrast is unchanged at every pair.</div></div></div>' +
      '<div class="pv-msg"><span class="pv-avatar sm">MK</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Maya</span><span class="pv-msg-when">09:21</span></div><div class="pv-msg-text">Much better. Ship it.</div></div></div>' +
      '</div>')
  ]);

  C('message-scroller', 'Message scroller', 'The container a thread lives in. It pins to the bottom as messages arrive, and lets go the moment someone scrolls up.', ['chat', 'scroll', 'thread'], [
    d('Pinned to the latest', 'Scroll up and the pin releases.',
      '<div class="pv-scroller gx-w-md" style="max-width:560px">' +
      '<div class="pv-marker separator"><span class="pill">Tuesday</span></div>' +
      '<div class="pv-msg"><span class="pv-avatar sm">AJ</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Apparicio</span><span class="pv-msg-when">14:02</span></div><div class="pv-msg-text">Generate a warmer variant of Editorial.</div></div></div>' +
      '<div class="pv-msg"><span class="pv-avatar sm brand">PS</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Prism</span><span class="pv-msg-when">14:02</span></div><div class="pv-msg-text">Done. Hue moved from 258 to 42, chroma held at the mid stops so the neutrals stay usable.</div></div></div>' +
      '<div class="pv-msg"><span class="pv-avatar sm">AJ</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Apparicio</span><span class="pv-msg-when">14:05</span></div><div class="pv-msg-text">And the dark set?</div></div></div>' +
      '<div class="pv-msg"><span class="pv-avatar sm brand">PS</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Prism</span><span class="pv-msg-when">14:05</span></div><div class="pv-msg-text">Regenerated alongside. Every pair clears AA, three clear AAA.</div></div></div>' +
      '<div class="pv-msg"><span class="pv-avatar sm">AJ</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Apparicio</span><span class="pv-msg-when">14:07</span></div><div class="pv-msg-text">Export both.</div></div></div>' +
      '</div>')
  ]);

  C('native-select', 'Native select', 'The browser select, restyled but not replaced. It keeps the platform picker on mobile, which is usually the right call.', ['form', 'select', 'native'], [
    d('Default', '',
      '<div class="gx-row">' +
      '<select class="pv-select"><option>Editorial</option><option>Mono</option><option>Terrace</option></select>' +
      '<select class="pv-select" disabled><option>Locked by preset</option></select>' +
      '</div>')
  ]);

  C('navigation-menu', 'Navigation menu', 'Top-level site navigation where an item can open a panel of links rather than going straight somewhere.', ['navigation', 'menu', 'header'], [
    d('With a panel', '',
      '<div class="gx-col" style="align-items:flex-start">' +
      '<nav class="pv-navmenu"><a href="#preview/navigation-menu" class="on">Product &#9662;</a><a href="#preview/navigation-menu">Docs</a><a href="#preview/navigation-menu">Pricing</a><a href="#preview/navigation-menu">Changelog</a></nav>' +
      '<div class="pv-surface"><div class="pv-navpanel">' +
      '<a href="#preview/navigation-menu"><div class="t">Token engine</div><div class="d">Ramps, contrast and the semantic layer.</div></a>' +
      '<a href="#preview/navigation-menu"><div class="t">Controller</div><div class="d">Define themes, colours and materials.</div></a>' +
      '<a href="#preview/navigation-menu"><div class="t">Components</div><div class="d">Sixty-one, all themed from the same source.</div></a>' +
      '<a href="#preview/navigation-menu"><div class="t">Export</div><div class="d">CSS, Tailwind, Figma and native.</div></a>' +
      '</div></div></div>')
  ]);

  C('pagination', 'Pagination', 'Moving through a list a page at a time, with the run of numbers collapsing once there are too many to show.', ['navigation', 'list', 'table'], [
    d('Default', '',
      '<nav class="pv-pager">' +
      '<a href="#preview/pagination">&#8249; Previous</a>' +
      '<a href="#preview/pagination">1</a><a href="#preview/pagination" class="on">2</a><a href="#preview/pagination">3</a>' +
      '<span class="gap">&#8230;</span><a href="#preview/pagination">24</a>' +
      '<a href="#preview/pagination">Next &#8250;</a>' +
      '</nav>'),
    d('Compact', 'When the count matters more than the position.',
      '<div class="gx-row"><span class="pv-mute pv-sm">Page 2 of 24</span><nav class="pv-pager"><a href="#preview/pagination">&#8249;</a><a href="#preview/pagination">&#8250;</a></nav></div>')
  ]);

  C('popover', 'Popover', 'A small floating surface anchored to a trigger. Unlike a tooltip it can hold controls and takes focus.', ['overlay', 'floating', 'anchor'], [
    d('With controls', '',
      '<div class="gx-row" style="align-items:flex-start;gap:20px">' +
      '<button type="button" class="pv-btn outline">Radius</button>' +
      '<div class="pv-surface" style="width:280px;padding:16px">' +
      '<div class="pv-item-t" style="margin-bottom:4px">Corner radius</div>' +
      '<div class="pv-item-d" style="margin-bottom:12px">Applies to every surface at once.</div>' +
      '<div class="pv-slider"><input type="range" min="0" max="24" value="10"></div>' +
      '<div class="gx-row" style="justify-content:space-between;margin-top:8px"><span class="pv-mute pv-sm">0px</span><span class="pv-mute pv-sm">24px</span></div>' +
      '</div></div>')
  ]);

  C('progress', 'Progress', 'How far through something is. Determinate when the end is known, and mapped onto the status tokens when the outcome matters.', ['feedback', 'loading', 'status'], [
    d('Bar', '',
      '<div class="gx-col gx-w-md">' +
      '<div><div class="gx-cap">34%</div><div class="pv-progress"><i style="width:34%"></i></div></div>' +
      '<div><div class="gx-cap">Complete</div><div class="pv-progress success"><i style="width:100%"></i></div></div>' +
      '<div><div class="gx-cap">Needs review</div><div class="pv-progress warning"><i style="width:72%"></i></div></div>' +
      '<div><div class="gx-cap">Failed</div><div class="pv-progress error"><i style="width:48%"></i></div></div>' +
      '<div><div class="gx-cap">Thin</div><div class="pv-progress thin"><i style="width:60%"></i></div></div>' +
      '</div>'),
    d('Ring', 'For a compact slot where a bar would not fit.',
      '<div class="gx-row" style="gap:20px">' +
      '<div class="pv-ring" style="background:conic-gradient(var(--primary) 0 25%, var(--muted) 25% 100%)"><span style="background:var(--card);width:42px;height:42px;border-radius:50%;display:grid;place-items:center">25%</span></div>' +
      '<div class="pv-ring" style="background:conic-gradient(var(--primary) 0 68%, var(--muted) 68% 100%)"><span style="background:var(--card);width:42px;height:42px;border-radius:50%;display:grid;place-items:center">68%</span></div>' +
      '<div class="pv-ring" style="background:conic-gradient(var(--success) 0 100%)"><span style="background:var(--card);width:42px;height:42px;border-radius:50%;display:grid;place-items:center">&#10003;</span></div>' +
      '</div>')
  ]);

  C('radio-group', 'Radio group', 'One choice from a set, where seeing all the options at once is worth the space. Otherwise use a select.', ['form', 'input', 'choice'], [
    d('Default', '',
      '<div class="gx-col">' +
      '<label class="pv-check pv-radio"><input type="radio" name="gx-r1" checked><span class="pv-box"></span><span>Flat</span></label>' +
      '<label class="pv-check pv-radio"><input type="radio" name="gx-r1"><span class="pv-box"></span><span>Frosted</span></label>' +
      '<label class="pv-check pv-radio"><input type="radio" name="gx-r1"><span class="pv-box"></span><span>Elevated</span></label>' +
      '<label class="pv-check pv-radio disabled"><input type="radio" name="gx-r1" disabled><span class="pv-box"></span><span>Neumorphic</span></label>' +
      '</div>'),
    d('With descriptions', 'As cards, when the choice deserves explaining.',
      '<div class="gx-col gx-w-md">' +
      '<label class="pv-check pv-radio pv-item outline" style="width:100%"><input type="radio" name="gx-r2" checked><span class="pv-box"></span><span><span class="pv-item-t">Generate both modes</span><span class="pv-check-d">Light and dark from the same seed, contrast checked in each.</span></span></label>' +
      '<label class="pv-check pv-radio pv-item outline" style="width:100%"><input type="radio" name="gx-r2"><span class="pv-box"></span><span><span class="pv-item-t">Light only</span><span class="pv-check-d">Half the tokens, and no dark set to keep in step.</span></span></label>' +
      '</div>')
  ]);

  /* =======================================================================
     Component registry — R to T
     ======================================================================= */

  C('resizable', 'Resizable', 'Panels the person can size themselves, with a handle between them that remembers where it was left.', ['layout', 'panel', 'split'], [
    d('Two panels', 'Drag the handle.',
      '<div class="pv-resize">' +
      '<div class="pane-a p">Navigation</div>' +
      '<div class="handle"></div>' +
      '<div class="pane-b p">Content</div>' +
      '</div>')
  ]);

  C('scroll-area', 'Scroll area', 'A scrolling box with a styled bar, so the scrollbar stops looking like a different operating system in the middle of your interface.', ['layout', 'scroll', 'overflow'], [
    d('Vertical', '',
      '<div class="pv-scrollarea gx-w-md">' +
      '<div class="gx-col" style="gap:2px">' +
      ['primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'tertiary', 'muted', 'muted-foreground', 'accent', 'accent-foreground', 'destructive', 'success', 'warning', 'info', 'background', 'foreground', 'card', 'card-foreground', 'popover', 'border', 'input', 'ring', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'].map(function (n) {
        return '<div class="pv-item sm"><span style="width:14px;height:14px;border-radius:4px;background:var(--' + n + ');border:var(--bw) solid var(--border);flex:none"></span><span class="pv-sm" style="font-family:var(--mono)">--' + n + '</span></div>';
      }).join('') +
      '</div></div>')
  ]);

  C('select', 'Select', 'The custom select: a trigger and a floating list, so options can carry icons, descriptions and groups.', ['form', 'dropdown', 'choice'], [
    d('Closed and open', '',
      '<div class="gx-row" style="align-items:flex-start;gap:20px">' +
      '<div class="pv-trigger">Editorial<span class="caret">&#9662;</span></div>' +
      '<div class="pv-surface" style="width:230px"><div class="pv-menu-pad">' +
      '<div class="pv-menu-label">Presets</div>' +
      '<div class="pv-menu-item on"><span class="ic">&#10003;</span>Editorial</div>' +
      '<div class="pv-menu-item"><span class="ic"></span>Mono</div>' +
      '<div class="pv-menu-item"><span class="ic"></span>Terrace</div>' +
      '<div class="pv-menu-sep"></div>' +
      '<div class="pv-menu-label">Yours</div>' +
      '<div class="pv-menu-item"><span class="ic"></span>Untitled theme</div>' +
      '</div></div></div>')
  ]);

  C('separator', 'Separator', 'A rule. Horizontal between blocks, vertical between inline controls.', ['layout', 'divider'], [
    d('Horizontal and vertical', '',
      '<div class="gx-col gx-w-md">' +
      '<div><div class="pv-item-t">Theme</div><div class="pv-item-d">Editorial, generated from #2F6BFF.</div></div>' +
      '<hr class="pv-sep">' +
      '<div class="gx-row"><span class="pv-sm">Tokens</span><i class="pv-sep vert"></i><span class="pv-sm">Ramps</span><i class="pv-sep vert"></i><span class="pv-sm">Export</span></div>' +
      '</div>')
  ]);

  C('sheet', 'Sheet', 'A panel that slides in from an edge. Use it for secondary work that should not lose the page behind it.', ['overlay', 'panel', 'drawer'], [
    d('From the right', '',
      '<div class="pv-scrim right"><div class="pv-surface pv-sheet">' +
      '<div class="pv-dialog-t">Token detail</div>' +
      '<div class="pv-dialog-d">--primary</div>' +
      '<div class="gx-col" style="margin-top:18px">' +
      '<div style="height:48px;border-radius:calc(var(--radius) * 1.1);background:var(--primary)"></div>' +
      '<div class="pv-field horiz"><span class="pv-field-label">OKLCH</span><span class="pv-sm pv-mute" style="font-family:var(--mono)">.58 .19 258</span></div>' +
      '<div class="pv-field horiz"><span class="pv-field-label">Contrast</span><span class="pv-badge success">5.2:1 AA</span></div>' +
      '</div></div></div>')
  ]);

  C('sidebar', 'Sidebar', 'The application shell: a collapsible rail of navigation with groups, an active state and room for a footer.', ['navigation', 'layout', 'shell'], [
    d('App shell', '',
      '<div class="pv-appshell">' +
      '<nav class="pv-sidebar">' +
      '<div class="grp">Workspace</div>' +
      '<a href="#preview/sidebar" class="on"><i class="sq"></i>Overview</a>' +
      '<a href="#preview/sidebar"><i class="sq"></i>Themes</a>' +
      '<a href="#preview/sidebar"><i class="sq"></i>Tokens</a>' +
      '<div class="grp">Library</div>' +
      '<a href="#preview/sidebar"><i class="sq"></i>Components</a>' +
      '<a href="#preview/sidebar"><i class="sq"></i>Icons</a>' +
      '<a href="#preview/sidebar"><i class="sq"></i>Imagery</a>' +
      '<div style="margin-top:auto"><a href="#preview/sidebar"><i class="sq"></i>Settings</a></div>' +
      '</nav>' +
      '<div class="pv-appmain">' +
      '<div class="pv-h" style="font-size:18px;margin-bottom:6px">Overview</div>' +
      '<div class="pv-mute pv-sm" style="margin-bottom:16px">Twelve ramps, forty-two semantic tokens, both modes.</div>' +
      '<div class="gx-row"><span class="pv-badge success">AA everywhere</span><span class="pv-badge secondary">Editorial</span></div>' +
      '</div></div>')
  ]);

  C('skeleton', 'Skeleton', 'The shape of the content before the content arrives. It should match what is coming, or it makes the wait feel longer.', ['loading', 'placeholder', 'state'], [
    d('Card', '',
      '<div class="pv-card gx-w-md">' +
      '<div class="gx-row" style="flex-wrap:nowrap;margin-bottom:16px"><div class="pv-skel circle" style="width:40px;height:40px;flex:none"></div><div style="flex:1"><div class="pv-skel line" style="width:44%;margin-bottom:8px"></div><div class="pv-skel line" style="width:28%;height:9px"></div></div></div>' +
      '<div class="pv-skel line" style="margin-bottom:8px"></div>' +
      '<div class="pv-skel line" style="margin-bottom:8px"></div>' +
      '<div class="pv-skel line" style="width:62%"></div>' +
      '</div>'),
    d('List', '',
      '<div class="gx-col gx-w-md">' +
      '<div class="gx-row" style="flex-wrap:nowrap"><div class="pv-skel" style="width:32px;height:32px;flex:none"></div><div class="pv-skel line" style="flex:1"></div></div>' +
      '<div class="gx-row" style="flex-wrap:nowrap"><div class="pv-skel" style="width:32px;height:32px;flex:none"></div><div class="pv-skel line" style="flex:1"></div></div>' +
      '<div class="gx-row" style="flex-wrap:nowrap"><div class="pv-skel" style="width:32px;height:32px;flex:none"></div><div class="pv-skel line" style="flex:1"></div></div>' +
      '</div>')
  ]);

  C('slider', 'Slider', 'A value along a range, where the shape of the range matters more than the exact number.', ['form', 'input', 'range'], [
    d('Single value', '',
      '<div class="gx-col gx-w-md">' +
      '<div><div class="gx-row" style="justify-content:space-between"><span class="pv-field-label">Chroma</span><span class="pv-sm pv-mute" style="font-family:var(--mono)">0.19</span></div><div class="pv-slider"><input type="range" min="0" max="100" value="62"></div></div>' +
      '<div><div class="gx-row" style="justify-content:space-between"><span class="pv-field-label">Spacing</span><span class="pv-sm pv-mute" style="font-family:var(--mono)">4px</span></div><div class="pv-slider"><input type="range" min="0" max="100" value="35"></div></div>' +
      '<div><div class="pv-field-label" style="margin-bottom:4px">Disabled</div><div class="pv-slider disabled"><input type="range" min="0" max="100" value="80" disabled></div></div>' +
      '</div>')
  ]);

  C('sonner', 'Sonner', 'Toasts. They stack in a corner, they time out, and they never block what the person was doing.', ['feedback', 'toast', 'notification'], [
    d('Stack', '',
      '<div class="gx-col" style="align-items:flex-end">' +
      '<div class="pv-toast success"><i class="tic"></i><div><div class="pv-toast-t">Tokens exported</div><div class="pv-toast-d">42 semantic tokens written to editorial.css.</div></div></div>' +
      '<div class="pv-toast info"><i class="tic"></i><div><div class="pv-toast-t">Dark set regenerated</div><div class="pv-toast-d">Every pair still clears AA.</div></div></div>' +
      '<div class="pv-toast warning"><i class="tic"></i><div><div class="pv-toast-t">Two pairs are close</div><div class="pv-toast-d">muted-foreground on muted sits at 4.6:1.</div></div></div>' +
      '<div class="pv-toast error"><i class="tic"></i><div><div class="pv-toast-t">Export failed</div><div class="pv-toast-d">The output folder is not writable.</div></div></div>' +
      '</div>'),
    d('With an action', '',
      /* Right aligned like the stack above it, otherwise the two blocks read as
         two different corners of the screen. */
      '<div class="gx-col" style="align-items:flex-end">' +
      '<div class="pv-toast"><i class="tic" style="background:var(--muted-foreground)"></i><div style="flex:1"><div class="pv-toast-t">Theme archived</div><div class="pv-toast-d">Terrace has been moved out of the switcher.</div></div><button type="button" class="pv-btn ghost xs">Undo</button></div>' +
      '</div>')
  ]);

  C('spinner', 'Spinner', 'Something is happening and we do not know how long it will take. If we do know, use progress instead.', ['loading', 'feedback'], [
    d('Sizes', '',
      '<div class="gx-row" style="gap:20px"><span class="pv-spin sm"></span><span class="pv-spin"></span><span class="pv-spin lg"></span></div>'),
    d('In context', 'On a button, and as a dot sequence for a typing state.',
      '<div class="gx-row" style="gap:20px">' +
      '<button type="button" class="pv-btn primary loading"><span class="pv-spin sm on-primary" style="vertical-align:-3px"></span>&nbsp; Generating</button>' +
      '<div class="pv-bubble muted"><span class="pv-dots"><i></i><i></i><i></i></span></div>' +
      '</div>')
  ]);

  C('switch', 'Switch', 'A setting that takes effect the moment it is flipped. If it needs a save button, use a checkbox.', ['form', 'toggle', 'setting'], [
    d('States', '',
      '<div class="gx-col">' +
      '<label class="pv-switch"><input type="checkbox"><span class="pv-track"></span><span>Off</span></label>' +
      '<label class="pv-switch"><input type="checkbox" checked><span class="pv-track"></span><span>On</span></label>' +
      '<label class="pv-switch disabled"><input type="checkbox" disabled><span class="pv-track"></span><span>Disabled</span></label>' +
      '<label class="pv-switch disabled"><input type="checkbox" checked disabled><span class="pv-track"></span><span>Disabled and on</span></label>' +
      '</div>'),
    d('In a settings row', '',
      '<div class="gx-col gx-w-md" style="max-width:480px">' +
      '<div class="pv-field horiz"><div><div class="pv-field-label">Reduce motion</div><div class="pv-field-desc">Honour the system preference and drop transitions.</div></div><label class="pv-switch"><input type="checkbox" checked><span class="pv-track"></span></label></div>' +
      '<hr class="pv-sep">' +
      '<div class="pv-field horiz"><div><div class="pv-field-label">High contrast</div><div class="pv-field-desc">Push every pair to AAA where the ramp allows it.</div></div><label class="pv-switch"><input type="checkbox"><span class="pv-track"></span></label></div>' +
      '</div>')
  ]);

  C('table', 'Table', 'Rows and columns. Numbers right aligned and monospaced, headers quiet, and a footer for the totals.', ['data', 'list', 'grid'], [
    d('With a footer', '',
      '<table class="pv-table">' +
      '<thead><tr><th>Theme</th><th>Seed</th><th>Mode</th><th>Status</th><th class="num">Tokens</th></tr></thead>' +
      '<tbody>' +
      '<tr><td><div class="gx-row" style="flex-wrap:nowrap"><span class="pv-avatar xs brand">E</span>Editorial</div></td><td style="font-family:var(--mono);font-size:12px">#2F6BFF</td><td>Light &amp; dark</td><td><span class="pv-badge success">AA</span></td><td class="num">42</td></tr>' +
      '<tr><td><div class="gx-row" style="flex-wrap:nowrap"><span class="pv-avatar xs">M</span>Mono</div></td><td style="font-family:var(--mono);font-size:12px">#111111</td><td>Light &amp; dark</td><td><span class="pv-badge success">AAA</span></td><td class="num">42</td></tr>' +
      '<tr><td><div class="gx-row" style="flex-wrap:nowrap"><span class="pv-avatar xs">T</span>Terrace</div></td><td style="font-family:var(--mono);font-size:12px">#C2703A</td><td>Light only</td><td><span class="pv-badge warning">Review</span></td><td class="num">21</td></tr>' +
      '<tr><td><div class="gx-row" style="flex-wrap:nowrap"><span class="pv-avatar xs">S</span>Slate</div></td><td style="font-family:var(--mono);font-size:12px">#475569</td><td>Dark only</td><td><span class="pv-badge outline">Draft</span></td><td class="num">21</td></tr>' +
      '</tbody>' +
      '<tfoot><tr><td colspan="4">4 themes</td><td class="num">126</td></tr></tfoot>' +
      '</table>')
  ]);

  C('tabs', 'Tabs', 'Sibling views in one space. Two variants: a filled segmented control, and an underlined bar for page-level sections.', ['navigation', 'layout', 'sections'], [
    d('Default', 'The segmented variant.',
      '<div><div class="pv-tabs"><button type="button" class="on" data-panel="Twelve ramps, generated in OKLCH from a single seed.">Colour</button><button type="button" data-panel="Heading and body families, weights and the scale between them.">Type</button><button type="button" data-panel="Blur, highlight and the shadow set, applied to every surface at once.">Material</button></div>' +
      '<div class="pv-tabpanel">Twelve ramps, generated in OKLCH from a single seed.</div></div>'),
    d('Line', 'For page-level sections, where a filled control would be too loud.',
      '<div><div class="pv-tabs line"><button type="button" class="on" data-panel="Everything the person can see and change right now.">Overview</button><button type="button" data-panel="The resolved value of every semantic token, in both modes.">Tokens</button><button type="button" data-panel="Every pair, tested against WCAG 2.2.">Contrast</button><button type="button" data-panel="CSS, Tailwind, Figma and native targets.">Export</button></div>' +
      '<div class="pv-tabpanel">Everything the person can see and change right now.</div></div>')
  ]);

  C('textarea', 'Textarea', 'Several lines of text. Resizable vertically only, so it can never break the column it sits in.', ['form', 'text', 'input'], [
    d('States', '',
      '<div class="gx-col gx-w-md">' +
      '<textarea class="pv-input pv-textarea" placeholder="Describe the design language&#8230;"></textarea>' +
      '<textarea class="pv-input pv-textarea">Editorial is warm, quiet and confident. Generous line height, a single accent, and no decoration that does not carry meaning.</textarea>' +
      '<textarea class="pv-input pv-textarea" disabled>Locked by the preset.</textarea>' +
      '</div>')
  ]);

  C('toggle', 'Toggle', 'A button that stays pressed. Use it for a formatting state or a filter, not for navigation.', ['form', 'button', 'state'], [
    d('Variants and sizes', 'default and outline, in sm, default and lg. Click to toggle.',
      '<div class="gx-col" style="align-items:flex-start">' +
      '<div class="gx-row"><button type="button" class="pv-toggle on"><b>B</b></button><button type="button" class="pv-toggle"><i>I</i></button><button type="button" class="pv-toggle"><u>U</u></button></div>' +
      '<div class="gx-row"><button type="button" class="pv-toggle outline sm">Small</button><button type="button" class="pv-toggle outline">Default</button><button type="button" class="pv-toggle outline lg">Large</button></div>' +
      '</div>')
  ]);

  C('toggle-group', 'Toggle group', 'Toggles that know about each other. Single selection behaves like a segmented control, multiple behaves like a set of filters.', ['form', 'segmented', 'filter'], [
    d('Single', 'One at a time.',
      '<div class="pv-tgroup"><button type="button" class="pv-toggle on">Left</button><button type="button" class="pv-toggle">Centre</button><button type="button" class="pv-toggle">Right</button></div>'),
    d('Multiple', 'Any number at once.',
      '<div class="pv-tgroup" data-multi><button type="button" class="pv-toggle on"><b>B</b></button><button type="button" class="pv-toggle on"><i>I</i></button><button type="button" class="pv-toggle"><u>U</u></button><button type="button" class="pv-toggle"><s>S</s></button></div>')
  ]);

  C('tooltip', 'Tooltip', 'A word or two explaining a control, on hover or focus. It can never hold anything the person needs to click.', ['overlay', 'hint', 'a11y'], [
    d('Above the trigger', '',
      '<div class="gx-row" style="gap:36px;padding-top:12px">' +
      '<div style="text-align:center"><div class="pv-tip" style="margin-bottom:9px">Regenerate ramps</div><div><button type="button" class="pv-btn outline icon" aria-label="Regenerate">&#8635;</button></div></div>' +
      '<div style="text-align:center"><div class="pv-tip" style="margin-bottom:9px">&#8984; K</div><div><button type="button" class="pv-btn outline icon" aria-label="Search">&#9906;</button></div></div>' +
      '<div style="text-align:center"><div class="pv-tip" style="margin-bottom:9px">Copy CSS variables</div><div><button type="button" class="pv-btn outline icon" aria-label="Copy">&#10697;</button></div></div>' +
      '</div>')
  ]);

  /* =======================================================================
     Screens
     ======================================================================= */

  function swatch(name, label) {
    var v = tok(name);
    return '<div class="gx-sw"><div class="gx-chip" style="background:var(--' + name + ')"></div>' +
      '<div class="meta"><div class="n">' + (label || name) + '</div><div class="v">' + (v || '&mdash;') + '</div></div></div>';
  }

  function swatchGrid(names) {
    return '<div class="gx-swatches">' + names.map(function (n) { return swatch(n); }).join('') + '</div>';
  }

  function section(title, note) {
    return '<div class="gx-demo-head" style="margin-top:34px"><div class="gx-demo-label" style="font-size:15px">' + title + '</div>' +
      (note ? '<div class="gx-demo-note">' + note + '</div>' : '') + '</div>';
  }

  PAGES.brand = function () {
    var h = '';

    h += '<div class="gx-brand-hero">' +
      '<h2>One seed. The whole system.</h2>' +
      '<p>Every colour, every surface, every piece of type on this page is generated from a single decision and checked for contrast before it is allowed out.</p>' +
      '</div>';

    h += head('Brand overview', 'The theme as it stands right now. Change anything in the panel on the left and this page moves with it.', ['live tokens', 'OKLCH', 'WCAG 2.2']);

    h += section('Brand', 'The colours that carry identity.');
    h += swatchGrid(['primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'tertiary', 'accent']);

    h += section('Status', 'Reserved meanings. Never use these decoratively.');
    h += swatchGrid(['destructive', 'success', 'warning', 'info']);

    h += section('Surface', 'What everything else is drawn on.');
    h += swatchGrid(['background', 'foreground', 'card', 'card-foreground', 'muted', 'muted-foreground', 'border', 'ring']);

    h += section('Data', 'The chart ramp, kept clear of the brand colour on purpose.');
    h += swatchGrid(['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']);

    h += section('Type', 'Two families, one scale.');
    h += '<div class="gx-demo-canvas">' +
      '<div class="pv-h" style="font-size:44px;line-height:1.08;letter-spacing:-.03em">Design decisions,<br>written down once.</div>' +
      '<div style="font-size:15px;line-height:1.7;max-width:62ch;margin-top:18px;color:var(--muted-foreground)">Body copy sits at fifteen pixels with generous leading, because most of what anyone reads in a product is a sentence, not a heading. The measure is capped at sixty-two characters so the eye never loses the line.</div>' +
      '<div class="gx-row" style="margin-top:22px">' +
      '<span class="gx-tag">heading &middot; ' + (tok('font-heading') || 'inherit') + '</span>' +
      '<span class="gx-tag">body &middot; ' + (tok('font-body') || 'inherit') + '</span>' +
      '<span class="gx-tag">radius &middot; ' + (tok('radius') || '&mdash;') + '</span>' +
      '</div></div>';

    h += section('Shape and elevation', 'Radius, border weight and the shadow set, applied to every surface at once.');
    h += '<div class="gx-demo-canvas"><div class="gx-row" style="gap:18px">' +
      '<div class="pv-card" style="width:150px;height:96px;display:flex;align-items:center;justify-content:center"><span class="pv-sm pv-mute">card</span></div>' +
      '<div class="pv-surface" style="width:150px;height:96px;display:flex;align-items:center;justify-content:center"><span class="pv-sm pv-mute">popover</span></div>' +
      '<div style="width:150px;height:96px;border-radius:calc(var(--radius) * 1.5);background:var(--muted);display:flex;align-items:center;justify-content:center"><span class="pv-sm pv-mute">muted</span></div>' +
      '<div style="width:150px;height:96px;border-radius:calc(var(--radius) * 1.5);background:var(--primary);color:var(--primary-foreground);display:flex;align-items:center;justify-content:center;font-size:12.5px">primary</div>' +
      '</div></div>';

    h += section('In use', 'The same tokens, doing actual work.');
    h += '<div class="gx-demo-canvas"><div class="gx-two">' +
      '<div class="gx-col">' +
      '<div class="gx-row"><button type="button" class="pv-btn primary">Primary action</button><button type="button" class="pv-btn outline">Secondary</button><button type="button" class="pv-btn ghost">Tertiary</button></div>' +
      '<div class="gx-row"><span class="pv-badge default">Default</span><span class="pv-badge success">Passing</span><span class="pv-badge warning">Review</span><span class="pv-badge destructive">Failed</span></div>' +
      '<div class="pv-alert"><div class="pv-alert-ic"></div><div><div class="pv-alert-t">Every pair clears AA</div><div class="pv-alert-d">Three clear AAA. Two sit within 0.2 of the threshold.</div></div></div>' +
      '</div>' +
      '<div class="gx-col">' +
      '<div class="pv-field"><label class="pv-field-label">Seed</label><input class="pv-input" value="#2F6BFF"></div>' +
      '<label class="pv-switch"><input type="checkbox" checked><span class="pv-track"></span><span>Generate dark mode</span></label>' +
      '<div class="pv-progress"><i style="width:78%"></i></div>' +
      '</div>' +
      '</div></div>';

    h += section('Rules', 'The short version.');
    h += '<div class="gx-demo-canvas">' +
      '<div class="gx-rule"><span class="k do">Do</span><span>Reach for a semantic token. <b>--primary</b>, not the ramp step it happens to resolve to today.</span></div>' +
      '<div class="gx-rule"><span class="k do">Do</span><span>Let the radius, spacing and border weight come from the theme. One control, every surface.</span></div>' +
      '<div class="gx-rule"><span class="k do">Do</span><span>Pair a status colour with a word. Colour alone is not an accessible signal.</span></div>' +
      '<div class="gx-rule"><span class="k dont">No</span><span>Hard-code a hex. It will survive every rebrand and none of them will want it.</span></div>' +
      '<div class="gx-rule"><span class="k dont">No</span><span>Use <b>--destructive</b> because it looked good. It means something.</span></div>' +
      '<div class="gx-rule" style="border-bottom:0"><span class="k dont">No</span><span>Ship a pair below 4.5:1 for body text. The generator will tell you; believe it.</span></div>' +
      '</div>';

    return h;
  };

  PAGES.chat = function () {
    return head('Chat', 'A conversation screen built from bubble, message, message-scroller, marker and input-group. Nothing here is bespoke.', ['bubble', 'message-scroller', 'input-group']) +
      '<div style="display:grid;grid-template-columns:230px minmax(0,1fr);border:var(--bw) solid var(--border);border-radius:calc(var(--radius) * 1.5);overflow:hidden;height:560px;background:var(--card)">' +

      '<div style="border-right:var(--bw) solid var(--border);background:var(--muted);display:flex;flex-direction:column;min-height:0">' +
      '<div style="padding:calc(var(--sp) * 4)"><input class="pv-input" placeholder="Search" style="height:32px;font-size:12.5px"></div>' +
      '<div style="overflow-y:auto;padding:0 calc(var(--sp) * 2) calc(var(--sp) * 3);display:flex;flex-direction:column;gap:2px">' +
      '<div class="pv-item sm" style="background:var(--primary);color:var(--primary-foreground)"><span class="pv-avatar xs sq">PS</span><div style="min-width:0"><div class="pv-item-t">Prism</div><div class="pv-item-d" style="color:inherit;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Regenerated alongside&#8230;</div></div></div>' +
      '<div class="pv-item sm"><span class="pv-avatar xs">MK</span><div style="min-width:0"><div class="pv-item-t">Maya Khan</div><div class="pv-item-d" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Much better, ship it</div></div></div>' +
      '<div class="pv-item sm"><span class="pv-avatar xs">RT</span><div style="min-width:0"><div class="pv-item-t">Rui Teixeira</div><div class="pv-item-d" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Can you send the Figma?</div></div><div class="pv-item-act"><span class="pv-badge default" style="font-size:10px;padding:1px 6px">3</span></div></div>' +
      '<div class="pv-item sm"><span class="pv-avatar xs">DS</span><div style="min-width:0"><div class="pv-item-t">Design systems</div><div class="pv-item-d" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">14 members</div></div></div>' +
      '<div class="pv-item sm"><span class="pv-avatar xs">JB</span><div style="min-width:0"><div class="pv-item-t">Jo Barnes</div><div class="pv-item-d" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Thanks!</div></div></div>' +
      '</div></div>' +

      '<div style="display:flex;flex-direction:column;min-height:0">' +
      '<div style="display:flex;align-items:center;gap:calc(var(--sp) * 3);padding:calc(var(--sp) * 4) calc(var(--sp) * 5);border-bottom:var(--bw) solid var(--border)">' +
      '<span class="pv-avatar-wrap"><span class="pv-avatar sm sq brand">PS</span><i class="pv-avatar-status"></i></span>' +
      '<div><div class="pv-item-t">Prism</div><div class="pv-item-d">Token engine &middot; online</div></div>' +
      '<div style="margin-left:auto" class="gx-row"><button type="button" class="pv-btn ghost icon sm" aria-label="Search">&#9906;</button><button type="button" class="pv-btn ghost icon sm" aria-label="More">&#8942;</button></div>' +
      '</div>' +

      '<div style="flex:1;min-height:0;overflow-y:auto;padding:calc(var(--sp) * 5);display:flex;flex-direction:column;gap:calc(var(--sp) * 4)">' +
      '<div class="pv-marker separator"><span class="pill">Tuesday</span></div>' +
      '<div class="pv-bubble default me">Generate a warmer variant of Editorial.</div>' +
      '<div class="pv-msg"><span class="pv-avatar sm brand">PS</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Prism</span><span class="pv-msg-when">14:02</span></div>' +
      '<div class="pv-bubble muted">Moved the hue from 258 to 42 and held chroma at the mid stops so the neutrals stay usable. Here is what changed:</div>' +
      '<div class="gx-row" style="margin-top:10px;gap:8px">' +
      '<span style="width:34px;height:34px;border-radius:calc(var(--radius) * .9);background:var(--chart-1)"></span>' +
      '<span style="width:34px;height:34px;border-radius:calc(var(--radius) * .9);background:var(--chart-2)"></span>' +
      '<span style="width:34px;height:34px;border-radius:calc(var(--radius) * .9);background:var(--chart-3)"></span>' +
      '<span style="width:34px;height:34px;border-radius:calc(var(--radius) * .9);background:var(--chart-4)"></span>' +
      '<span style="width:34px;height:34px;border-radius:calc(var(--radius) * .9);background:var(--chart-5)"></span>' +
      '</div></div></div>' +
      '<div class="pv-bubble default me">And the dark set?</div>' +
      '<div class="pv-msg"><span class="pv-avatar sm brand">PS</span><div class="pv-msg-body"><div class="pv-msg-head"><span class="pv-msg-who">Prism</span><span class="pv-msg-when">14:05</span></div>' +
      '<div class="pv-bubble muted">Regenerated alongside. Every pair clears AA, three clear AAA.</div>' +
      '<div style="margin-top:10px" class="pv-attach"><div class="pv-attach-ic">CSS</div><div style="min-width:0"><div class="pv-attach-n">editorial-warm.css</div><div class="pv-attach-s">14 KB &middot; 42 tokens</div></div></div>' +
      '</div></div>' +
      '<div class="pv-marker separator"><span class="pill">Today</span></div>' +
      '<div class="pv-msg"><span class="pv-avatar sm brand">PS</span><div class="pv-msg-body"><div class="pv-bubble muted"><span class="pv-dots"><i></i><i></i><i></i></span></div></div></div>' +
      '</div>' +

      '<div style="padding:calc(var(--sp) * 4) calc(var(--sp) * 5);border-top:var(--bw) solid var(--border)">' +
      '<div class="pv-igroup-block">' +
      '<textarea class="pv-input pv-textarea" style="min-height:64px" placeholder="Message Prism&#8230;"></textarea>' +
      '<div class="bar"><button type="button" class="pv-btn ghost xs">Attach</button><button type="button" class="pv-btn ghost xs">Theme</button>' +
      '<span class="pv-mute" style="margin-left:auto;font-size:11px"><span class="pv-kbd">&#8984;</span> <span class="pv-kbd">&#9166;</span></span>' +
      '<button type="button" class="pv-btn primary xs">Send</button></div>' +
      '</div></div>' +

      '</div></div>';
  };

  PAGES.finances = function () {
    function stat(label, value, delta, up) {
      return '<div class="pv-card">' +
        '<div class="pv-mute" style="font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:600">' + label + '</div>' +
        '<div class="pv-h" style="font-size:28px;margin-top:8px;white-space:nowrap">' + value + '</div>' +
        '<div style="margin-top:8px;font-size:12px;color:' + (up ? 'var(--success)' : 'var(--destructive)') + '">' + (up ? '&#9650;' : '&#9660;') + ' ' + delta + ' <span class="pv-mute">vs last month</span></div>' +
        '</div>';
    }
    function row(name, cat, date, amount, neg, badge, bcls) {
      return '<tr><td><div class="gx-row" style="flex-wrap:nowrap"><span class="pv-avatar xs sq">' + name.charAt(0) + '</span>' + name + '</div></td>' +
        '<td class="pv-mute">' + cat + '</td><td class="pv-mute">' + date + '</td>' +
        '<td><span class="pv-badge ' + bcls + '">' + badge + '</span></td>' +
        '<td class="num" style="color:' + (neg ? 'inherit' : 'var(--success)') + '">' + (neg ? '&minus;' : '+') + '&pound;' + amount + '</td></tr>';
    }

    return head('Finances', 'A dense, numeric screen. Chart tokens carry the series, status tokens carry the meaning, and the monospace stack carries every figure.', ['chart', 'table', 'card']) +

      '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px;margin-bottom:22px">' +
      stat('Balance', '&pound;48,210', '12.4%', true) +
      stat('Income', '&pound;13,420', '38.1%', true) +
      stat('Spend', '&pound;9,880', '4.2%', false) +
      stat('Runway', '17<span style="font-size:16px;font-weight:500"> mo</span>', '2 months', true) +
      '</div>' +

      '<div class="gx-two" style="margin-bottom:22px">' +
      '<div class="pv-card span-2">' +
      '<div class="gx-row" style="justify-content:space-between;margin-bottom:18px">' +
      '<div><div class="pv-card-title">Cash flow</div><div class="pv-card-desc">Last twelve months</div></div>' +
      '<div class="pv-tabs"><button type="button">3M</button><button type="button">6M</button><button type="button" class="on">12M</button></div>' +
      '</div>' +
      bars([42, 58, 51, 66, 48, 74, 62, 81, 70, 88, 76, 94], 'var(--primary)') +
      '<div class="pv-legend"><span><i style="background:var(--primary)"></i>Net position</span></div>' +
      '</div>' +
      '<div class="pv-card">' +
      '<div class="pv-card-title" style="margin-bottom:16px">Where it goes</div>' +
      '<div class="gx-row" style="gap:20px;flex-wrap:nowrap">' +
      '<div style="position:relative;width:132px;height:132px;flex:none">' +
      '<div class="pv-donut" style="background:conic-gradient(var(--chart-1) 0 38%, var(--chart-2) 38% 62%, var(--chart-3) 62% 82%, var(--chart-4) 82% 100%)"></div>' +
      '<div class="pv-donut-hole"><div class="pv-h" style="font-size:18px">&pound;9.8k</div><div class="pv-mute" style="font-size:10.5px">Spend</div></div>' +
      '</div>' +
      '<div class="pv-legend" style="flex-direction:column;gap:9px;margin:0">' +
      '<span><i style="background:var(--chart-1)"></i>Payroll 38%</span>' +
      '<span><i style="background:var(--chart-2)"></i>Software 24%</span>' +
      '<span><i style="background:var(--chart-3)"></i>Office 20%</span>' +
      '<span><i style="background:var(--chart-4)"></i>Other 18%</span>' +
      '</div></div></div>' +
      '</div>' +

      '<div class="pv-card">' +
      '<div class="gx-row" style="justify-content:space-between;margin-bottom:14px">' +
      '<div class="pv-card-title">Recent transactions</div>' +
      '<div class="gx-row"><div class="pv-tgroup"><button type="button" class="pv-toggle on">All</button><button type="button" class="pv-toggle">In</button><button type="button" class="pv-toggle">Out</button></div>' +
      '<button type="button" class="pv-btn outline sm">Export</button></div>' +
      '</div>' +
      '<table class="pv-table">' +
      '<thead><tr><th>Payee</th><th>Category</th><th>Date</th><th>Status</th><th class="num">Amount</th></tr></thead><tbody>' +
      row('Northwind Studio', 'Client', '18 Jul', '4,200.00', false, 'Cleared', 'success') +
      row('Adobe', 'Software', '17 Jul', '61.99', true, 'Cleared', 'success') +
      row('Kernel Coworking', 'Office', '15 Jul', '480.00', true, 'Pending', 'warning') +
      row('Beacon Ltd', 'Client', '12 Jul', '2,750.00', false, 'Cleared', 'success') +
      row('HMRC', 'Tax', '09 Jul', '3,110.40', true, 'Scheduled', 'secondary') +
      row('Figma', 'Software', '06 Jul', '135.00', true, 'Failed', 'destructive') +
      '</tbody><tfoot><tr><td colspan="4">6 transactions</td><td class="num">+&pound;3,162.61</td></tr></tfoot></table>' +
      '<div class="gx-row" style="justify-content:space-between;margin-top:16px">' +
      '<span class="pv-mute pv-sm">Showing 6 of 148</span>' +
      '<nav class="pv-pager"><a href="#preview/finances">&#8249;</a><a href="#preview/finances" class="on">1</a><a href="#preview/finances">2</a><a href="#preview/finances">3</a><span class="gap">&#8230;</span><a href="#preview/finances">25</a><a href="#preview/finances">&#8250;</a></nav>' +
      '</div></div>';
  };

  /* ---------- go ---------- */

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
