// Derivation layer: turns the ~34 base theme tokens into the full role and
// variant matrix. Every derived token carries three things: a resolved hex for
// Style Dictionary, SCSS and Swift; a live color-mix() expression for the web
// target and the controller preview; and the recipe that produced it, so the
// Variables panel can show reasoning rather than just a result.
//
// The shape of the matrix is borrowed from HeroUI, because their split of
// role / hover / soft / soft-foreground is sound. The numbers are not borrowed.
// A published table of fixed percentages is a guess that happens to look right
// on the theme it was authored against. Run the same percentages against a pure
// black page and the whole tier system collapses into one colour: mixing black
// 96% with white lands back on rgb(0,0,0) once sRGB quantisation has had its
// say, so the "hover" state paints the same pixel as the rest state.
//
// So every number here is solved rather than declared:
//   - tier and hover mixes walk until the result is visibly distinct from the
//     colour it came from, and from the tier above it
//   - soft fills solve their alpha for a target contrast ratio against the page,
//     which behaves sensibly at both ends of the lightness range
//   - soft foregrounds walk until they clear WCAG AA on their own soft fill
//   - a hover is never allowed to break a foreground pairing that passed before
// Everything the solver moved is reported in `audits`, so the controller can
// show its working instead of asking anyone to take it on trust.

import { hexToOklch, oklchToHex, hexToRgb, rgbToHex, contrast } from './color.mjs';

/* ---------- mixing ---------- */

// OKLab rectangular coordinates, which is the space CSS color-mix(in oklab)
// interpolates in. Going through the polar form keeps color.mjs untouched.
const toLab = (hex) => {
  const { L, C, H } = hexToOklch(hex);
  const r = (H * Math.PI) / 180;
  return { L, a: C * Math.cos(r), b: C * Math.sin(r) };
};
const fromLab = ({ L, a, b }) => {
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return oklchToHex({ L, C: Math.sqrt(a * a + b * b), H });
};

/**
 * Mix two opaque colours the way color-mix(in oklab, A pct%, B) would.
 * Checked against Chrome: color-mix(in oklab, red, blue) resolves to #8c53a2
 * in the browser and here.
 */
export function mixOklab(hexA, hexB, pctA) {
  const t = Math.max(0, Math.min(1, pctA / 100));
  const A = toLab(hexA);
  const B = toLab(hexB);
  return fromLab({
    L: A.L * t + B.L * (1 - t),
    a: A.a * t + B.a * (1 - t),
    b: A.b * t + B.b * (1 - t)
  });
}

/** Composite a translucent colour over an opaque one, the way a browser paints it. */
export function overHex(baseHex, overHexColour, alpha) {
  const a = Math.max(0, Math.min(1, alpha));
  const A = hexToRgb(baseHex);
  const B = hexToRgb(overHexColour);
  return rgbToHex([0, 1, 2].map((i) => B[i] * a + A[i] * (1 - a)));
}

/**
 * Do these two colours actually land on different pixels? Measured in sRGB
 * rather than OKLab on purpose: near black, a healthy perceptual step still
 * quantises to the same byte, and a token nobody can see is not a token.
 */
const visiblyDiffers = (a, b, min) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return Math.max(Math.abs(A[0] - B[0]), Math.abs(A[1] - B[1]), Math.abs(A[2] - B[2])) * 255 >= min;
};

// How far apart two tokens have to sit before the difference counts, in 8-bit
// channel steps. Surfaces need the most room: a panel one byte off the page is
// not a panel. A border only has to be legible as a line, and a hover only has
// to register as feedback, so both can live closer to their source.
const STEP = { surface: 10, field: 10, border: 4, state: 6, soft: 6 };

/* ---------- the matrix ---------- */

// Roles carrying a vivid seed. They get the full interaction set, because these
// are the ones that end up on buttons, chips and alerts.
const VIVID = ['primary', 'tertiary', 'info', 'success', 'warning', 'error', 'destructive'];
// Roles that are already a quiet surface. A "soft secondary" would just be a
// second name for background-secondary, so these get states and nothing else.
const QUIET = ['secondary', 'accent', 'muted'];

// Nominal starting points. The solver moves them when the theme demands it.
const HOVER = { vivid: 90, quiet: 94 };
const ACTIVE = { vivid: 82, quiet: 88 };
const SOFT_FG = 70;

// Soft fills target a contrast ratio against the page rather than a fixed alpha.
// A fixed 15% wash reads as a pale tint under a saturated blue and as a mid grey
// under a black primary; targeting the ratio gives both the same visual weight,
// and keeps working when the page is pure black.
const SOFT_TARGET = 1.18;
const SOFT_HOVER_TARGET = 1.32;
const MAX_ALPHA = 40; // past this a wash stops reading as soft and starts reading as a fill

// The focus halo is the same idea pointed at a different number. WCAG 2.2 SC
// 2.4.11 asks a focus indicator for 3:1 against the colours beside it, so that
// is what the alpha solves for rather than a percentage somebody liked.
const FOCUS_TARGET = 3;
const FOCUS_ALPHA = 30; // where the solve starts; thinner than this and a halo stops looking like one
const FOCUS_SOFT_MAX = 60; // past this the solve has bought visibility by giving up the softness

const AA = 4.5;
const MIN_PCT = 45; // how far a tier walk may run before it gives up

/**
 * Build every derived token for one mode.
 *
 * @param base {Object<string,string>} resolved base tokens, overrides applied
 * @returns {{ tokens, recipes, css, audits }}
 */
export function deriveMode(base) {
  const tokens = {};
  const recipes = {};
  const audits = [];

  const get = (name) => tokens[name] ?? base[name];
  const has = (name) => get(name) != null;
  const put = (name, hex, recipe) => { tokens[name] = hex; recipes[name] = recipe; };

  /**
   * Mix `from` towards `with`, then keep walking until the result is visibly
   * different from every reference in `ensure`. Without the walk, a tier on a
   * pure black or pure white theme resolves to the colour it came from.
   */
  const mix = (name, from, wth, pct, group, ensure = [from]) => {
    if (!has(from) || !has(wth)) return;
    const a = get(from);
    const b = get(wth);
    const refs = ensure.map(get).filter(Boolean);
    const step = STEP[group] ?? 4;
    let p = pct;
    let hex = mixOklab(a, b, p);
    while (p > MIN_PCT && refs.some((r) => !visiblyDiffers(hex, r, step))) {
      p -= 2;
      hex = mixOklab(a, b, p);
    }
    const moved = p !== pct;
    put(name, hex, { kind: 'mix', from, with: wth, pct: p, group, ...(moved ? { nominal: pct } : {}) });
    if (moved) {
      audits.push({
        kind: 'step', token: name, pct: p, nominal: pct,
        ok: refs.every((r) => visiblyDiffers(hex, r, step)),
        note: `${pct}% was indistinguishable from ${ensure.join(' and ')}`
      });
    }
  };

  /**
   * The soft pair: a tinted fill and its hover, both translucent so a chip can
   * sit on a card without looking pasted on.
   *
   * Alpha is solved for a target contrast against the page rather than fixed,
   * because a fixed 15% reads as a pale tint under a saturated blue and as a mid
   * grey under a black primary.
   *
   * Solving alpha is not always enough. A role can sit so close to the page in
   * lightness that no wash of it will ever separate: a pale grey tertiary on a
   * white page, or a dark amber warning on a black one. When that happens the
   * fill borrows lightness from the ink, which is by construction as far from the
   * page as this theme goes, and keeps as much of the role's hue as the target
   * allows. Both fills share one lift so the pair stays the same colour family.
   */
  const softPair = (role) => {
    if (!has(role) || !has('background') || !has('foreground')) return;
    const bg = get('background');
    const fg = get('foreground');
    const src = get(role);

    // Furthest this colour can get from the page while still counting as soft.
    const reach = (c) => contrast(overHex(bg, c, MAX_ALPHA / 100), bg);
    let lift = 100;
    let tint = src;
    while (lift > 20 && reach(tint) < SOFT_HOVER_TARGET) {
      lift -= 5;
      tint = mixOklab(src, fg, lift);
    }

    const solve = (target) => {
      let best = 6;
      let err = Infinity;
      for (let a = 6; a <= MAX_ALPHA; a++) {
        const e = Math.abs(contrast(overHex(bg, tint, a / 100), bg) - target);
        if (e < err) { err = e; best = a; }
      }
      return best;
    };

    const a1 = solve(SOFT_TARGET);
    let a2 = solve(SOFT_HOVER_TARGET);
    // The hover has to register as a change, not just as a different number.
    while (a2 < MAX_ALPHA && !visiblyDiffers(overHex(bg, tint, a2 / 100), overHex(bg, tint, a1 / 100), STEP.soft)) a2 += 2;

    for (const [name, a, target] of [
      [`${role}-soft`, a1, SOFT_TARGET],
      [`${role}-soft-hover`, a2, SOFT_HOVER_TARGET]
    ]) {
      put(name, overHex(bg, tint, a / 100),
        { kind: 'soft', from: role, alpha: a, lift, target, group: 'soft' });
    }
    if (lift < 100) {
      audits.push({
        kind: 'lift', token: `${role}-soft`, pct: lift, nominal: 100, ok: true,
        note: `${role} sits too close to the page to tint it, so the fill borrows ${100 - lift}% lightness from the ink`
      });
    }
  };

  const alias = (name, from, group) => {
    if (!has(from)) return;
    put(name, get(from), { kind: 'alias', from, group });
  };

  /**
   * A hover or pressed state must never break a foreground pairing that passed
   * before it. If it does, walk the state back towards the rest colour until the
   * pairing clears again. Where the rest pairing already failed, leave it alone:
   * that is the seed colour's problem rather than the recipe's, and the engine's
   * own audit already reports it.
   *
   * Walking back needs a floor. A state that has retreated the whole way onto the
   * colour it came from passes every contrast check ever written and still does
   * nothing at all: pointing at the control changes no pixel. It happens whenever
   * the ink is only just clearing AA at rest, because then any lean towards the
   * ink breaks it and the only safe answer in that direction is not to move.
   *
   * The fix is not a smaller step the same way, it is the other way. Leaning away
   * from the ink raises the ratio instead of spending it, so the state can be as
   * loud as it needs to be. Which direction that is depends on the theme rather
   * than on the mode, so it gets measured rather than assumed: take whichever of
   * the page's two poles the ink is furthest from.
   */
  // Whichever of the page's two poles the ink is furthest from. Moving a state
  // that way can only raise its ratio against that ink, so it is the direction
  // that always has room left in it.
  const poleAwayFrom = (fg) =>
    (contrast(fg, get('background')) >= contrast(fg, get('foreground')) ? 'background' : 'foreground');

  /**
   * Solve one state by leaning the role away from its ink, towards `pole`, and
   * stop at the first blend that is both visibly different from everything in
   * `ensure` and still readable. Returns null when even the full lean is not
   * enough, so callers can decide what to do rather than being handed a value
   * that quietly fails.
   */
  const leanAway = (role, fgName, pole, ensure) => {
    const rest = get(role);
    const fg = get(fgName);
    const refs = ensure.map(get).filter(Boolean);
    const ok = (c) => refs.every((ref) => visiblyDiffers(c, ref, STEP.state)) && contrast(fg, c) >= AA;
    let pct = 100;
    let hex = rest;
    while (pct > MIN_PCT && !ok(hex)) { pct -= 2; hex = mixOklab(rest, get(pole), pct); }
    return ok(hex) ? { hex, pct } : null;
  };

  const protectFg = (name, role, fgName, ensure = [role]) => {
    const r = recipes[name];
    if (!r || r.kind !== 'mix' || !has(fgName)) return;
    const fg = get(fgName);
    const rest = get(role);
    if (contrast(fg, rest) < AA) return;

    const step = STEP[r.group] ?? 4;
    const distinct = (c) => ensure.map(get).filter(Boolean).every((ref) => visiblyDiffers(c, ref, step));
    const nominal = r.nominal ?? r.pct;

    let p = r.pct;
    let hex = tokens[name];
    while (contrast(fg, hex) < AA && p < 99) {
      p += 2;
      hex = mixOklab(rest, get(r.with), p);
    }
    if (p === r.pct) return;

    const keep = () => {
      tokens[name] = hex;
      recipes[name] = { ...r, pct: p, nominal, protected: true };
    };

    if (distinct(hex)) {
      keep();
      audits.push({
        kind: 'contrast', token: name, on: fgName,
        ratio: Math.round(contrast(fg, hex) * 10) / 10,
        aa: contrast(fg, hex) >= AA, pct: p, nominal,
        note: `pulled back so ${fgName} keeps AA on it`
      });
      return;
    }

    // Flattened. Turn around and lean away from the ink instead.
    if (has('background') && has('foreground')) {
      const pole = poleAwayFrom(fg);
      const rev = leanAway(role, fgName, pole, ensure);
      if (rev) {
        tokens[name] = rev.hex;
        recipes[name] = { kind: 'mix', from: role, with: pole, pct: rev.pct, nominal, group: r.group, protected: true, reversed: true };
        audits.push({
          kind: 'contrast', token: name, on: fgName,
          ratio: Math.round(contrast(fg, rev.hex) * 10) / 10,
          aa: true, ok: true, adjusted: true, pct: rev.pct, nominal,
          note: `leaning towards ${r.with} flattened it onto ${role}, so it leans towards ${pole} instead`
        });
        return;
      }
    }

    // Neither direction works. Keep the readable value rather than the visible
    // one, and say so, because a state nobody can see is a smaller failure than
    // a label nobody can read and this is the seed's problem to fix, not ours.
    keep();
    audits.push({
      kind: 'contrast', token: name, on: fgName,
      ratio: Math.round(contrast(fg, hex) * 10) / 10,
      aa: contrast(fg, hex) >= AA, ok: false, adjusted: true, pct: p, nominal,
      note: `no value of this state both keeps ${fgName} at AA and reads as a change, because ${role} and ${fgName} sit too close together`
    });
  };

  /**
   * A hover that lightens and a pressed state that darkens are not a sequence,
   * they are two unrelated effects sharing one control. So if either half of the
   * pair had to turn around, both do: rest, hover, pressed then reads as one
   * direction travelled twice rather than a wobble.
   */
  const cohereStates = (role, fgName) => {
    const hName = `${role}-hover`;
    const aName = `${role}-active`;
    const h = recipes[hName];
    const a = recipes[aName];
    if (!h || !a || !has(fgName) || Boolean(h.reversed) === Boolean(a.reversed)) return;

    const pole = (h.reversed ? h : a).with;
    const led = h.reversed ? hName : aName;
    const commit = (name, was, sol) => {
      tokens[name] = sol.hex;
      recipes[name] = {
        kind: 'mix', from: role, with: pole, pct: sol.pct,
        nominal: was.nominal ?? was.pct, group: 'state', protected: true, reversed: true
      };
      audits.push({
        kind: 'contrast', token: name, on: fgName,
        ratio: Math.round(contrast(get(fgName), sol.hex) * 10) / 10,
        aa: true, ok: true, adjusted: true, pct: sol.pct, nominal: was.nominal ?? was.pct,
        note: `turned around to follow ${led}, so the pair moves the same way`
      });
    };

    if (h.reversed) {
      // Hover has already turned, so the pressed state only has to come out past it.
      const aSol = leanAway(role, fgName, pole, [role, hName]);
      if (aSol) commit(aName, a, aSol);
      return;
    }
    // The pressed state turned. Hover has to lead, and the pressed state is then
    // re-solved against where the hover has landed. Both are solved before either
    // is kept, so a pair that cannot be made coherent is left exactly as it was
    // rather than half moved.
    const hSol = leanAway(role, fgName, pole, [role]);
    if (!hSol) return;
    const wasHover = tokens[hName];
    tokens[hName] = hSol.hex;
    const aSol = leanAway(role, fgName, pole, [role, hName]);
    if (!aSol) { tokens[hName] = wasHover; return; }
    commit(hName, h, hSol);
    commit(aName, a, aSol);
  };

  /* 1. Page surface tiers --------------------------------------------------- */
  // Page, then panel, then well. Each has to sit visibly below the one above it,
  // which is why the tertiary tier is measured against the secondary and not
  // only against the page.
  mix('background-secondary', 'background', 'foreground', 96, 'surface');
  mix('background-tertiary', 'background', 'foreground', 92, 'surface',
    ['background', 'background-secondary']);

  /* 2. Raised surface ------------------------------------------------------- */
  alias('surface', 'card', 'surface');
  alias('surface-foreground', 'card-foreground', 'surface');
  mix('surface-hover', 'card', 'card-foreground', 94, 'surface');

  /* 3. Borders and rules ---------------------------------------------------- */
  // Tiers run quieter as they descend, towards the page rather than the ink.
  // A rule inside a card should never out-shout the card's own edge, so the
  // separator is the quiet tier under another name.
  mix('border-secondary', 'border', 'background', 70, 'border');
  mix('border-tertiary', 'border', 'background', 55, 'border',
    ['border', 'border-secondary']);
  mix('border-strong', 'border', 'foreground', 55, 'border');
  mix('border-hover', 'border', 'foreground', 80, 'border');
  alias('separator', 'border-secondary', 'border');

  /* 4. Fields --------------------------------------------------------------- */
  // A form field is a different decision from a card, which is the whole reason
  // these are their own tokens rather than reuses of border and background.
  alias('field-background', 'background', 'field');
  alias('field-foreground', 'foreground', 'field');
  alias('field-border', 'input', 'field');
  alias('field-placeholder', 'muted-foreground', 'field');
  mix('field-hover', 'field-background', 'field-foreground', 96, 'field');
  mix('field-border-hover', 'field-border', 'field-foreground', 88, 'field');
  alias('field-border-focus', 'ring', 'field');
  // Disabled has to read differently from hover, otherwise a dead field and a
  // live one under the cursor are the same picture.
  mix('field-disabled', 'field-background', 'field-foreground', 94, 'field',
    ['field-background', 'field-hover']);

  /* 5. Role variants -------------------------------------------------------- */
  for (const role of [...VIVID, ...QUIET]) {
    if (!has(role)) continue;
    const fg = `${role}-foreground`;
    const vivid = VIVID.includes(role);
    const towards = has(fg) ? fg : 'foreground';

    // Hover leans the role towards its own foreground, so it darkens on light
    // and lightens on dark without anyone having to pick a second colour.
    mix(`${role}-hover`, role, towards, vivid ? HOVER.vivid : HOVER.quiet, 'state');
    mix(`${role}-active`, role, towards, vivid ? ACTIVE.vivid : ACTIVE.quiet, 'state',
      [role, `${role}-hover`]);
    // Active is graded against the hover as well as against rest, so that when
    // the hover has had to turn around the pressed state follows it out rather
    // than landing on top of it.
    protectFg(`${role}-hover`, role, fg);
    protectFg(`${role}-active`, role, fg, [role, `${role}-hover`]);
    if (has(fg)) cohereStates(role, fg);

    if (!vivid) continue;

    softPair(role);
    mix(`${role}-soft-foreground`, role, 'foreground', SOFT_FG, 'soft', []);
  }

  /* 6. Focus and overlay ---------------------------------------------------- */
  alias('focus', 'ring', 'state');
  // The halo a focused control draws around itself. Every surface in the preview
  // was improvising this out of --ring at whatever alpha its author picked that
  // afternoon, so a checkbox and a select disagreed about how loud focus is.
  // One token, one answer, and the argument about how visible focus should be
  // only has to be had once.
  //
  // The answer is not a percentage, though. A flat 30% wash was the obvious
  // first guess and it was wrong on every brand here, landing between 1.3:1 and
  // 2.2:1 against the surfaces it sits on. That is a smudge, not an indicator,
  // and it is the sort of thing that passes every test in this repo while being
  // plainly useless to anyone navigating by keyboard. So solve for the ratio:
  // start at the old 30%, add opacity a point at a time, and stop as soon as the
  // halo can actually be seen on the hardest surface a focused control lands on.
  if (has('ring') && has('background')) {
    const page = get('background');
    const ring = get('ring');
    const beneath = ['background', 'card', 'popover'].filter(has).map(get);
    // This token ships twice and the two copies behave differently, so both have
    // to clear the bar or the bar has not been cleared.
    //
    // The web gets a live color-mix, which is properly translucent and composites
    // over whatever is actually behind it. Style Dictionary, SCSS and Swift get
    // the resolved hex, which was flattened against the page and is then painted
    // opaque wherever it lands. On a card those are two different colours, and
    // the card is the harder surface either way because it sits closer to the
    // ring than the page does. Grading the worse of the two is the only reading
    // that means the same thing on every platform this emits to.
    const weakest = (a) => Math.min(...beneath.flatMap((s) => [
      contrast(overHex(s, ring, a / 100), s),
      contrast(overHex(page, ring, a / 100), s)
    ]));
    let alpha = FOCUS_ALPHA;
    while (alpha < 100 && weakest(alpha) < FOCUS_TARGET) alpha += 1;
    put('focus-ring', overHex(get('background'), ring, alpha / 100),
      { kind: 'wash', from: 'ring', alpha, target: FOCUS_TARGET, group: 'state',
        ...(alpha !== FOCUS_ALPHA ? { nominal: FOCUS_ALPHA } : {}) });
    const reached = weakest(alpha);
    audits.push({
      kind: 'focus', token: 'focus-ring', ratio: Math.round(reached * 100) / 100,
      ok: reached >= FOCUS_TARGET, pct: alpha, nominal: FOCUS_ALPHA,
      adjusted: alpha !== FOCUS_ALPHA,
      note: reached >= FOCUS_TARGET
        ? (alpha !== FOCUS_ALPHA
          ? `${FOCUS_ALPHA}% left the halo at ${weakest(FOCUS_ALPHA).toFixed(2)}:1, so it thickened to `
            + `${alpha}% to reach ${reached.toFixed(2)}:1`
            // Solved, but worth saying what it cost. A wash this heavy paints
            // almost the ring itself, so the softness is gone even though the
            // ratio is met, and the way to buy it back is a further --ring
            // rather than anything this solver can do.
            + (alpha > FOCUS_SOFT_MAX
              ? `. At that weight it reads as a solid ring rather than a halo, which is what a --ring `
                + `this close to the page costs. A --ring further from the surfaces would clear 3:1 thinner.`
              : '')
          : '')
        : `--ring sits too close to the surfaces it has to appear on: even undiluted the halo only reaches `
          + `${reached.toFixed(2)}:1, short of the 3:1 a focus indicator needs. Choosing a --ring further from `
          + `the page and the cards is the only fix from here.`
    });
  }
  // The scrim behind a modal. It has to darken in both modes, which is why it
  // cannot simply wash the page in --foreground: in dark mode the foreground is
  // near white, so a 45% wash lifts the backdrop above the dialog sitting on it
  // and inverts the depth cue the scrim exists to give. Take whichever of the
  // page's two poles is actually the darker one and the same recipe reads as a
  // dim in both modes, while still picking up a warm or cool cast from a tinted
  // brand rather than hard-coding black.
  if (has('foreground') && has('background')) {
    const ink = contrast(get('foreground'), '#ffffff') >= contrast(get('background'), '#ffffff')
      ? 'foreground' : 'background';
    put('overlay', overHex(get('background'), get(ink), 0.45),
      { kind: 'wash', from: ink, alpha: 45, group: 'state' });
  }

  /* 7. Verify every soft foreground against both of its fills --------------- */
  // This is the step a published percentage table cannot do. Walk the mix towards
  // the page foreground until the pair clears AA, and ship the verified percentage
  // rather than the inherited one.
  //
  // The test runs against the hover fill as well as the rest fill, and grades on
  // the worse of the two. Checking only the rest fill is how you end up with a
  // chip whose label is legible until someone points at it: the hover fill is
  // heavier by construction, so it is always the harder of the pair.
  for (const role of VIVID) {
    const name = `${role}-soft-foreground`;
    const fill = tokens[`${role}-soft`];
    const hoverFill = tokens[`${role}-soft-hover`] || fill;
    if (!tokens[name] || !fill) continue;

    const worst = (h) => Math.min(contrast(h, fill), contrast(h, hoverFill));
    let pct = SOFT_FG;
    let hex = tokens[name];
    const started = Math.round(worst(hex) * 10) / 10;
    while (worst(hex) < AA && pct > 0) {
      pct -= 5;
      hex = mixOklab(get(role), get('foreground'), pct);
    }
    const ratio = Math.round(worst(hex) * 10) / 10;

    tokens[name] = hex;
    recipes[name] = {
      kind: 'mix', from: role, with: 'foreground', pct, group: 'soft', verified: true,
      ...(pct !== SOFT_FG ? { nominal: SOFT_FG } : {})
    };
    audits.push({
      kind: 'contrast', token: name, on: `${role}-soft-hover`,
      ratio, aa: ratio >= AA, pct, nominal: SOFT_FG,
      adjusted: pct !== SOFT_FG,
      note: pct !== SOFT_FG ? `${SOFT_FG}% only reached ${started}:1 on the heavier fill` : ''
    });
  }

  return { tokens, recipes, css: cssFor(recipes), audits };
}

/* ---------- emission ---------- */

/** The live color-mix() expression for one recipe. */
export function cssExpr(r) {
  if (!r) return null;
  if (r.kind === 'alias') return `var(--${r.from})`;
  if (r.kind === 'wash') return `color-mix(in oklab, var(--${r.from}) ${r.alpha}%, transparent)`;
  if (r.kind === 'soft') {
    const src = r.lift >= 100
      ? `var(--${r.from})`
      : `color-mix(in oklab, var(--${r.from}) ${r.lift}%, var(--foreground))`;
    return `color-mix(in oklab, ${src} ${r.alpha}%, transparent)`;
  }
  return `color-mix(in oklab, var(--${r.from}) ${r.pct}%, var(--${r.with}) ${100 - r.pct}%)`;
}

/** The human-readable recipe for the Variables panel. */
export function recipeLabel(r) {
  if (!r) return '';
  if (r.kind === 'alias') return r.from;
  if (r.kind === 'wash') return `${r.from} ${r.alpha}% over transparent`;
  if (r.kind === 'soft') {
    return r.lift >= 100
      ? `${r.from} ${r.alpha}% over transparent`
      : `${r.from} lifted ${r.lift}% towards ink, at ${r.alpha}%`;
  }
  return `${r.from} ${r.pct}% + ${r.with} ${100 - r.pct}%`;
}

function cssFor(recipes) {
  const out = {};
  for (const [name, r] of Object.entries(recipes)) out[name] = cssExpr(r);
  return out;
}

/** Names of everything this module adds, in emission order. */
export function derivedNames(recipes) {
  return Object.keys(recipes);
}

/** Section labels for the Variables panel filter chips. */
export const GROUPS = {
  surface: 'Surfaces',
  border: 'Borders',
  field: 'Fields',
  state: 'States',
  soft: 'Soft variants'
};
