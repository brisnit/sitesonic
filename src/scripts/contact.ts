/**
 * Contact dialog: opens from `[data-open-contact]`, validates inline, and
 * shows success only when the inbox service confirms delivery.
 */
import { brand } from '../config/site';
import { deliver } from './inbox';
import { track } from './analytics';

const dialog = document.querySelector<HTMLDialogElement>('[data-contact]');
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

if (dialog && form) init(dialog, form);

function init(dialog: HTMLDialogElement, form: HTMLFormElement) {
  const endpoint = form.dataset.endpoint?.trim() ?? '';
  const accessKey = form.dataset.accessKey?.trim() ?? '';
  const title = dialog.querySelector<HTMLElement>('#contact-title')!;
  const formView = dialog.querySelector<HTMLElement>('[data-contact-view="form"]')!;
  const successView = dialog.querySelector<HTMLElement>('[data-contact-view="success"]')!;
  const status = dialog.querySelector<HTMLElement>('[data-contact-status]')!;
  const submit = dialog.querySelector<HTMLButtonElement>('[data-contact-submit]')!;
  const label = dialog.querySelector<HTMLElement>('[data-contact-label]')!;
  const defaultLabel = label.textContent ?? '';
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  let opener: HTMLElement | null = null;
  let sending = false;

  const val = (name: string) => ((form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? '').trim();

  const rules: Record<string, () => string> = {
    name: () => (val('name') ? '' : 'Enter your name.'),
    email: () => {
      const v = val('email');
      if (!v) return 'Enter your email address.';
      return EMAIL.test(v) ? '' : 'Enter an email address like name@example.com.';
    },
    message: () => {
      const v = val('message');
      if (!v) return 'Write a short message.';
      return v.length < 10 ? 'Add a little more detail (at least 10 characters).' : '';
    },
  };

  function validate(name: string) {
    const message = rules[name]();
    form.querySelector(`[data-error-for="${name}"]`)!.textContent = message;
    form.querySelector(`[name="${name}"]`)!.setAttribute('aria-invalid', String(!!message));
    return message;
  }

  form.addEventListener('focusout', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name in rules && t.value) validate(t.name);
  });
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name in rules && form.querySelector(`[data-error-for="${t.name}"]`)?.textContent) validate(t.name);
    if (status.dataset.tone === 'error') setStatus('');
  });

  function setStatus(message: string, tone?: 'error') {
    status.textContent = message;
    if (tone) status.dataset.tone = tone;
    else delete status.dataset.tone;
  }

  function show(view: 'form' | 'success') {
    formView.hidden = view !== 'form';
    successView.hidden = view !== 'success';
  }

  function open(from: HTMLElement | null) {
    opener = from;
    if (!successView.hidden) {
      form.reset();
      Object.keys(rules).forEach((n) => {
        form.querySelector(`[data-error-for="${n}"]`)!.textContent = '';
        form.querySelector(`[name="${n}"]`)!.removeAttribute('aria-invalid');
      });
      setStatus('');
      show('form');
    }
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    title.focus();
  }

  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-open-contact]');
    if (trigger) {
      e.preventDefault();
      open(trigger);
    }
  });
  dialog.querySelectorAll('[data-contact-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    opener?.focus();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const invalid = Object.keys(rules).filter((n) => validate(n));
    if (invalid.length) {
      form.querySelector<HTMLElement>(`[name="${invalid[0]}"]`)?.focus();
      return;
    }
    if (val('company_website')) {
      setStatus('Something went wrong. Please try again.', 'error');
      return;
    }
    if (!endpoint) {
      setStatus('Messages aren’t switched on yet. Please try again soon.', 'error');
      return;
    }

    const subject = `New message from ${val('name')}`;
    const fields: Record<string, string> = accessKey
      ? { access_key: accessKey, subject, from_name: `${brand.name} website`, replyto: val('email') }
      : { _subject: subject, _replyto: val('email'), _template: 'table', _captcha: 'false' };
    Object.assign(fields, { Name: val('name'), email: val('email'), Message: val('message'), 'Sent from': location.href });

    sending = true;
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    label.textContent = 'Sending…';
    setStatus('Sending your message…');
    try {
      await deliver(endpoint, fields);
      track('Contact');
      setStatus('');
      show('success');
      successView.querySelector<HTMLElement>('.contact__done')?.focus();
    } catch {
      setStatus('Your message couldn’t be sent just now. Please try again in a moment.', 'error');
    } finally {
      sending = false;
      submit.disabled = false;
      submit.setAttribute('aria-busy', 'false');
      label.textContent = defaultLabel;
    }
  });
}
