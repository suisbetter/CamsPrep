/*!
 * CAMS Prep Chatbot — frontend widget (Phase 1.5)
 *
 * Multi-tab widget: Chat | Contact | Schedule | WhatsApp
 * Self-contained vanilla JS. No framework, no build step.
 */
(function() {
    'use strict';
    if (typeof window === 'undefined' || !window.CamsprepChat) return;
    const config = window.CamsprepChat;
    const settings = config.settings || {};
    const SESSION_KEY = 'camsprep_session_token';
    const LAST_MSG_ID_KEY = 'camsprep_last_msg_id';
    const ACTIVE_TAB_KEY = 'camsprep_active_tab';
    const INTRO_DONE_KEY = 'camsprep_intro_done';
    const POLL_INTERVAL_MS = 3000;
    const TAB_DEFS = {
        chat: {
            icon: 'chat',
            label: 'Chat'
        },
        contact: {
            icon: 'mail',
            label: 'Contact'
        },
        schedule: {
            icon: 'calendar',
            label: 'Schedule'
        },
        whatsapp: {
            icon: 'whatsapp',
            label: 'WhatsApp'
        }
    };
    const ICONS = {
        chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
        mail: '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
        calendar: '<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>',
        send: '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
        attach: '<svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 005 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>',
        close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
        bubble: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>'
    };
    class CamsprepWidget {
        constructor(root) {
            this.root = root;
            this.sessionToken = localStorage.getItem(SESSION_KEY) || '';
            this.lastSeenMessageId = parseInt(localStorage.getItem(LAST_MSG_ID_KEY) || '0', 10);
            this.activeTab = localStorage.getItem(ACTIVE_TAB_KEY) || 'chat';
            this.history = [];
            this.isOpen = !1;
            this.isThinking = !1;
            this.state = 'ai_handling';
            this.pollTimer = null;
            this.enabledTabs = Array.isArray(settings.tabs_enabled) ? settings.tabs_enabled : ['chat', 'contact', 'schedule', 'whatsapp'];
            if (!this.enabledTabs.includes(this.activeTab)) this.activeTab = this.enabledTabs[0] || 'chat';
            this.shownIntentCards = new Set();
            this.applyTheme();
            this.render();
            this.bindEvents();
            this.switchTab(this.activeTab, !1)
        }
        applyTheme() {
            const css = this.root.style;
            const map = {
                '--camsprep-primary': settings.primary_color || '#185FA5',
                '--camsprep-primary-dark': settings.primary_dark_color || '#0C447C',
                '--camsprep-primary-light': settings.primary_light_color || '#B5D4F4',
                '--camsprep-header-text': settings.header_text_color || '#FFFFFF',
                '--camsprep-bg': settings.panel_bg_color || '#FFFFFF',
                '--camsprep-bg-soft': settings.panel_soft_bg_color || '#F6F7FB',
                '--camsprep-text': settings.text_color || '#1F2937',
                '--camsprep-text-muted': settings.text_muted_color || '#6B7280',
                '--camsprep-border': settings.border_color || '#E5E7EB',
            };
            Object.entries(map).forEach(([k, v]) => v && css.setProperty(k, v));
            css.setProperty('--camsprep-offset-x', (settings.bubble_offset_x || 24) + 'px');
            css.setProperty('--camsprep-offset-y', (settings.bubble_offset_y || 24) + 'px');
            this.root.setAttribute('data-camsprep-position', settings.bubble_position || 'bottom-right')
        }
        render() {
            const assistantName = settings.assistant_name || 'CAMS Prep Assistant';
            const assistantSub = settings.assistant_subtitle || 'Online';
            const initials = settings.avatar_initials || 'AI';
            const founderPhoto = settings.founder_photo_url || '';
            this.root.innerHTML = `
				<div class="camsprep-greeting" data-camsprep-greeting>${this.escape(settings.open_greeting || 'Ask about CAMS prep')}</div>
				<button class="camsprep-bubble" data-camsprep-bubble aria-label="Open chat">${ICONS.bubble}</button>

				<div class="camsprep-panel" data-camsprep-panel role="dialog" hidden>
					<header class="camsprep-header">
						<div class="camsprep-header-card">
							<div class="camsprep-avatar" data-camsprep-avatar>${this.escape(initials)}</div>
							<div class="camsprep-title">
								<div class="camsprep-name" data-camsprep-name>${this.escape(assistantName)}</div>
								<div class="camsprep-sub" data-camsprep-sub>${this.escape(assistantSub)}</div>
							</div>
							<button class="camsprep-close" data-camsprep-close aria-label="Close">${ICONS.close}</button>
						</div>
					</header>

					<div class="camsprep-tab-body">
						${this.renderChatTab()}
						${this.renderContactTab()}
						${this.renderScheduleTab()}
						${this.renderWhatsAppTab()}
					</div>

					${this.renderTabBar()}

					${settings.show_powered_by ? `<div class="camsprep-powered-by">${this.escape(settings.powered_by_text||'')}</div>` : ''}
				</div>
			`
        }
        renderTabBar() {
            if (this.enabledTabs.length < 2) return '';
            const buttons = this.enabledTabs.map(tab => {
                const def = TAB_DEFS[tab];
                if (!def) return '';
                return `
					<button class="camsprep-tab-btn" data-camsprep-tab-btn="${tab}" aria-label="${def.label}" title="${def.label}">
						${ICONS[def.icon]}
					</button>
				`
            }).join('');
            return `<nav class="camsprep-tab-bar" data-camsprep-tab-bar>${buttons}</nav>`
        }
        renderChatTab() {
            return `
				<section class="camsprep-tab-content" data-camsprep-tab="chat" hidden>
					<div class="camsprep-messages" data-camsprep-messages></div>
					<form class="camsprep-composer" data-camsprep-composer>
						<input type="text" data-camsprep-input placeholder="${this.escape(settings.placeholder || 'Type your question...')}" autocomplete="off" />
						<button type="submit" class="camsprep-send" data-camsprep-send aria-label="Send">${ICONS.send}</button>
					</form>
					<div class="camsprep-chat-footer">
						${settings.live_chat_enabled ? `<button type="button" class="camsprep-talk-human" data-camsprep-talk-human><span class="camsprep-talk-human-icon">🆘</span>Need to talk to a human?</button>` : ''}
						<button type="button" class="camsprep-clear-history" data-camsprep-clear-history style="background:none;border:none;color:#888;font-size:11px;cursor:pointer;margin-top:4px;text-decoration:underline;">Clear chat history</button>
					</div>
				</section>
			`
        }
        renderContactTab() {
            const showCountry = settings.contact_form_show_country !== !1;
            const showPhone = settings.contact_form_show_phone !== !1;
            const title = settings.contact_form_title || 'Send us your questions and we will get back to you within 24 hours';
            return `
				<section class="camsprep-tab-content" data-camsprep-tab="contact" hidden>
					<div class="camsprep-tab-scroll">
						<h3 class="camsprep-tab-title">${this.escape(title)}</h3>
						<form class="camsprep-contact-form-v2" data-camsprep-contact-form>
							<div class="camsprep-field">
								<input type="text" data-camsprep-cf-name placeholder="Name *" required autocomplete="name" />
							</div>
							${showCountry ? `<div class="camsprep-field"><input type="text" data-camsprep-cf-country placeholder="Country" autocomplete="country-name" list="camsprep-countries"/><datalist id="camsprep-countries">${this.countryOptions()}</datalist></div>` : ''}
							<div class="camsprep-field">
								<input type="email" data-camsprep-cf-email placeholder="Email *" required autocomplete="email" />
							</div>
							${showPhone ? `<div class="camsprep-field"><input type="tel" data-camsprep-cf-phone placeholder="Phone (with country code, e.g. +1 555 123 4567)" autocomplete="tel"/></div>` : ''}
							<div class="camsprep-field">
								<textarea data-camsprep-cf-msg placeholder="Write your message here... *" required></textarea>
							</div>
							<button type="submit" class="camsprep-submit-btn">Submit</button>
						</form>
						<div class="camsprep-form-success" data-camsprep-form-success hidden></div>
					</div>
				</section>
			`
        }
        renderScheduleTab() {
            const url = settings.calendly_url || '';
            const title = settings.schedule_tab_title || 'Select the time best works for you';
            if (!url) {
                return `
					<section class="camsprep-tab-content" data-camsprep-tab="schedule" hidden>
						<div class="camsprep-tab-scroll camsprep-tab-empty">
							<h3 class="camsprep-tab-title">${this.escape(title)}</h3>
							<p>Scheduling is not configured yet.</p>
						</div>
					</section>
				`
            }
            return `
				<section class="camsprep-tab-content" data-camsprep-tab="schedule" hidden>
					<h3 class="camsprep-tab-title camsprep-tab-title-inline">${this.escape(title)}</h3>
					<div class="camsprep-iframe-wrap">
						<iframe data-camsprep-calendly data-src="${this.escape(url)}" frameborder="0" title="Schedule a meeting"></iframe>
					</div>
				</section>
			`
        }
        renderWhatsAppTab() {
            const phone = (settings.whatsapp_phone || '').replace(/[^0-9]/g, '');
            const title = settings.whatsapp_tab_title || "Let's WhatsApp";
            const cta = settings.whatsapp_tab_cta || 'Send message on WhatsApp';
            if (!phone) {
                return `
					<section class="camsprep-tab-content" data-camsprep-tab="whatsapp" hidden>
						<div class="camsprep-tab-scroll camsprep-tab-empty">
							<h3 class="camsprep-tab-title">${this.escape(title)}</h3>
							<p>WhatsApp number is not configured yet.</p>
						</div>
					</section>
				`
            }
            const waLink = `https://wa.me/${phone}`;
            return `
				<section class="camsprep-tab-content" data-camsprep-tab="whatsapp" hidden>
					<div class="camsprep-tab-scroll camsprep-whatsapp-pane">
						<div class="camsprep-whatsapp-bubbles" aria-hidden="true">
							<span class="wa-bubble wa-bubble-1">${ICONS.whatsapp}</span>
							<span class="wa-bubble wa-bubble-2">${ICONS.whatsapp}</span>
							<span class="wa-bubble wa-bubble-center">${ICONS.whatsapp}</span>
							<span class="wa-bubble wa-bubble-3">${ICONS.whatsapp}</span>
							<span class="wa-bubble wa-bubble-4">${ICONS.whatsapp}</span>
						</div>
						<h3 class="camsprep-tab-title">${this.escape(title)}</h3>
						<a class="camsprep-submit-btn camsprep-wa-btn" href="${waLink}" target="_blank" rel="noopener noreferrer">
							${this.escape(cta)}
						</a>
					</div>
				</section>
			`
        }
        bindEvents() {
            this.q('[data-camsprep-bubble]').addEventListener('click', () => this.open());
            this.q('[data-camsprep-greeting]').addEventListener('click', () => this.open());
            this.q('[data-camsprep-close]').addEventListener('click', () => this.close());
            this.root.querySelectorAll('[data-camsprep-tab-btn]').forEach(btn => {
                btn.addEventListener('click', () => this.switchTab(btn.dataset.camsprepTabBtn, !0))
            });
            const composer = this.q('[data-camsprep-composer]');
            if (composer) composer.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendInput()
            });
            const talkHuman = this.q('[data-camsprep-talk-human]');
            if (talkHuman) talkHuman.addEventListener('click', () => this.escalateToHuman());
            const clearBtn = this.q('[data-camsprep-clear-history]');
            if (clearBtn) clearBtn.addEventListener('click', () => this.clearHistory());
            const cf = this.q('[data-camsprep-contact-form]');
            if (cf) cf.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitContactForm()
            });
            setTimeout(() => {
                if (!this.isOpen) this.q('[data-camsprep-greeting]').classList.add('camsprep-fade-out');
            }, 8000)
        }
        open() {
            this.isOpen = !0;
            this.q('[data-camsprep-bubble]').setAttribute('hidden', '');
            this.q('[data-camsprep-greeting]').setAttribute('hidden', '');
            this.q('[data-camsprep-panel]').removeAttribute('hidden');
            if (this.activeTab === 'chat' && this.history.length === 0) this.seedConversation();
            setTimeout(() => {
                const input = this.q('[data-camsprep-input]');
                if (input && this.activeTab === 'chat') input.focus();
            }, 100);
            this.startPolling()
        }
        close() {
            this.isOpen = !1;
            this.q('[data-camsprep-panel]').setAttribute('hidden', '');
            this.q('[data-camsprep-bubble]').removeAttribute('hidden');
            this.stopPolling()
        }
        switchTab(tab, persist) {
            if (!this.enabledTabs.includes(tab)) return;
            this.activeTab = tab;
            if (persist) localStorage.setItem(ACTIVE_TAB_KEY, tab);
            this.root.querySelectorAll('[data-camsprep-tab]').forEach(el => {
                el.toggleAttribute('hidden', el.dataset.camsprepTab !== tab)
            });
            this.root.querySelectorAll('[data-camsprep-tab-btn]').forEach(btn => {
                btn.classList.toggle('camsprep-tab-active', btn.dataset.camsprepTabBtn === tab)
            });
            if (tab === 'schedule') {
                const iframe = this.q('[data-camsprep-calendly]');
                if (iframe && !iframe.src) iframe.src = iframe.dataset.src
            }
            if (tab === 'chat' && this.history.length === 0 && this.isOpen) {
                this.seedConversation()
            }
            if (tab === 'chat') {
                setTimeout(() => {
                    const input = this.q('[data-camsprep-input]');
                    if (input) input.focus();
                }, 100)
            }
        }
        seedConversation() {
            const msgs = this.q('[data-camsprep-messages]');
            if (msgs && msgs.children.length > 0) return;
            if (this.sessionToken) {
                this.restoreHistory();
                return
            }
            this.addMessage('bot', settings.greeting || "Hi! How can I help?");
            const introState = localStorage.getItem(INTRO_DONE_KEY);
            if (!introState) {
                this.addIntroForm()
            } else {
                this.renderSuggestions(config.suggestions || [])
            }
        }
        addIntroForm() {
            const schema = settings.intro_form || {
                title: 'Quick intro?',
                subtitle: '',
                fields: [{
                    key: 'name',
                    label: 'Your name',
                    type: 'text',
                    required: !1,
                    placeholder: ''
                }, {
                    key: 'email',
                    label: 'Email',
                    type: 'email',
                    required: !0,
                    placeholder: ''
                }]
            };
            const wrap = document.createElement('div');
            wrap.className = 'camsprep-intro-form';
            wrap.setAttribute('data-camsprep-intro-form', '');
            wrap.style.cssText = 'background:#f6f8fb;border:1px solid #e3e8ef;border-radius:10px;padding:12px;margin:8px 0;';
            const fieldsHtml = schema.fields.map(f => {
                const autoMap = {
                    name: 'name',
                    email: 'email',
                    phone: 'tel',
                    tel: 'tel',
                    country: 'country-name'
                };
                const autocomplete = autoMap[f.key] || 'off';
                const reqMark = f.required ? ' *' : '';
                const placeholder = f.placeholder ? this.escape(f.placeholder) : (this.escape(f.label) + reqMark);
                return `<input type="${this.escape(f.type)}" data-intro-key="${this.escape(f.key)}" placeholder="${placeholder}" autocomplete="${autocomplete}" ${f.required ? 'required' : ''} style="width:100%;padding:8px 10px;border:1px solid #ccd;border-radius:6px;margin-bottom:6px;font-size:13px;box-sizing:border-box;" />`
            }).join('');
            wrap.innerHTML = `
				<div style="font-size:13px;font-weight:500;margin-bottom:6px;">${this.escape(schema.title || 'Quick intro?')}</div>
				${schema.subtitle ? `<div style="font-size:12px;color:#666;margin-bottom:10px;">${this.escape(schema.subtitle)}</div>` : ''}
				${fieldsHtml}
				<div style="display:flex;gap:8px;align-items:center;margin-top:4px;">
					<button type="button" data-intro-submit style="background:var(--camsprep-primary,#185FA5);color:#fff;border:none;padding:8px 14px;border-radius:6px;font-size:13px;cursor:pointer;font-weight:500;">Continue</button>
					<button type="button" data-intro-skip style="background:none;border:none;color:#888;font-size:12px;cursor:pointer;text-decoration:underline;">Skip</button>
					<span data-intro-error style="color:#c0392b;font-size:12px;margin-left:auto;"></span>
				</div>
			`;
            this.q('[data-camsprep-messages]').appendChild(wrap);
            const errEl = wrap.querySelector('[data-intro-error]');
            const submit = wrap.querySelector('[data-intro-submit]');
            const skip = wrap.querySelector('[data-intro-skip]');
            submit.addEventListener('click', async () => {
                const payload = {};
                let firstInvalid = null;
                schema.fields.forEach(f => {
                    const el = wrap.querySelector(`[data-intro-key="${f.key}"]`);
                    const val = (el && el.value || '').trim();
                    payload[f.key] = val;
                    if (f.required && val === '' && !firstInvalid) firstInvalid = {
                        el,
                        label: f.label
                    };
                    if (f.type === 'email' && val !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val) && !firstInvalid) firstInvalid = {
                        el,
                        label: f.label + ' (must be a valid email)'
                    }
                });
                if (firstInvalid) {
                    errEl.textContent = firstInvalid.label + ' is required';
                    if (firstInvalid.el) firstInvalid.el.focus();
                    return
                }
                submit.disabled = !0;
                submit.textContent = 'Saving…';
                try {
                    const res = await this.api('chat-intro', {
                        session_token: this.sessionToken || '',
                        fields: payload,
                        page_url: window.location.href
                    });
                    if (res.conversation_id && !this.sessionToken) {
                        this.sessionToken = String(res.conversation_id);
                        localStorage.setItem(SESSION_KEY, this.sessionToken)
                    }
                    localStorage.setItem(INTRO_DONE_KEY, 'submitted');
                    wrap.innerHTML = `<div style="font-size:13px;color:#1d9e75;">✓ Thanks${res.first_name ? ', ' + this.escape(res.first_name) : ''}! Ask away below.</div>`;
                    this.renderSuggestions(config.suggestions || [])
                } catch (err) {
                    errEl.textContent = 'Could not save — try again.';
                    submit.disabled = !1;
                    submit.textContent = 'Continue'
                }
            });
            skip.addEventListener('click', () => {
                localStorage.setItem(INTRO_DONE_KEY, 'skipped');
                wrap.remove();
                this.renderSuggestions(config.suggestions || [])
            });
            this.scrollChatToBottom()
        }
        async restoreHistory() {
            try {
                const url = config.restUrl + 'history?session_token=' + encodeURIComponent(this.sessionToken) + '&limit=50';
                const res = await fetch(url, {
                    headers: {
                        'X-WP-Nonce': config.nonce
                    }
                });
                const data = await res.json();
                if (!data || data.expired || !Array.isArray(data.messages) || data.messages.length === 0) {
                    if (data && data.expired) {
                        this.sessionToken = '';
                        localStorage.removeItem(SESSION_KEY);
                        localStorage.removeItem(LAST_MSG_ID_KEY)
                    }
                    this.addMessage('bot', settings.greeting || "Hi! How can I help?");
                    this.renderSuggestions(config.suggestions || []);
                    return
                }
                this.addSystemNote('— Continuing your previous conversation —');
                data.messages.forEach(m => {
                    const role = (m.role === 'visitor') ? 'user' : (m.role === 'system' ? 'system' : 'bot');
                    if (role === 'system') {
                        this.addSystemNote(m.content)
                    } else {
                        this.addMessage(role, m.content, m.id);
                        this.history.push({
                            role: role === 'user' ? 'user' : 'assistant',
                            content: m.content
                        })
                    }
                    if (m.id) this.lastSeenMessageId = Math.max(this.lastSeenMessageId, parseInt(m.id, 10));
                });
                localStorage.setItem(LAST_MSG_ID_KEY, String(this.lastSeenMessageId));
                this.scrollChatToBottom()
            } catch (err) {
                console.error('[camsprep] restoreHistory failed', err);
                this.addMessage('bot', settings.greeting || "Hi! How can I help?");
                this.renderSuggestions(config.suggestions || [])
            }
        }
        clearHistory() {
            if (!confirm('Clear this chat from your device? Your conversation will start fresh.')) return;
            this.sessionToken = '';
            this.history = [];
            this.lastSeenMessageId = 0;
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(LAST_MSG_ID_KEY);
            localStorage.removeItem(INTRO_DONE_KEY);
            const messages = this.q('[data-camsprep-messages]');
            if (messages) messages.innerHTML = '';
            this.addMessage('bot', settings.greeting || "Hi! How can I help?");
            this.addIntroForm()
        }
        renderSuggestions(arr) {
            if (!arr || arr.length === 0) return;
            const wrap = document.createElement('div');
            wrap.className = 'camsprep-suggestions';
            arr.forEach(q => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'camsprep-suggestion';
                chip.textContent = q;
                chip.addEventListener('click', () => {
                    wrap.remove();
                    this.sendMessage(q)
                });
                wrap.appendChild(chip)
            });
            this.q('[data-camsprep-messages]').appendChild(wrap)
        }
        sendInput() {
            const input = this.q('[data-camsprep-input]');
            const text = (input.value || '').trim();
            if (!text || this.isThinking) return;
            input.value = '';
            this.sendMessage(text)
        }
        async sendMessage(text) {
            this.addMessage('user', text);
            this.history.push({
                role: 'user',
                content: text
            });
            this.isThinking = !0;
            this.q('[data-camsprep-send]').disabled = !0;
            const thinking = this.addThinking();
            try {
                const res = await this.api('message', {
                    session_token: this.sessionToken,
                    message: text,
                    page_url: window.location.href
                });
                thinking.remove();
                if (res.error === 'rate_limited') {
                    this.addMessage('bot', "You've sent a lot of messages — please try again in a bit.")
                } else if (res.status === 'human_handling') {
                    this.addSystemNote(res.note || 'A team member is replying...')
                } else {
                    if (res.conversation_id && !this.sessionToken) {
                        this.sessionToken = String(res.conversation_id);
                        localStorage.setItem(SESSION_KEY, this.sessionToken)
                    }
                    this.addMessage('bot', res.text, res.message_id);
                    this.history.push({
                        role: 'assistant',
                        content: res.text
                    });
                    this.maybeShowIntentCard(text, res.text)
                }
            } catch (err) {
                thinking.remove();
                this.addMessage('bot', "Sorry — I hit an error. Please try again.");
                console.error('[camsprep]', err)
            } finally {
                this.isThinking = !1;
                this.q('[data-camsprep-send]').disabled = !1;
                const input = this.q('[data-camsprep-input]');
                if (input) input.focus();
            }
        }
        addThinking() {
            const el = document.createElement('div');
            el.className = 'camsprep-msg camsprep-msg-bot';
            el.innerHTML = '<span class="camsprep-typing"><span></span><span></span><span></span></span>';
            this.q('[data-camsprep-messages]').appendChild(el);
            this.scrollChatToBottom();
            return el
        }
        addMessage(role, text, messageId) {
            const el = document.createElement('div');
            el.className = 'camsprep-msg camsprep-msg-' + (role === 'user' ? 'user' : 'bot');
            el.innerHTML = this.format(text);
            if (role === 'bot' && messageId) {
                el.dataset.camsprepMessageId = messageId;
                el.appendChild(this.buildFeedback(messageId))
            }
            this.q('[data-camsprep-messages]').appendChild(el);
            this.scrollChatToBottom();
            return el
        }
        addSystemNote(text) {
            const el = document.createElement('div');
            el.className = 'camsprep-system-note';
            el.textContent = text;
            this.q('[data-camsprep-messages]').appendChild(el);
            this.scrollChatToBottom()
        }
        buildFeedback(messageId) {
            const wrap = document.createElement('div');
            wrap.className = 'camsprep-feedback';
            const up = this.makeFeedbackBtn('👍', 1, wrap);
            const down = this.makeFeedbackBtn('👎', -1, wrap);
            wrap.appendChild(up);
            wrap.appendChild(down);
            wrap.dataset.messageId = messageId;
            return wrap
        }
        makeFeedbackBtn(label, value, wrap) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'camsprep-feedback-btn';
            btn.textContent = label;
            btn.addEventListener('click', async () => {
                wrap.querySelectorAll('button').forEach(b => b.classList.remove('camsprep-active'));
                btn.classList.add('camsprep-active');
                try {
                    await this.api('feedback', {
                        message_id: parseInt(wrap.dataset.messageId, 10),
                        value
                    })
                } catch (err) {
                    console.error('[camsprep] feedback', err)
                }
            });
            return btn
        }
        async escalateToHuman() {
            if (!settings.live_chat_enabled) return;
            if (!this.sessionToken) {
                await this.sendMessage('I would like to talk to a human.');
                setTimeout(() => this.escalateToHuman(), 500);
                return
            }
            try {
                await this.api('escalate', {
                    session_token: this.sessionToken
                });
                const adminName = settings.founder_full_name || settings.admin_display_name || 'Rezaul';
                this.addBotMessage(`I've notified ${adminName.split(',')[0]}. He typically replies within 24 hours. In the meantime, here are your options:`);
                this.addQuickActions();
                const btn = this.q('[data-camsprep-talk-human]');
                if (btn) {
                    btn.disabled = !0;
                    btn.innerHTML = '<span class="camsprep-talk-human-icon">✓</span> Rezaul has been notified'
                }
            } catch (err) {
                console.error('[camsprep] escalate failed', err);
                this.addSystemNote("Couldn't send your request. Try the Contact tab below to reach Rezaul directly.");
                this.addQuickActions()
            }
        }
        maybeShowIntentCard(visitorMsg, aiReply) {
            const haystack = ((visitorMsg || '') + ' ' + (aiReply || '')).toLowerCase();
            const intents = [{
                key: 'schedule',
                tab: 'schedule',
                available: () => this.enabledTabs.includes('schedule') && (settings.calendly_url || '').trim() !== '',
                patterns: ['schedule a call', 'schedule a meeting', 'book a call', 'book a meeting', 'book a time', 'set up a call', 'set up a meeting', 'calendly', 'pick a time', 'appointment'],
                icon: '📅',
                label: 'Schedule a call',
                sub: settings.schedule_tab_title || 'Pick a time that works for you'
            }, {
                key: 'whatsapp',
                tab: 'whatsapp',
                available: () => this.enabledTabs.includes('whatsapp') && (settings.whatsapp_phone || '').trim() !== '',
                patterns: ['whatsapp', 'whats app', 'whats-app'],
                icon: '💬',
                label: 'Continue on WhatsApp',
                sub: settings.whatsapp_tab_title || "Let's WhatsApp"
            }, {
                key: 'contact',
                tab: 'contact',
                available: () => this.enabledTabs.includes('contact'),
                patterns: ['contact form', 'leave a message', 'leave a detailed message', 'send a message', 'send a detailed message', 'longer question', 'send us your questions', 'email me', 'reach out via email'],
                icon: '📋',
                label: 'Leave a detailed message',
                sub: 'Rezaul will reply within 24 hours'
            }];
            for (const intent of intents) {
                if (this.shownIntentCards.has(intent.key)) continue;
                if (!intent.available()) continue;
                const matched = intent.patterns.some(p => haystack.includes(p));
                if (!matched) continue;
                this.shownIntentCards.add(intent.key);
                this.renderIntentCard(intent);
                return
            }
        }
        renderIntentCard(intent) {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'camsprep-intent-card';
            card.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;background:var(--camsprep-bg-soft,#f6f8fb);border:1px solid var(--camsprep-border,#e3e8ef);border-radius:10px;padding:10px 12px;margin:6px 0;cursor:pointer;text-align:left;transition:background 0.15s,border-color 0.15s;';
            card.innerHTML = `
				<span style="font-size:20px;flex-shrink:0;">${intent.icon}</span>
				<span style="flex:1;min-width:0;">
					<span style="display:block;font-size:13px;font-weight:500;color:var(--camsprep-text,#1F2937);">${this.escape(intent.label)}</span>
					<span style="display:block;font-size:11px;color:var(--camsprep-text-muted,#6B7280);margin-top:1px;">${this.escape(intent.sub)}</span>
				</span>
				<span style="color:var(--camsprep-primary,#185FA5);font-size:18px;flex-shrink:0;">→</span>
			`;
            card.addEventListener('mouseenter', () => {
                card.style.background = '#fff';
                card.style.borderColor = 'var(--camsprep-primary,#185FA5)'
            });
            card.addEventListener('mouseleave', () => {
                card.style.background = 'var(--camsprep-bg-soft,#f6f8fb)';
                card.style.borderColor = 'var(--camsprep-border,#e3e8ef)'
            });
            card.addEventListener('click', () => this.switchTab(intent.tab, !0));
            this.q('[data-camsprep-messages]').appendChild(card);
            this.scrollChatToBottom()
        }
        addQuickActions() {
            const actions = [];
            if (this.enabledTabs.includes('contact')) {
                actions.push({
                    icon: '📋',
                    label: 'Leave a detailed message',
                    sub: "Rezaul will reply within 24 hours",
                    tab: 'contact'
                })
            }
            if (this.enabledTabs.includes('schedule') && settings.calendly_url) {
                actions.push({
                    icon: '📅',
                    label: 'Schedule a call',
                    sub: 'Pick a time that works for you',
                    tab: 'schedule'
                })
            }
            if (this.enabledTabs.includes('whatsapp') && (settings.whatsapp_phone || '').trim()) {
                actions.push({
                    icon: '📞',
                    label: 'WhatsApp directly',
                    sub: 'Get a faster response',
                    tab: 'whatsapp'
                })
            }
            if (actions.length === 0) return;
            const wrap = document.createElement('div');
            wrap.className = 'camsprep-quick-actions';
            actions.forEach(a => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'camsprep-quick-action';
                btn.innerHTML = `
					<span class="camsprep-quick-action-icon">${a.icon}</span>
					<span class="camsprep-quick-action-body">
						<span class="camsprep-quick-action-label">${this.escape(a.label)}</span>
						<span class="camsprep-quick-action-sub">${this.escape(a.sub)}</span>
					</span>
					<span class="camsprep-quick-action-arrow">→</span>
				`;
                btn.addEventListener('click', () => this.switchTab(a.tab, !0));
                wrap.appendChild(btn)
            });
            this.q('[data-camsprep-messages]').appendChild(wrap);
            this.scrollChatToBottom()
        }
        addBotMessage(text) {
            return this.addMessage('bot', text)
        }
        async submitContactForm() {
            const form = this.q('[data-camsprep-contact-form]');
            const submitBtn = form.querySelector('button[type="submit"]');
            const name = this.q('[data-camsprep-cf-name]').value.trim();
            const email = this.q('[data-camsprep-cf-email]').value.trim();
            const message = this.q('[data-camsprep-cf-msg]').value.trim();
            const country = this.q('[data-camsprep-cf-country]') ? .value.trim() || '';
            const phone = this.q('[data-camsprep-cf-phone]') ? .value.trim() || '';
            if (!name || !email || !message) {
                alert('Please fill name, email, and message.');
                return
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Please enter a valid email.');
                return
            }
            submitBtn.disabled = !0;
            submitBtn.textContent = 'Sending…';
            let composed = message;
            if (country) composed += '\n\nCountry: ' + country;
            if (phone) composed += '\nPhone: ' + phone;
            try {
                const res = await this.api('contact', {
                    session_token: this.sessionToken,
                    name,
                    email,
                    message: composed,
                    page_url: window.location.href
                });
                const firstName = this.escape(name.split(' ')[0]);
                const replyText = this.escape(res.reply || ("Thanks " + name.split(' ')[0] + "! We'll be in touch within 24 hours."));
                form.style.display = 'none';
                const success = this.q('[data-camsprep-form-success]');
                success.removeAttribute('hidden');
                success.innerHTML = `
					<div class="camsprep-success-icon" aria-hidden="true">✓</div>
					<h3 class="camsprep-success-title">Message sent, ${firstName}!</h3>
					<p class="camsprep-success-text">${replyText}</p>
					<button type="button" class="camsprep-submit-btn camsprep-reset-form-btn">Send another message</button>
				`;
                const resetBtn = success.querySelector('.camsprep-reset-form-btn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        success.setAttribute('hidden', '');
                        form.style.display = '';
                        form.reset();
                        submitBtn.disabled = !1;
                        submitBtn.textContent = 'Submit'
                    })
                }
                success.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            } catch (err) {
                submitBtn.disabled = !1;
                submitBtn.textContent = 'Submit';
                alert('Could not send. Please try again.')
            }
        }
        startPolling() {
            if (this.pollTimer || !this.sessionToken) return;
            this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
            this.poll()
        }
        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null
            }
        }
        async poll() {
            if (!this.sessionToken) return;
            try {
                const url = config.restUrl + 'poll?session_token=' + encodeURIComponent(this.sessionToken) + '&since_id=' + this.lastSeenMessageId;
                const res = await fetch(url, {
                    headers: {
                        'X-WP-Nonce': config.nonce
                    }
                });
                const data = await res.json();
                if (!data || !data.messages) return;
                if (data.state === 'human_active' && this.state !== 'human_active') {
                    this.applyAdminMode(data.admin_display || 'Rezaul Karim, CAMS')
                } else if (data.state !== 'human_active' && this.state === 'human_active') {
                    this.applyAiMode()
                }
                this.state = data.state;
                data.messages.forEach(m => {
                    this.lastSeenMessageId = Math.max(this.lastSeenMessageId, parseInt(m.id, 10));
                    if (m.role === 'admin') this.addMessage('bot', m.content);
                    else if (m.role === 'system') this.addSystemNote(m.content);
                });
                localStorage.setItem(LAST_MSG_ID_KEY, String(this.lastSeenMessageId))
            } catch (err) {
                console.error('[camsprep] poll failed', err)
            }
        }
        applyAdminMode(adminName) {
            const fullName = settings.founder_full_name || adminName || 'Rezaul Karim, CAMS';
            const title = settings.founder_title || 'Live agent';
            const photo = settings.founder_photo_url || '';
            const nameEl = this.q('[data-camsprep-name]');
            if (nameEl) nameEl.textContent = fullName;
            const sub = this.q('[data-camsprep-sub]');
            if (sub) sub.textContent = title + ' · Online now';
            const avatar = this.q('[data-camsprep-avatar]');
            if (avatar) {
                if (photo) {
                    avatar.innerHTML = `<img src="${this.escape(photo)}" alt="">`
                } else {
                    avatar.textContent = this.makeInitials(fullName)
                }
            }
        }
        applyAiMode() {
            const assistantName = settings.assistant_name || 'CAMS Prep Assistant';
            const nameEl = this.q('[data-camsprep-name]');
            if (nameEl) nameEl.textContent = assistantName;
            const sub = this.q('[data-camsprep-sub]');
            if (sub) sub.textContent = settings.assistant_subtitle || 'Online';
            const avatar = this.q('[data-camsprep-avatar]');
            if (avatar) avatar.textContent = settings.avatar_initials || 'A'
        }
        async api(endpoint, payload) {
            const res = await fetch(config.restUrl + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': config.nonce
                },
                body: JSON.stringify(payload)
            });
            return res.json()
        }
        q(selector) {
            return this.root.querySelector(selector)
        }
        escape(str) {
            return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
        }
        format(text) {
            let raw = String(text || '');
            raw = raw.replace(/^\|?\s*[-:]+\s*(\|\s*[-:]+\s*)+\|?\s*$/gm, '');
            raw = raw.replace(/^\|(.+)\|\s*$/gm, function(m, inner) {
                const cells = inner.split('|').map(s => s.trim()).filter(s => s !== '');
                return cells.join(' — ')
            });
            let html = this.escape(raw);
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
            html = html.replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>');
            html = html.replace(/(?:^|\n)((?:[-*]\s+.+(?:\n|$))+)/g, function(m, block) {
                const items = block.trim().split('\n').map(line => {
                    const t = line.replace(/^[-*]\s+/, '').trim();
                    return '<li>' + t + '</li>'
                }).join('');
                return '<ul style="margin:6px 0;padding-left:20px;">' + items + '</ul>'
            });
            html = html.replace(/(?:^|\n)((?:\d+\.\s+.+(?:\n|$))+)/g, function(m, block) {
                const items = block.trim().split('\n').map(line => {
                    const t = line.replace(/^\d+\.\s+/, '').trim();
                    return '<li>' + t + '</li>'
                }).join('');
                return '<ol style="margin:6px 0;padding-left:22px;">' + items + '</ol>'
            });
            html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            const placeholders = [];
            html = html.replace(/<a [^>]*>[\s\S]*?<\/a>/g, function(match) {
                placeholders.push(match);
                return 'LINK' + (placeholders.length - 1) + ''
            });
            html = html.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]])/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
            html = html.replace(/(^|[\s>])((?:www\.|[a-zA-Z0-9-]+\.)(?:com|org|net|io|co|ai|me|app|us|uk|in|bd|dev)\/[^\s<]+)/g, function(m, prefix, url) {
                const href = url.startsWith('www.') ? 'https://' + url : 'https://' + url;
                return prefix + '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + url + '</a>'
            });
            html = html.replace(/LINK(\d+)/g, function(m, i) {
                return placeholders[parseInt(i, 10)]
            });
            html = html.replace(/\n/g, '<br>');
            return html
        }
        scrollChatToBottom() {
            const m = this.q('[data-camsprep-messages]');
            if (m) m.scrollTop = m.scrollHeight
        }
        makeInitials(name) {
            const parts = String(name).trim().split(/\s+/);
            if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        countryOptions() {
            const list = ['United States', 'United Kingdom', 'Bangladesh', 'India', 'Canada', 'Australia', 'Singapore', 'UAE', 'Saudi Arabia', 'Pakistan', 'Sri Lanka', 'Nepal', 'Nigeria', 'Kenya', 'South Africa', 'Germany', 'France', 'Netherlands', 'Spain', 'Italy', 'Brazil', 'Mexico', 'Philippines', 'Indonesia', 'Malaysia', 'China', 'Hong Kong', 'Japan', 'South Korea', 'Egypt', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Turkey'];
            return list.map(c => `<option value="${c}"></option>`).join('')
        }
    }

    function boot() {
        const root = document.getElementById('camsprep-chat-root');
        if (!root) return;
        window.camsprepWidget = new CamsprepWidget(root)
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot)
    } else {
        boot()
    }
})();