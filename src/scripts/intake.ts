/**
 * Package request dialog.
 *
 * - Opens from any `[data-open-intake="<package id>"]` element, or `?package=<id>` in the URL.
 * - Validates inline (after a field is first left, then live) and on submit.
 * - Sends JSON to the configured endpoint. A success state is shown ONLY when the
 *   endpoint responds with a 2xx status. With no endpoint configured, nothing is
 *   sent and the visitor is told so plainly.
 */

import { brand } from '../config/site';
import { deliver } from './inbox';
import { track } from './analytics';

type PackageInfo = { id: string; name: string; price: number };

const dialog = document.querySelector<HTMLDialogElement>('[data-intake]');
const form = document.querySelector<HTMLFormElement>('[data-intake-form]');

if (dialog && form) init(dialog, form);

function init(dialog: HTMLDialogElement, form: HTMLFormElement) {
  const packages: PackageInfo[] = JSON.parse(document.getElementById('intake-packages')?.textContent ?? '[]');
  const endpoint = form.dataset.endpoint?.trim() ?? '';
  const accessKey = form.dataset.accessKey?.trim() ?? '';
  const fallbackEmail = form.dataset.fallbackEmail?.trim() ?? '';

  const $ = <T extends Element>(sel: string, root: ParentNode = dialog) => root.querySelector<T>(sel)!;
  const title = $<HTMLElement>('#intake-title');
  const scroller = $<HTMLElement>('[data-intake-scroll]');
  const views = {
    form: $<HTMLElement>('[data-view="form"]'),
    success: $<HTMLElement>('[data-view="success"]'),
    unsent: $<HTMLElement>('[data-view="unsent"]'),
  };
  const summaryBox = $<HTMLElement>('[data-error-summary]');
  const summaryList = $<HTMLUListElement>('[data-error-list]');
  const worldGroup = $<HTMLFieldSetElement>('[data-world-only]');
  const photoLocationField = $<HTMLElement>('[data-photo-location]');
  const submitBtn = $<HTMLButtonElement>('[data-submit]');
  const submitLabel = $<HTMLElement>('[data-submit-label]');
  const status = $<HTMLElement>('[data-status]');
  const fallback = $<HTMLElement>('[data-fallback]');
  const fallbackLink = $<HTMLAnchorElement>('[data-fallback-link]');
  const summaryText = $<HTMLTextAreaElement>('[data-summary]');
  const copyStatus = $<HTMLElement>('[data-copy-status]');
  const dateInput = form.elements.namedItem('launchDate') as HTMLInputElement;
  const defaultSubmitLabel = submitLabel.textContent ?? '';

  let opener: HTMLElement | null = null;
  let submitting = false;
  const touched = new Set<string>();

  // Earliest selectable launch date is today (local time).
  const today = new Date();
  const isoToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = isoToday;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const val = (name: string) => {
    const el = form.elements.namedItem(name);
    if (el instanceof RadioNodeList) return el.value;
    return (el as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? '';
  };
  const checked = (name: string) =>
    Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)).map((i) => i.value);
  const selectedPackage = () => packages.find((p) => p.id === val('package'));
  const isWorld = () => val('package') === 'world';
  const needsPhotoLocation = () => isWorld() && ['yes', 'unsure'].includes(val('photoNeed'));

  function showView(name: keyof typeof views) {
    for (const [key, el] of Object.entries(views)) el.hidden = key !== name;
    scroller.scrollTop = 0;
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules: Record<string, () => string> = {
    package: () => (val('package') ? '' : 'Choose a package.'),
    artistName: () => (val('artistName') ? '' : 'Enter your artist or band name.'),
    contactName: () => (val('contactName') ? '' : 'Enter your name.'),
    email: () => {
      const v = val('email');
      if (!v) return 'Enter your email address.';
      return EMAIL.test(v) ? '' : 'Enter an email address like name@example.com.';
    },
    location: () => (val('location') ? '' : 'Enter your city and country.'),
    photoNeed: () => (!isWorld() || val('photoNeed') ? '' : 'Let us know whether you need the photo session.'),
    photoLocation: () =>
      !needsPhotoLocation() || val('photoLocation') ? '' : 'Tell us where the photo session would take place.',
    helpWith: () => (checked('helpWith').length ? '' : 'Choose at least one thing you want help with.'),
    launchDate: () => {
      const v = val('launchDate');
      if (!v) return '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Enter a valid date, or leave this blank.';
      return v < isoToday ? 'Choose a date from today onward, or leave this blank.' : '';
    },
    description: () => {
      const v = val('description');
      if (!v) return 'Tell us a little about your music and goals.';
      return v.length < 20 ? 'Add a little more detail (at least 20 characters).' : '';
    },
  };

  /** Where focus should go for a given field (first control in groups). */
  function focusTarget(name: string): HTMLElement | null {
    if (name === 'package') {
      return form.querySelector<HTMLInputElement>('input[name="package"]:checked') ?? form.querySelector('input[name="package"]');
    }
    if (name === 'photoNeed' || name === 'helpWith') return form.querySelector(`input[name="${name}"]`);
    return form.querySelector(`[name="${name}"]`);
  }

  function setError(name: string, message: string) {
    const errorEl = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (errorEl) errorEl.textContent = message;
    const wrapper = form.querySelector<HTMLElement>(`[data-field="${name}"]`);
    const control = form.querySelector<HTMLElement>(`input[name="${name}"]:not([type=radio]):not([type=checkbox]), textarea[name="${name}"]`);
    const invalid = message ? 'true' : 'false';
    (control ?? wrapper)?.setAttribute('aria-invalid', invalid);
    if (control && wrapper) wrapper.removeAttribute('aria-invalid');
    // Group-style fields (radios/checkboxes) mark each input so screen readers announce it.
    form.querySelectorAll<HTMLInputElement>(`input[type=radio][name="${name}"], input[type=checkbox][name="${name}"]`).forEach((i) => {
      if (message) {
        i.setAttribute('aria-invalid', 'true');
        i.setAttribute('aria-describedby', `${name}-error`);
      } else {
        i.removeAttribute('aria-invalid');
        i.removeAttribute('aria-describedby');
      }
    });
  }

  function validateField(name: string) {
    const rule = rules[name];
    if (!rule) return '';
    const message = rule();
    setError(name, message);
    return message;
  }

  function validateAll() {
    const errors: { name: string; message: string }[] = [];
    for (const name of Object.keys(rules)) {
      const message = validateField(name);
      if (message) errors.push({ name, message });
    }
    return errors;
  }

  function renderSummary(errors: { name: string; message: string }[]) {
    summaryList.replaceChildren(
      ...errors.map(({ name, message }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${focusTarget(name)?.id || `${name}-error`}`;
        a.textContent = message;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const t = focusTarget(name);
          t?.focus();
          t?.scrollIntoView({ block: 'center' });
        });
        li.append(a);
        return li;
      }),
    );
    summaryBox.hidden = errors.length === 0;
  }

  function refreshSummary() {
    if (summaryBox.hidden) return;
    const errors = Object.keys(rules)
      .map((name) => ({ name, message: rules[name]() }))
      .filter((e) => e.message);
    renderSummary(errors);
  }

  // Inline validation: validate a field when it is left, then live once touched.
  form.addEventListener('focusout', (e) => {
    const t = e.target as HTMLInputElement;
    if (!t.name || !(t.name in rules)) return;
    // Groups: wait until focus leaves the whole group.
    if (t.type === 'radio' || t.type === 'checkbox') {
      const next = (e as FocusEvent).relatedTarget as HTMLInputElement | null;
      if (next?.name === t.name) return;
    }
    // Don't flag an empty field the moment someone tabs past it on the way in.
    if (!t.value && t.type !== 'radio' && t.type !== 'checkbox' && !touched.has(t.name)) return;
    touched.add(t.name);
    validateField(t.name);
    refreshSummary();
  });

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name) touched.add(t.name);
    if (t.name in rules && (touched.has(t.name) || t.type === 'radio' || t.type === 'checkbox')) {
      const errorEl = form.querySelector(`[data-error-for="${t.name}"]`);
      // Live-clear errors; only live-show them for fields already flagged.
      if (errorEl?.textContent || t.type === 'radio' || t.type === 'checkbox') validateField(t.name);
    }
    if (t.name === 'package' || t.name === 'photoNeed') syncConditional();
    refreshSummary();
    if (status.dataset.tone === 'error') clearStatus();
  });

  // ── Conditional World questions ────────────────────────────────────────────
  function syncConditional() {
    const world = isWorld();
    worldGroup.hidden = !world;
    photoLocationField.hidden = !needsPhotoLocation();
    if (!world) {
      setError('photoNeed', '');
      setError('photoLocation', '');
    } else if (!needsPhotoLocation()) {
      setError('photoLocation', '');
    }
  }

  // ── Open / close ───────────────────────────────────────────────────────────
  function selectPackage(id: string | undefined) {
    const radio = id ? form.querySelector<HTMLInputElement>(`input[name="package"][value="${CSS.escape(id)}"]`) : null;
    if (radio) {
      radio.checked = true;
      setError('package', '');
    }
    syncConditional();
  }

  function open(id?: string, from?: HTMLElement | null) {
    opener = from ?? null;
    // After a completed request, start fresh.
    if (!views.success.hidden) resetForm();
    showView('form');
    selectPackage(id);
    const pkg = selectedPackage();
    title.textContent = pkg ? `Request ${pkg.name}` : 'Request a package';
    if (!dialog.open) dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    title.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    opener?.focus();
  });

  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-open-intake]');
    if (trigger) {
      e.preventDefault();
      open(trigger.dataset.openIntake, trigger);
    }
  });
  dialog.querySelectorAll('[data-intake-close]').forEach((b) => b.addEventListener('click', close));

  // Click on the backdrop (outside the panel) closes.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });

  // Keep the title in sync with the chosen package.
  form.addEventListener('change', (e) => {
    if ((e.target as HTMLInputElement).name === 'package') {
      const pkg = selectedPackage();
      if (pkg) title.textContent = `Request ${pkg.name}`;
    }
  });

  // ── Submit ─────────────────────────────────────────────────────────────────
  function setStatus(message: string, tone: 'info' | 'error' = 'info') {
    status.textContent = message;
    status.dataset.tone = tone;
  }
  function clearStatus() {
    status.textContent = '';
    delete status.dataset.tone;
    fallback.hidden = true;
  }
  function setBusy(busy: boolean) {
    submitting = busy;
    submitBtn.disabled = busy;
    submitBtn.setAttribute('aria-busy', String(busy));
    submitLabel.textContent = busy ? 'Sending…' : defaultSubmitLabel;
  }

  function payload() {
    const pkg = selectedPackage();
    return {
      package: pkg ? { id: pkg.id, name: pkg.name, price: pkg.price } : null,
      artistName: val('artistName'),
      contactName: val('contactName'),
      email: val('email'),
      location: val('location'),
      links: val('links')
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean),
      photography: isWorld()
        ? { need: val('photoNeed'), location: needsPhotoLocation() ? val('photoLocation') : '' }
        : undefined,
      materials: checked('materials'),
      helpWith: checked('helpWith'),
      launchDate: val('launchDate') || null,
      description: val('description'),
      submittedAt: new Date().toISOString(),
      page: location.href,
    };
  }

  /**
   * Flat, labelled fields so the request reads cleanly as an email.
   * Web3Forms options (access_key, subject, from_name, replyto) or, for other
   * endpoints, FormSubmit-style underscore options, which most services ignore.
   */
  function emailFields(data: ReturnType<typeof payload>) {
    const pkg = data.package ? `${data.package.name} ($${data.package.price.toLocaleString('en-US')})` : '';
    const subject = `New ${data.package?.name ?? 'package'} request: ${data.artistName}`;
    const fields: Record<string, string> = accessKey
      ? { access_key: accessKey, subject, from_name: `${brand.name} website`, replyto: data.email }
      : { _subject: subject, _replyto: data.email, _template: 'table', _captcha: 'false' };
    Object.assign(fields, {
      Package: pkg,
      'Artist or band': data.artistName,
      Name: data.contactName,
      email: data.email,
      'City and country': data.location,
      'Music and social links': data.links.join('\n') || 'None given',
    });
    if (data.photography) {
      fields['Photo session needed'] = { yes: 'Yes', no: 'No, has photos', unsure: 'Not sure yet' }[data.photography.need] ?? data.photography.need;
      if (data.photography.location) fields['Photo session location'] = data.photography.location;
    }
    Object.assign(fields, {
      'Already has': data.materials.join(', ') || 'None yet',
      'Wants help with': data.helpWith.join(', '),
      'Preferred launch date': data.launchDate ?? 'Flexible',
      'Music and goals': data.description,
      'Sent from': data.page,
    });
    return fields;
  }

  function summaryFor(data: ReturnType<typeof payload>) {
    const lines = [
      `Package: ${data.package ? `${data.package.name} ($${data.package.price.toLocaleString('en-US')})` : ''}`,
      `Artist or band: ${data.artistName}`,
      `Name: ${data.contactName}`,
      `Email: ${data.email}`,
      `City and country: ${data.location}`,
      `Links: ${data.links.length ? data.links.join(', ') : 'none'}`,
    ];
    if (data.photography) {
      lines.push(`Photo session: ${data.photography.need}${data.photography.location ? ` (${data.photography.location})` : ''}`);
    }
    lines.push(
      `Already have: ${data.materials.join(', ') || 'none yet'}`,
      `Help with: ${data.helpWith.join(', ')}`,
      `Preferred launch date: ${data.launchDate ?? 'flexible'}`,
      '',
      'Music and goals:',
      data.description,
    );
    return lines.join('\n');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    clearStatus();

    const errors = validateAll();
    Object.keys(rules).forEach((n) => touched.add(n));
    renderSummary(errors);
    if (errors.length) {
      summaryBox.focus();
      summaryBox.scrollIntoView({ block: 'start' });
      return;
    }

    // Spam trap filled: drop quietly without pretending anything was sent.
    if (val('company_website')) {
      setStatus('Something went wrong. Please try again.', 'error');
      return;
    }

    const data = payload();

    if (!endpoint) {
      summaryText.value = summaryFor(data);
      const mailto = views.unsent.querySelector<HTMLAnchorElement>('[data-unsent-mailto]');
      if (mailto && fallbackEmail) {
        const subject = `${data.package?.name ?? 'Package'} request: ${data.artistName}`;
        mailto.href = `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summaryFor(data).slice(0, 1800))}`;
      }
      showView('unsent');
      $<HTMLElement>('.result__title', views.unsent).focus();
      return;
    }

    setBusy(true);
    setStatus('Sending your request…');
    try {
      await deliver(endpoint, emailFields(data));
      track('Lead', {
        content_name: data.package?.name,
        value: data.package?.price,
        currency: 'USD',
      });
      clearStatus();
      showView('success');
      $<HTMLElement>('.result__title', views.success).focus();
    } catch {
      setStatus('Your request couldn’t be sent just now. Please try again in a moment. Your answers are still here.', 'error');
      if (fallbackEmail) {
        const subject = `${data.package?.name ?? 'Package'} request: ${data.artistName}`;
        const body = summaryFor(data).slice(0, 1800);
        fallbackLink.href = `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        fallback.hidden = false;
      }
    } finally {
      setBusy(false);
    }
  });

  function resetForm() {
    form.reset();
    touched.clear();
    Object.keys(rules).forEach((n) => setError(n, ''));
    renderSummary([]);
    clearStatus();
    syncConditional();
  }

  // ── Unsent view actions ────────────────────────────────────────────────────
  $<HTMLButtonElement>('[data-back-to-form]').addEventListener('click', () => {
    showView('form');
    submitBtn.focus();
  });
  $<HTMLButtonElement>('[data-copy-summary]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summaryText.value);
      copyStatus.textContent = 'Copied to your clipboard.';
    } catch {
      summaryText.focus();
      summaryText.select();
      copyStatus.textContent = 'Press Ctrl+C (or ⌘C) to copy the selected text.';
    }
  });

  // ── Deep link: ?package=world ──────────────────────────────────────────────
  const wanted = new URLSearchParams(location.search).get('package');
  if (wanted && packages.some((p) => p.id === wanted)) open(wanted);
}
