
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules/@sveltejs/svelte-scroller/Scroller.svelte generated by Svelte v3.32.3 */

    const { window: window_1 } = globals;
    const file = "node_modules/@sveltejs/svelte-scroller/Scroller.svelte";
    const get_foreground_slot_changes = dirty => ({});
    const get_foreground_slot_context = ctx => ({});
    const get_background_slot_changes = dirty => ({});
    const get_background_slot_context = ctx => ({});

    function create_fragment(ctx) {
    	let svelte_scroller_outer;
    	let svelte_scroller_background_container;
    	let svelte_scroller_background;
    	let t;
    	let svelte_scroller_foreground;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[20]);
    	const background_slot_template = /*#slots*/ ctx[19].background;
    	const background_slot = create_slot(background_slot_template, ctx, /*$$scope*/ ctx[18], get_background_slot_context);
    	const foreground_slot_template = /*#slots*/ ctx[19].foreground;
    	const foreground_slot = create_slot(foreground_slot_template, ctx, /*$$scope*/ ctx[18], get_foreground_slot_context);

    	const block = {
    		c: function create() {
    			svelte_scroller_outer = element("svelte-scroller-outer");
    			svelte_scroller_background_container = element("svelte-scroller-background-container");
    			svelte_scroller_background = element("svelte-scroller-background");
    			if (background_slot) background_slot.c();
    			t = space();
    			svelte_scroller_foreground = element("svelte-scroller-foreground");
    			if (foreground_slot) foreground_slot.c();
    			set_custom_element_data(svelte_scroller_background, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_background, file, 169, 2, 3916);
    			set_custom_element_data(svelte_scroller_background_container, "class", "background-container svelte-xdbafy");
    			set_custom_element_data(svelte_scroller_background_container, "style", /*style*/ ctx[4]);
    			add_location(svelte_scroller_background_container, file, 168, 1, 3838);
    			set_custom_element_data(svelte_scroller_foreground, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_foreground, file, 174, 1, 4078);
    			set_custom_element_data(svelte_scroller_outer, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_outer, file, 167, 0, 3795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_scroller_outer, anchor);
    			append_dev(svelte_scroller_outer, svelte_scroller_background_container);
    			append_dev(svelte_scroller_background_container, svelte_scroller_background);

    			if (background_slot) {
    				background_slot.m(svelte_scroller_background, null);
    			}

    			/*svelte_scroller_background_binding*/ ctx[21](svelte_scroller_background);
    			append_dev(svelte_scroller_outer, t);
    			append_dev(svelte_scroller_outer, svelte_scroller_foreground);

    			if (foreground_slot) {
    				foreground_slot.m(svelte_scroller_foreground, null);
    			}

    			/*svelte_scroller_foreground_binding*/ ctx[22](svelte_scroller_foreground);
    			/*svelte_scroller_outer_binding*/ ctx[23](svelte_scroller_outer);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*onwindowresize*/ ctx[20]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (background_slot) {
    				if (background_slot.p && dirty[0] & /*$$scope*/ 262144) {
    					update_slot(background_slot, background_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_background_slot_changes, get_background_slot_context);
    				}
    			}

    			if (!current || dirty[0] & /*style*/ 16) {
    				set_custom_element_data(svelte_scroller_background_container, "style", /*style*/ ctx[4]);
    			}

    			if (foreground_slot) {
    				if (foreground_slot.p && dirty[0] & /*$$scope*/ 262144) {
    					update_slot(foreground_slot, foreground_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_foreground_slot_changes, get_foreground_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background_slot, local);
    			transition_in(foreground_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background_slot, local);
    			transition_out(foreground_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_scroller_outer);
    			if (background_slot) background_slot.d(detaching);
    			/*svelte_scroller_background_binding*/ ctx[21](null);
    			if (foreground_slot) foreground_slot.d(detaching);
    			/*svelte_scroller_foreground_binding*/ ctx[22](null);
    			/*svelte_scroller_outer_binding*/ ctx[23](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const handlers = [];
    let manager;

    if (typeof window !== "undefined") {
    	const run_all = () => handlers.forEach(fn => fn());
    	window.addEventListener("scroll", run_all);
    	window.addEventListener("resize", run_all);
    }

    if (typeof IntersectionObserver !== "undefined") {
    	const map = new Map();

    	const observer = new IntersectionObserver((entries, observer) => {
    			entries.forEach(entry => {
    				const update = map.get(entry.target);
    				const index = handlers.indexOf(update);

    				if (entry.isIntersecting) {
    					if (index === -1) handlers.push(update);
    				} else {
    					update();
    					if (index !== -1) handlers.splice(index, 1);
    				}
    			});
    		},
    	{
    			rootMargin: "400px 0px", // TODO why 400?
    			
    		});

    	manager = {
    		add: ({ outer, update }) => {
    			const { top, bottom } = outer.getBoundingClientRect();
    			if (top < window.innerHeight && bottom > 0) handlers.push(update);
    			map.set(outer, update);
    			observer.observe(outer);
    		},
    		remove: ({ outer, update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    			map.delete(outer);
    			observer.unobserve(outer);
    		}
    	};
    } else {
    	manager = {
    		add: ({ update }) => {
    			handlers.push(update);
    		},
    		remove: ({ update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let top_px;
    	let bottom_px;
    	let threshold_px;
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Scroller", slots, ['background','foreground']);
    	let { top = 0 } = $$props;
    	let { bottom = 1 } = $$props;
    	let { threshold = 0.5 } = $$props;
    	let { query = "section" } = $$props;
    	let { parallax = false } = $$props;
    	let { index = 0 } = $$props;
    	let { count = 0 } = $$props;
    	let { offset = 0 } = $$props;
    	let { progress = 0 } = $$props;
    	let { visible = false } = $$props;
    	let outer;
    	let foreground;
    	let background;
    	let left;
    	let sections;
    	let wh = 0;
    	let fixed;
    	let offset_top;
    	let width = 1;
    	let height;
    	let inverted;

    	onMount(() => {
    		sections = foreground.querySelectorAll(query);
    		$$invalidate(6, count = sections.length);
    		update();
    		const scroller = { outer, update };
    		manager.add(scroller);
    		return () => manager.remove(scroller);
    	});

    	function update() {
    		if (!foreground) return;

    		// re-measure outer container
    		const bcr = outer.getBoundingClientRect();

    		left = bcr.left;
    		$$invalidate(17, width = bcr.right - left);

    		// determine fix state
    		const fg = foreground.getBoundingClientRect();

    		const bg = background.getBoundingClientRect();
    		$$invalidate(9, visible = fg.top < wh && fg.bottom > 0);
    		const foreground_height = fg.bottom - fg.top;
    		const background_height = bg.bottom - bg.top;
    		const available_space = bottom_px - top_px;
    		$$invalidate(8, progress = (top_px - fg.top) / (foreground_height - available_space));

    		if (progress <= 0) {
    			$$invalidate(16, offset_top = 0);
    			$$invalidate(15, fixed = false);
    		} else if (progress >= 1) {
    			$$invalidate(16, offset_top = parallax
    			? foreground_height - background_height
    			: foreground_height - available_space);

    			$$invalidate(15, fixed = false);
    		} else {
    			$$invalidate(16, offset_top = parallax
    			? Math.round(top_px - progress * (background_height - available_space))
    			: top_px);

    			$$invalidate(15, fixed = true);
    		}

    		for ($$invalidate(5, index = 0); index < sections.length; $$invalidate(5, index += 1)) {
    			const section = sections[index];
    			const { top } = section.getBoundingClientRect();
    			const next = sections[index + 1];
    			const bottom = next ? next.getBoundingClientRect().top : fg.bottom;
    			$$invalidate(7, offset = (threshold_px - top) / (bottom - top));
    			if (bottom >= threshold_px) break;
    		}
    	}

    	const writable_props = [
    		"top",
    		"bottom",
    		"threshold",
    		"query",
    		"parallax",
    		"index",
    		"count",
    		"offset",
    		"progress",
    		"visible"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Scroller> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, wh = window_1.innerHeight);
    	}

    	function svelte_scroller_background_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			background = $$value;
    			$$invalidate(3, background);
    		});
    	}

    	function svelte_scroller_foreground_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			foreground = $$value;
    			$$invalidate(2, foreground);
    		});
    	}

    	function svelte_scroller_outer_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			outer = $$value;
    			$$invalidate(1, outer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("top" in $$props) $$invalidate(10, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$props.bottom);
    		if ("threshold" in $$props) $$invalidate(12, threshold = $$props.threshold);
    		if ("query" in $$props) $$invalidate(13, query = $$props.query);
    		if ("parallax" in $$props) $$invalidate(14, parallax = $$props.parallax);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("count" in $$props) $$invalidate(6, count = $$props.count);
    		if ("offset" in $$props) $$invalidate(7, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(8, progress = $$props.progress);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("$$scope" in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		handlers,
    		manager,
    		onMount,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		outer,
    		foreground,
    		background,
    		left,
    		sections,
    		wh,
    		fixed,
    		offset_top,
    		width,
    		height,
    		inverted,
    		update,
    		top_px,
    		bottom_px,
    		threshold_px,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("top" in $$props) $$invalidate(10, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$props.bottom);
    		if ("threshold" in $$props) $$invalidate(12, threshold = $$props.threshold);
    		if ("query" in $$props) $$invalidate(13, query = $$props.query);
    		if ("parallax" in $$props) $$invalidate(14, parallax = $$props.parallax);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("count" in $$props) $$invalidate(6, count = $$props.count);
    		if ("offset" in $$props) $$invalidate(7, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(8, progress = $$props.progress);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("outer" in $$props) $$invalidate(1, outer = $$props.outer);
    		if ("foreground" in $$props) $$invalidate(2, foreground = $$props.foreground);
    		if ("background" in $$props) $$invalidate(3, background = $$props.background);
    		if ("left" in $$props) left = $$props.left;
    		if ("sections" in $$props) sections = $$props.sections;
    		if ("wh" in $$props) $$invalidate(0, wh = $$props.wh);
    		if ("fixed" in $$props) $$invalidate(15, fixed = $$props.fixed);
    		if ("offset_top" in $$props) $$invalidate(16, offset_top = $$props.offset_top);
    		if ("width" in $$props) $$invalidate(17, width = $$props.width);
    		if ("height" in $$props) height = $$props.height;
    		if ("inverted" in $$props) $$invalidate(30, inverted = $$props.inverted);
    		if ("top_px" in $$props) top_px = $$props.top_px;
    		if ("bottom_px" in $$props) bottom_px = $$props.bottom_px;
    		if ("threshold_px" in $$props) threshold_px = $$props.threshold_px;
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*top, wh*/ 1025) {
    			top_px = Math.round(top * wh);
    		}

    		if ($$self.$$.dirty[0] & /*bottom, wh*/ 2049) {
    			bottom_px = Math.round(bottom * wh);
    		}

    		if ($$self.$$.dirty[0] & /*threshold, wh*/ 4097) {
    			threshold_px = Math.round(threshold * wh);
    		}

    		if ($$self.$$.dirty[0] & /*top, bottom, threshold, parallax*/ 23552) {
    			(update());
    		}

    		if ($$self.$$.dirty[0] & /*fixed, offset_top, width*/ 229376) {
    			$$invalidate(4, style = `
		position: ${fixed ? "fixed" : "absolute"};
		top: 0;
		transform: translate(0, ${offset_top}px);
		width: ${width}px;
		z-index: ${inverted ? 3 : 1};
	`);
    		}
    	};

    	return [
    		wh,
    		outer,
    		foreground,
    		background,
    		style,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		fixed,
    		offset_top,
    		width,
    		$$scope,
    		slots,
    		onwindowresize,
    		svelte_scroller_background_binding,
    		svelte_scroller_foreground_binding,
    		svelte_scroller_outer_binding
    	];
    }

    class Scroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				top: 10,
    				bottom: 11,
    				threshold: 12,
    				query: 13,
    				parallax: 14,
    				index: 5,
    				count: 6,
    				offset: 7,
    				progress: 8,
    				visible: 9
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scroller",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get top() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get query() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parallax() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parallax(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get progress() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progress(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function loader (urls, test, callback) {
      let remaining = urls.length;

      function maybeCallback () {
        remaining = --remaining;
        if (remaining < 1) {
          callback();
        }
      }

      if (!test()) {
        urls.forEach(({ type, url, options = { async: true, defer: true }}) => {
          const isScript = type === 'script';
          const tag = document.createElement(isScript ? 'script': 'link');
          if (isScript) {
            tag.src = url;
            tag.async = options.async;
            tag.defer = options.defer;
          } else {
            tag.rel = 'stylesheet';
    		    tag.href = url;
          }
          tag.onload = maybeCallback;
          document.body.appendChild(tag);
        });
      } else {
        callback();
      }
    }

    const contextKey = {};

    function reusify (Constructor) {
      var head = new Constructor();
      var tail = head;

      function get () {
        var current = head;

        if (current.next) {
          head = current.next;
        } else {
          head = new Constructor();
          tail = head;
        }

        current.next = null;

        return current
      }

      function release (obj) {
        tail.next = obj;
        tail = obj;
      }

      return {
        get: get,
        release: release
      }
    }

    var reusify_1 = reusify;

    function fastqueue (context, worker, concurrency) {
      if (typeof context === 'function') {
        concurrency = worker;
        worker = context;
        context = null;
      }

      if (concurrency < 1) {
        throw new Error('fastqueue concurrency must be greater than 1')
      }

      var cache = reusify_1(Task);
      var queueHead = null;
      var queueTail = null;
      var _running = 0;
      var errorHandler = null;

      var self = {
        push: push,
        drain: noop$1,
        saturated: noop$1,
        pause: pause,
        paused: false,
        concurrency: concurrency,
        running: running,
        resume: resume,
        idle: idle,
        length: length,
        getQueue: getQueue,
        unshift: unshift,
        empty: noop$1,
        kill: kill,
        killAndDrain: killAndDrain,
        error: error
      };

      return self

      function running () {
        return _running
      }

      function pause () {
        self.paused = true;
      }

      function length () {
        var current = queueHead;
        var counter = 0;

        while (current) {
          current = current.next;
          counter++;
        }

        return counter
      }

      function getQueue () {
        var current = queueHead;
        var tasks = [];

        while (current) {
          tasks.push(current.value);
          current = current.next;
        }

        return tasks
      }

      function resume () {
        if (!self.paused) return
        self.paused = false;
        for (var i = 0; i < self.concurrency; i++) {
          _running++;
          release();
        }
      }

      function idle () {
        return _running === 0 && self.length() === 0
      }

      function push (value, done) {
        var current = cache.get();

        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop$1;
        current.errorHandler = errorHandler;

        if (_running === self.concurrency || self.paused) {
          if (queueTail) {
            queueTail.next = current;
            queueTail = current;
          } else {
            queueHead = current;
            queueTail = current;
            self.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }

      function unshift (value, done) {
        var current = cache.get();

        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop$1;

        if (_running === self.concurrency || self.paused) {
          if (queueHead) {
            current.next = queueHead;
            queueHead = current;
          } else {
            queueHead = current;
            queueTail = current;
            self.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }

      function release (holder) {
        if (holder) {
          cache.release(holder);
        }
        var next = queueHead;
        if (next) {
          if (!self.paused) {
            if (queueTail === queueHead) {
              queueTail = null;
            }
            queueHead = next.next;
            next.next = null;
            worker.call(context, next.value, next.worked);
            if (queueTail === null) {
              self.empty();
            }
          } else {
            _running--;
          }
        } else if (--_running === 0) {
          self.drain();
        }
      }

      function kill () {
        queueHead = null;
        queueTail = null;
        self.drain = noop$1;
      }

      function killAndDrain () {
        queueHead = null;
        queueTail = null;
        self.drain();
        self.drain = noop$1;
      }

      function error (handler) {
        errorHandler = handler;
      }
    }

    function noop$1 () {}

    function Task () {
      this.value = null;
      this.callback = noop$1;
      this.next = null;
      this.release = noop$1;
      this.context = null;
      this.errorHandler = null;

      var self = this;

      this.worked = function worked (err, result) {
        var callback = self.callback;
        var errorHandler = self.errorHandler;
        var val = self.value;
        self.value = null;
        self.callback = noop$1;
        if (self.errorHandler) {
          errorHandler(err, val);
        }
        callback.call(self.context, err, result);
        self.release(self);
      };
    }

    function queueAsPromised (context, worker, concurrency) {
      if (typeof context === 'function') {
        concurrency = worker;
        worker = context;
        context = null;
      }

      function asyncWrapper (arg, cb) {
        worker.call(this, arg)
          .then(function (res) {
            cb(null, res);
          }, cb);
      }

      var queue = fastqueue(context, asyncWrapper, concurrency);

      var pushCb = queue.push;
      var unshiftCb = queue.unshift;

      queue.push = push;
      queue.unshift = unshift;

      return queue

      function push (value) {
        return new Promise(function (resolve, reject) {
          pushCb(value, function (err, result) {
            if (err) {
              reject(err);
              return
            }
            resolve(result);
          });
        })
      }

      function unshift (value) {
        return new Promise(function (resolve, reject) {
          unshiftCb(value, function (err, result) {
            if (err) {
              reject(err);
              return
            }
            resolve(result);
          });
        })
      }
    }

    var queue = fastqueue;
    var promise$1 = queueAsPromised;
    queue.promise = promise$1;

    class EventQueue {
      constructor (worker) {
        this.queue = new queue(this, worker, 1);
        this.queue.pause();
      }

      send (command, params = []) {
        if (!command) { return }
        this.queue.push([ command, params ]);
      }

      start () {
        this.queue.resume();
      }

      stop () {
        this.queue.kill();
      }
    }

    /* node_modules/@beyonk/svelte-mapbox/src/Map.svelte generated by Svelte v3.32.3 */

    const { Object: Object_1 } = globals;
    const file$1 = "node_modules/@beyonk/svelte-mapbox/src/Map.svelte";

    // (2:2) {#if map}
    function create_if_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(2:2) {#if map}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	let if_block = /*map*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "svelte-1kuj9kb");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[20](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*map*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*map*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[20](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Map", slots, ['default']);

    	setContext(contextKey, {
    		getMap: () => map,
    		getMapbox: () => mapbox
    	});

    	const dispatch = createEventDispatcher();
    	let container;
    	let mapbox;
    	const queue = new EventQueue(worker);
    	let { map = null } = $$props;
    	let { version = "v1.11.1" } = $$props;
    	let { center = [0, 0] } = $$props;
    	let { zoom = 9 } = $$props;
    	let { zoomRate = 1 } = $$props;
    	let { wheelZoomRate = 1 } = $$props;
    	let { options = {} } = $$props;
    	let { accessToken } = $$props;
    	let { customStylesheetUrl = false } = $$props;
    	let { style = "mapbox://styles/mapbox/streets-v11" } = $$props;

    	function fitBounds(bbox) {
    		queue.send("fitBounds", [bbox]);
    	}

    	function flyTo(destination) {
    		queue.send("flyTo", [destination]);
    	}

    	function resize() {
    		queue.send("resize");
    	}

    	function setCenter(coords) {
    		queue.send("setCenter", [coords]);
    	}

    	function addControl(control) {
    		queue.send("addControl", [control]);
    	}

    	function getMap() {
    		return map;
    	}

    	function getMapbox() {
    		return mapbox;
    	}

    	function onAvailable() {
    		window.mapboxgl.accessToken = accessToken;
    		mapbox = window.mapboxgl;

    		const optionsWithDefaults = Object.assign(
    			{
    				container,
    				style,
    				center,
    				zoom,
    				zoomRate,
    				wheelZoomRate
    			},
    			options
    		);

    		const el = new mapbox.Map(optionsWithDefaults);

    		el.on("dragend", () => {
    			const { lng, lat } = el.getCenter();
    			$$invalidate(2, center = [lng, lat]);
    			dispatch("recentre", { center });
    		});

    		el.on("click", e => dispatch("click", { lng: e.lngLat.lng, lat: e.lngLat.lat }));

    		el.on("zoom", () => {
    			$$invalidate(3, zoom = el.getZoom());
    			dispatch("zoom", { zoom });
    		});

    		el.on("load", () => {
    			$$invalidate(0, map = el);
    			queue.start();
    			dispatch("ready");
    		});
    	}

    	function worker(cmd, cb) {
    		const [command, params] = cmd;
    		map[command].apply(map, params);
    		cb(null);
    	}

    	onMount(() => {
    		const resources = [
    			{
    				type: "script",
    				url: `//api.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.js`
    			},
    			{
    				type: "style",
    				url: `//api.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.css`
    			}
    		];

    		if (customStylesheetUrl) {
    			resources.push({ type: "style", url: customStylesheetUrl });
    		}

    		loader(resources, () => !!window.mapboxgl, onAvailable);

    		return () => {
    			queue.stop();

    			if (map && map.remove) {
    				map.remove();
    			}
    		};
    	});

    	const writable_props = [
    		"map",
    		"version",
    		"center",
    		"zoom",
    		"zoomRate",
    		"wheelZoomRate",
    		"options",
    		"accessToken",
    		"customStylesheetUrl",
    		"style"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("map" in $$props) $$invalidate(0, map = $$props.map);
    		if ("version" in $$props) $$invalidate(4, version = $$props.version);
    		if ("center" in $$props) $$invalidate(2, center = $$props.center);
    		if ("zoom" in $$props) $$invalidate(3, zoom = $$props.zoom);
    		if ("zoomRate" in $$props) $$invalidate(5, zoomRate = $$props.zoomRate);
    		if ("wheelZoomRate" in $$props) $$invalidate(6, wheelZoomRate = $$props.wheelZoomRate);
    		if ("options" in $$props) $$invalidate(7, options = $$props.options);
    		if ("accessToken" in $$props) $$invalidate(8, accessToken = $$props.accessToken);
    		if ("customStylesheetUrl" in $$props) $$invalidate(9, customStylesheetUrl = $$props.customStylesheetUrl);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		loader,
    		onMount,
    		createEventDispatcher,
    		setContext,
    		contextKey,
    		EventQueue,
    		dispatch,
    		container,
    		mapbox,
    		queue,
    		map,
    		version,
    		center,
    		zoom,
    		zoomRate,
    		wheelZoomRate,
    		options,
    		accessToken,
    		customStylesheetUrl,
    		style,
    		fitBounds,
    		flyTo,
    		resize,
    		setCenter,
    		addControl,
    		getMap,
    		getMapbox,
    		onAvailable,
    		worker
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(1, container = $$props.container);
    		if ("mapbox" in $$props) mapbox = $$props.mapbox;
    		if ("map" in $$props) $$invalidate(0, map = $$props.map);
    		if ("version" in $$props) $$invalidate(4, version = $$props.version);
    		if ("center" in $$props) $$invalidate(2, center = $$props.center);
    		if ("zoom" in $$props) $$invalidate(3, zoom = $$props.zoom);
    		if ("zoomRate" in $$props) $$invalidate(5, zoomRate = $$props.zoomRate);
    		if ("wheelZoomRate" in $$props) $$invalidate(6, wheelZoomRate = $$props.wheelZoomRate);
    		if ("options" in $$props) $$invalidate(7, options = $$props.options);
    		if ("accessToken" in $$props) $$invalidate(8, accessToken = $$props.accessToken);
    		if ("customStylesheetUrl" in $$props) $$invalidate(9, customStylesheetUrl = $$props.customStylesheetUrl);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		map,
    		container,
    		center,
    		zoom,
    		version,
    		zoomRate,
    		wheelZoomRate,
    		options,
    		accessToken,
    		customStylesheetUrl,
    		style,
    		fitBounds,
    		flyTo,
    		resize,
    		setCenter,
    		addControl,
    		getMap,
    		getMapbox,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			map: 0,
    			version: 4,
    			center: 2,
    			zoom: 3,
    			zoomRate: 5,
    			wheelZoomRate: 6,
    			options: 7,
    			accessToken: 8,
    			customStylesheetUrl: 9,
    			style: 10,
    			fitBounds: 11,
    			flyTo: 12,
    			resize: 13,
    			setCenter: 14,
    			addControl: 15,
    			getMap: 16,
    			getMapbox: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*accessToken*/ ctx[8] === undefined && !("accessToken" in props)) {
    			console.warn("<Map> was created without expected prop 'accessToken'");
    		}
    	}

    	get map() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set map(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get version() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set version(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoomRate() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoomRate(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wheelZoomRate() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wheelZoomRate(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accessToken() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accessToken(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customStylesheetUrl() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customStylesheetUrl(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fitBounds() {
    		return this.$$.ctx[11];
    	}

    	set fitBounds(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flyTo() {
    		return this.$$.ctx[12];
    	}

    	set flyTo(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resize() {
    		return this.$$.ctx[13];
    	}

    	set resize(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setCenter() {
    		return this.$$.ctx[14];
    	}

    	set setCenter(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addControl() {
    		return this.$$.ctx[15];
    	}

    	set addControl(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getMap() {
    		return this.$$.ctx[16];
    	}

    	set getMap(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getMapbox() {
    		return this.$$.ctx[17];
    	}

    	set getMapbox(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@beyonk/svelte-mapbox/src/Marker.svelte generated by Svelte v3.32.3 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randomColour() {
    	return Math.round(Math.random() * 255);
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let marker;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Marker", slots, []);
    	const { getMap, getMapbox } = getContext(contextKey);
    	const map = getMap();
    	const mapbox = getMapbox();

    	function move(lng, lat) {
    		marker.setLngLat({ lng, lat });
    	}

    	let { lat } = $$props;
    	let { lng } = $$props;
    	let { label = "Marker" } = $$props;
    	let { popupClassName = "beyonk-mapbox-popup" } = $$props;
    	let { markerOffset = [0, 0] } = $$props;
    	let { popupOffset = 10 } = $$props;
    	let { color = randomColour() } = $$props;
    	let { visible = true } = $$props;
    	let { width = 0 } = $$props;
    	let { height = 0 } = $$props;
    	let { cinema } = $$props;
    	let { show = false } = $$props;
    	let { showncinema = "0" } = $$props;
    	let popupEl;

    	function getMarker() {
    		return marker;
    	}

    	const writable_props = [
    		"lat",
    		"lng",
    		"label",
    		"popupClassName",
    		"markerOffset",
    		"popupOffset",
    		"color",
    		"visible",
    		"width",
    		"height",
    		"cinema",
    		"show",
    		"showncinema"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Marker> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("lat" in $$props) $$invalidate(2, lat = $$props.lat);
    		if ("lng" in $$props) $$invalidate(3, lng = $$props.lng);
    		if ("label" in $$props) $$invalidate(4, label = $$props.label);
    		if ("popupClassName" in $$props) $$invalidate(5, popupClassName = $$props.popupClassName);
    		if ("markerOffset" in $$props) $$invalidate(6, markerOffset = $$props.markerOffset);
    		if ("popupOffset" in $$props) $$invalidate(7, popupOffset = $$props.popupOffset);
    		if ("color" in $$props) $$invalidate(8, color = $$props.color);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("width" in $$props) $$invalidate(10, width = $$props.width);
    		if ("height" in $$props) $$invalidate(11, height = $$props.height);
    		if ("cinema" in $$props) $$invalidate(12, cinema = $$props.cinema);
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("showncinema" in $$props) $$invalidate(1, showncinema = $$props.showncinema);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getContext,
    		contextKey,
    		getMap,
    		getMapbox,
    		map,
    		mapbox,
    		randomColour,
    		move,
    		lat,
    		lng,
    		label,
    		popupClassName,
    		markerOffset,
    		popupOffset,
    		color,
    		visible,
    		width,
    		height,
    		cinema,
    		show,
    		showncinema,
    		popupEl,
    		getMarker,
    		marker
    	});

    	$$self.$inject_state = $$props => {
    		if ("lat" in $$props) $$invalidate(2, lat = $$props.lat);
    		if ("lng" in $$props) $$invalidate(3, lng = $$props.lng);
    		if ("label" in $$props) $$invalidate(4, label = $$props.label);
    		if ("popupClassName" in $$props) $$invalidate(5, popupClassName = $$props.popupClassName);
    		if ("markerOffset" in $$props) $$invalidate(6, markerOffset = $$props.markerOffset);
    		if ("popupOffset" in $$props) $$invalidate(7, popupOffset = $$props.popupOffset);
    		if ("color" in $$props) $$invalidate(8, color = $$props.color);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("width" in $$props) $$invalidate(10, width = $$props.width);
    		if ("height" in $$props) $$invalidate(11, height = $$props.height);
    		if ("cinema" in $$props) $$invalidate(12, cinema = $$props.cinema);
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("showncinema" in $$props) $$invalidate(1, showncinema = $$props.showncinema);
    		if ("popupEl" in $$props) $$invalidate(14, popupEl = $$props.popupEl);
    		if ("marker" in $$props) $$invalidate(15, marker = $$props.marker);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color, markerOffset, height, width*/ 3392) {
    			$$invalidate(15, marker = new mapbox.Marker({
    					color,
    					offset: markerOffset,
    					height,
    					width
    				}));
    		}

    		if ($$self.$$.dirty & /*visible, popupOffset, popupClassName, label, marker, popupEl, lng, lat, cinema*/ 53948) {
    			if (visible) {
    				$$invalidate(14, popupEl = new mapbox.Popup({
    						offset: popupOffset,
    						className: popupClassName
    					}).setHTML(label));

    				marker.setPopup(popupEl);
    				marker.setLngLat({ lng, lat }).addTo(map);

    				popupEl.on("open", function () {
    					$$invalidate(0, show = true);
    					$$invalidate(1, showncinema = cinema);
    				});

    				popupEl.on("close", () => $$invalidate(0, show = false));
    			} else if (visible === false) {
    				marker.remove();
    			}
    		}
    	};

    	return [
    		show,
    		showncinema,
    		lat,
    		lng,
    		label,
    		popupClassName,
    		markerOffset,
    		popupOffset,
    		color,
    		visible,
    		width,
    		height,
    		cinema,
    		getMarker,
    		popupEl,
    		marker
    	];
    }

    class Marker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			lat: 2,
    			lng: 3,
    			label: 4,
    			popupClassName: 5,
    			markerOffset: 6,
    			popupOffset: 7,
    			color: 8,
    			visible: 9,
    			width: 10,
    			height: 11,
    			cinema: 12,
    			show: 0,
    			showncinema: 1,
    			getMarker: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Marker",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*lat*/ ctx[2] === undefined && !("lat" in props)) {
    			console.warn("<Marker> was created without expected prop 'lat'");
    		}

    		if (/*lng*/ ctx[3] === undefined && !("lng" in props)) {
    			console.warn("<Marker> was created without expected prop 'lng'");
    		}

    		if (/*cinema*/ ctx[12] === undefined && !("cinema" in props)) {
    			console.warn("<Marker> was created without expected prop 'cinema'");
    		}
    	}

    	get lat() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lat(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lng() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lng(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get popupClassName() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set popupClassName(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get markerOffset() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set markerOffset(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get popupOffset() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set popupOffset(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cinema() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cinema(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showncinema() {
    		throw new Error("<Marker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showncinema(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getMarker() {
    		return this.$$.ctx[13];
    	}

    	set getMarker(value) {
    		throw new Error("<Marker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/Map.svelte generated by Svelte v3.32.3 */
    const file$2 = "src/Map.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (63:6) {#if fullscreen && cinActive === d.cinemaId}
    function create_if_block$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showPanel*/ ctx[4][/*i*/ ctx[14]] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showPanel*/ ctx[4][/*i*/ ctx[14]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showPanel*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(63:6) {#if fullscreen && cinActive === d.cinemaId}",
    		ctx
    	});

    	return block;
    }

    // (64:6) {#if showPanel[i]}
    function create_if_block_1(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let h2;
    	let t1_value = /*d*/ ctx[12].InfotabTitle + "";
    	let t1;
    	let t2;
    	let p;
    	let raw_value = /*d*/ ctx[12].InfotabText + "";
    	let div1_transition;
    	let current;
    	let if_block = /*d*/ ctx[12].imglinkInfotab !== "" && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			attr_dev(h2, "class", "svelte-zc9qsr");
    			add_location(h2, file$2, 72, 12, 1997);
    			attr_dev(p, "class", "content2");
    			add_location(p, file$2, 73, 12, 2035);
    			attr_dev(div0, "class", "content-container2 svelte-zc9qsr");
    			add_location(div0, file$2, 66, 10, 1760);
    			attr_dev(div1, "class", "panel-left2 svelte-zc9qsr");
    			add_location(div1, file$2, 64, 8, 1697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			p.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*d*/ ctx[12].imglinkInfotab !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(div0, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((!current || dirty & /*list*/ 1) && t1_value !== (t1_value = /*d*/ ctx[12].InfotabTitle + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*list*/ 1) && raw_value !== (raw_value = /*d*/ ctx[12].InfotabText + "")) p.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: -600 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: -600 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(64:6) {#if showPanel[i]}",
    		ctx
    	});

    	return block;
    }

    // (68:12) {#if d.imglinkInfotab !== ""}
    function create_if_block_2(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*d*/ ctx[12].imgLinkInfotab)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-zc9qsr");
    			add_location(img, file$2, 69, 16, 1909);
    			attr_dev(div, "class", "img-container2 center-cropped svelte-zc9qsr");
    			add_location(div, file$2, 68, 14, 1849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*list*/ 1 && img.src !== (img_src_value = /*d*/ ctx[12].imgLinkInfotab)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(68:12) {#if d.imglinkInfotab !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#each list as d,i}
    function create_each_block(ctx) {
    	let marker;
    	let updating_show;
    	let updating_showncinema;
    	let t0;
    	let div;
    	let t1;
    	let current;

    	function marker_show_binding(value) {
    		/*marker_show_binding*/ ctx[9](value, /*i*/ ctx[14]);
    	}

    	function marker_showncinema_binding(value) {
    		/*marker_showncinema_binding*/ ctx[10](value);
    	}

    	let marker_props = {
    		lat: /*d*/ ctx[12].lat,
    		lng: /*d*/ ctx[12].long,
    		color: "#32749C00",
    		label: "<img src='" + /*d*/ ctx[12].imgLink + "' width='100%'></br>\n              <b class='title'>" + /*d*/ ctx[12].cinemaName + "</b><br>\n              <span class='titleNative'>" + /*d*/ ctx[12].cinemaNameNative + "</span>\n              <p>" + /*d*/ ctx[12].address + "</p>\n              <p>" + /*d*/ ctx[12].desc + "</p>\n              <a href='" + /*d*/ ctx[12].websiteLink + "' target='_blank'><p>Link to " + checkLinkType(/*d*/ ctx[12].websiteLink) + "</a>\n              <a href='" + /*d*/ ctx[12].googleMapLink + "' target='_blank'><p>View location on Google map</p></a>\n              ",
    		popup: true,
    		visible: /*d*/ ctx[12].visible,
    		cinema: /*d*/ ctx[12].cinemaId
    	};

    	if (/*showPanel*/ ctx[4][/*i*/ ctx[14]] !== void 0) {
    		marker_props.show = /*showPanel*/ ctx[4][/*i*/ ctx[14]];
    	}

    	if (/*cinActive*/ ctx[3] !== void 0) {
    		marker_props.showncinema = /*cinActive*/ ctx[3];
    	}

    	marker = new Marker({ props: marker_props, $$inline: true });
    	binding_callbacks.push(() => bind(marker, "show", marker_show_binding));
    	binding_callbacks.push(() => bind(marker, "showncinema", marker_showncinema_binding));
    	let if_block = /*fullscreen*/ ctx[1] && /*cinActive*/ ctx[3] === /*d*/ ctx[12].cinemaId && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			create_component(marker.$$.fragment);
    			t0 = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			add_location(div, file$2, 61, 4, 1607);
    		},
    		m: function mount(target, anchor) {
    			mount_component(marker, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const marker_changes = {};
    			if (dirty & /*list*/ 1) marker_changes.lat = /*d*/ ctx[12].lat;
    			if (dirty & /*list*/ 1) marker_changes.lng = /*d*/ ctx[12].long;
    			if (dirty & /*list*/ 1) marker_changes.label = "<img src='" + /*d*/ ctx[12].imgLink + "' width='100%'></br>\n              <b class='title'>" + /*d*/ ctx[12].cinemaName + "</b><br>\n              <span class='titleNative'>" + /*d*/ ctx[12].cinemaNameNative + "</span>\n              <p>" + /*d*/ ctx[12].address + "</p>\n              <p>" + /*d*/ ctx[12].desc + "</p>\n              <a href='" + /*d*/ ctx[12].websiteLink + "' target='_blank'><p>Link to " + checkLinkType(/*d*/ ctx[12].websiteLink) + "</a>\n              <a href='" + /*d*/ ctx[12].googleMapLink + "' target='_blank'><p>View location on Google map</p></a>\n              ";
    			if (dirty & /*list*/ 1) marker_changes.visible = /*d*/ ctx[12].visible;
    			if (dirty & /*list*/ 1) marker_changes.cinema = /*d*/ ctx[12].cinemaId;

    			if (!updating_show && dirty & /*showPanel*/ 16) {
    				updating_show = true;
    				marker_changes.show = /*showPanel*/ ctx[4][/*i*/ ctx[14]];
    				add_flush_callback(() => updating_show = false);
    			}

    			if (!updating_showncinema && dirty & /*cinActive*/ 8) {
    				updating_showncinema = true;
    				marker_changes.showncinema = /*cinActive*/ ctx[3];
    				add_flush_callback(() => updating_showncinema = false);
    			}

    			marker.$set(marker_changes);

    			if (/*fullscreen*/ ctx[1] && /*cinActive*/ ctx[3] === /*d*/ ctx[12].cinemaId) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*fullscreen, cinActive, list*/ 11) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(marker.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(marker.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(marker, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(43:2) {#each list as d,i}",
    		ctx
    	});

    	return block;
    }

    // (36:0) <Map   accessToken="pk.eyJ1IjoibXZ0ZWMiLCJhIjoiY2ttbzVkdnhuMDFjMjJvbWE0c2F0bTZybiJ9.H7TNF1Ff7uS8XnmMt9c7vQ"   style="mapbox://styles/mvtec/ckmo5l59o2tn317ntlzf32krk"   bind:this={mapComponent}   on:ready={onReady}   zoom=2 >
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*list*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*list, showPanel, fullscreen, cinActive, checkLinkType*/ 27) {
    				each_value = /*list*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(36:0) <Map   accessToken=\\\"pk.eyJ1IjoibXZ0ZWMiLCJhIjoiY2ttbzVkdnhuMDFjMjJvbWE0c2F0bTZybiJ9.H7TNF1Ff7uS8XnmMt9c7vQ\\\"   style=\\\"mapbox://styles/mvtec/ckmo5l59o2tn317ntlzf32krk\\\"   bind:this={mapComponent}   on:ready={onReady}   zoom=2 >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let map;
    	let current;

    	let map_props = {
    		accessToken: "pk.eyJ1IjoibXZ0ZWMiLCJhIjoiY2ttbzVkdnhuMDFjMjJvbWE0c2F0bTZybiJ9.H7TNF1Ff7uS8XnmMt9c7vQ",
    		style: "mapbox://styles/mvtec/ckmo5l59o2tn317ntlzf32krk",
    		zoom: "2",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	map = new Map$1({ props: map_props, $$inline: true });
    	/*map_binding*/ ctx[11](map);
    	map.$on("ready", /*onReady*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(map.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(map, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const map_changes = {};

    			if (dirty & /*$$scope, list, showPanel, fullscreen, cinActive*/ 32795) {
    				map_changes.$$scope = { dirty, ctx };
    			}

    			map.$set(map_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*map_binding*/ ctx[11](null);
    			destroy_component(map, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkLinkType(link) {
    	return link.includes("instagram")
    	? "Instagram"
    	: link.includes("facebook") ? "Facebook" : "site";
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Map", slots, []);
    	let { list } = $$props;
    	let { lat } = $$props;
    	let { long } = $$props;
    	let { zoom } = $$props;
    	let { fullscreen } = $$props;
    	let cinActive;
    	let showPanel = [...new Array(list.length)].map(d => false);
    	let mapComponent;

    	function onReady() {
    		mapComponent.setCenter([48.6767356, 27.7236434], 4.23);
    	}

    	const writable_props = ["list", "lat", "long", "zoom", "fullscreen"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	function marker_show_binding(value, i) {
    		if ($$self.$$.not_equal(showPanel[i], value)) {
    			showPanel[i] = value;
    			$$invalidate(4, showPanel);
    		}
    	}

    	function marker_showncinema_binding(value) {
    		cinActive = value;
    		$$invalidate(3, cinActive);
    	}

    	function map_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			mapComponent = $$value;
    			$$invalidate(2, mapComponent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("list" in $$props) $$invalidate(0, list = $$props.list);
    		if ("lat" in $$props) $$invalidate(6, lat = $$props.lat);
    		if ("long" in $$props) $$invalidate(7, long = $$props.long);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("fullscreen" in $$props) $$invalidate(1, fullscreen = $$props.fullscreen);
    	};

    	$$self.$capture_state = () => ({
    		Map: Map$1,
    		Marker,
    		fly,
    		list,
    		lat,
    		long,
    		zoom,
    		fullscreen,
    		cinActive,
    		showPanel,
    		mapComponent,
    		onReady,
    		checkLinkType
    	});

    	$$self.$inject_state = $$props => {
    		if ("list" in $$props) $$invalidate(0, list = $$props.list);
    		if ("lat" in $$props) $$invalidate(6, lat = $$props.lat);
    		if ("long" in $$props) $$invalidate(7, long = $$props.long);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("fullscreen" in $$props) $$invalidate(1, fullscreen = $$props.fullscreen);
    		if ("cinActive" in $$props) $$invalidate(3, cinActive = $$props.cinActive);
    		if ("showPanel" in $$props) $$invalidate(4, showPanel = $$props.showPanel);
    		if ("mapComponent" in $$props) $$invalidate(2, mapComponent = $$props.mapComponent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*mapComponent, long, lat, zoom*/ 452) {
    			if (mapComponent) {
    				mapComponent.flyTo({ center: [long, lat], zoom });
    			}
    		}
    	};

    	return [
    		list,
    		fullscreen,
    		mapComponent,
    		cinActive,
    		showPanel,
    		onReady,
    		lat,
    		long,
    		zoom,
    		marker_show_binding,
    		marker_showncinema_binding,
    		map_binding
    	];
    }

    class Map_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			list: 0,
    			lat: 6,
    			long: 7,
    			zoom: 8,
    			fullscreen: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map_1",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*list*/ ctx[0] === undefined && !("list" in props)) {
    			console.warn("<Map> was created without expected prop 'list'");
    		}

    		if (/*lat*/ ctx[6] === undefined && !("lat" in props)) {
    			console.warn("<Map> was created without expected prop 'lat'");
    		}

    		if (/*long*/ ctx[7] === undefined && !("long" in props)) {
    			console.warn("<Map> was created without expected prop 'long'");
    		}

    		if (/*zoom*/ ctx[8] === undefined && !("zoom" in props)) {
    			console.warn("<Map> was created without expected prop 'zoom'");
    		}

    		if (/*fullscreen*/ ctx[1] === undefined && !("fullscreen" in props)) {
    			console.warn("<Map> was created without expected prop 'fullscreen'");
    		}
    	}

    	get list() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lat() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lat(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get long() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set long(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullscreen() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullscreen(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */
    const file$3 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (90:6) {#if fullscreen}
    function create_if_block_5(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*countries*/ ctx[10];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "All countries";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "all";
    			option.value = option.__value;
    			add_location(option, file$3, 95, 10, 2269);
    			attr_dev(select, "class", "svelte-reqee7");
    			if (/*selectedCountry*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[16].call(select));
    			add_location(select, file$3, 90, 8, 2102);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedCountry*/ ctx[2]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[16]),
    					listen_dev(
    						select,
    						"change",
    						function () {
    							if (is_function(/*filter*/ ctx[13](/*selectedCountry*/ ctx[2]))) /*filter*/ ctx[13](/*selectedCountry*/ ctx[2]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*countries*/ 1024) {
    				each_value_1 = /*countries*/ ctx[10];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*selectedCountry, countries*/ 1028) {
    				select_option(select, /*selectedCountry*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fly, { y: -100, duration: 500 }, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fly, { y: -100, duration: 500 }, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(90:6) {#if fullscreen}",
    		ctx
    	});

    	return block;
    }

    // (97:10) {#each countries as country}
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*country*/ ctx[25] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*country*/ ctx[25];
    			option.value = option.__value;
    			add_location(option, file$3, 97, 12, 2363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(97:10) {#each countries as country}",
    		ctx
    	});

    	return block;
    }

    // (107:6) <div slot="background" id="mapid" class="map">
    function create_background_slot(ctx) {
    	let div;
    	let mapy;
    	let current;

    	mapy = new Map_1({
    			props: {
    				lat: /*fullscreen*/ ctx[6]
    				? /*selectedCountry*/ ctx[2] === "all"
    					? 20
    					: /*CountryLat*/ ctx[3]
    				: /*curated*/ ctx[0][/*index*/ ctx[7]].lat,
    				long: /*fullscreen*/ ctx[6]
    				? /*selectedCountry*/ ctx[2] === "all"
    					? 100
    					: /*CountryLong*/ ctx[4]
    				: /*curated*/ ctx[0][/*index*/ ctx[7]].long,
    				zoom: /*fullscreen*/ ctx[6]
    				? /*selectedCountry*/ ctx[2] === "all"
    					? 3
    					: /*CountryZoom*/ ctx[5]
    				: /*curated*/ ctx[0][/*index*/ ctx[7]].zoom,
    				list: /*fullscreen*/ ctx[6]
    				? /*listFiltered*/ ctx[1]
    				: /*cinemaFilter*/ ctx[12](/*curated*/ ctx[0][/*index*/ ctx[7]].cinemas),
    				fullscreen: /*fullscreen*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(mapy.$$.fragment);
    			attr_dev(div, "slot", "background");
    			attr_dev(div, "id", "mapid");
    			attr_dev(div, "class", "map svelte-reqee7");
    			add_location(div, file$3, 106, 6, 2573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(mapy, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mapy_changes = {};

    			if (dirty & /*fullscreen, selectedCountry, CountryLat, curated, index*/ 205) mapy_changes.lat = /*fullscreen*/ ctx[6]
    			? /*selectedCountry*/ ctx[2] === "all"
    				? 20
    				: /*CountryLat*/ ctx[3]
    			: /*curated*/ ctx[0][/*index*/ ctx[7]].lat;

    			if (dirty & /*fullscreen, selectedCountry, CountryLong, curated, index*/ 213) mapy_changes.long = /*fullscreen*/ ctx[6]
    			? /*selectedCountry*/ ctx[2] === "all"
    				? 100
    				: /*CountryLong*/ ctx[4]
    			: /*curated*/ ctx[0][/*index*/ ctx[7]].long;

    			if (dirty & /*fullscreen, selectedCountry, CountryZoom, curated, index*/ 229) mapy_changes.zoom = /*fullscreen*/ ctx[6]
    			? /*selectedCountry*/ ctx[2] === "all"
    				? 3
    				: /*CountryZoom*/ ctx[5]
    			: /*curated*/ ctx[0][/*index*/ ctx[7]].zoom;

    			if (dirty & /*fullscreen, listFiltered, curated, index*/ 195) mapy_changes.list = /*fullscreen*/ ctx[6]
    			? /*listFiltered*/ ctx[1]
    			: /*cinemaFilter*/ ctx[12](/*curated*/ ctx[0][/*index*/ ctx[7]].cinemas);

    			if (dirty & /*fullscreen*/ 64) mapy_changes.fullscreen = /*fullscreen*/ ctx[6];
    			mapy.$set(mapy_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mapy.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mapy.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(mapy);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot.name,
    		type: "slot",
    		source: "(107:6) <div slot=\\\"background\\\" id=\\\"mapid\\\" class=\\\"map\\\">",
    		ctx
    	});

    	return block;
    }

    // (150:12) {#if i !== 0}
    function create_if_block$2(ctx) {
    	let section;
    	let div;
    	let h2;
    	let t0_value = /*d*/ ctx[22].slideTitle + "";
    	let t0;
    	let t1;
    	let p;
    	let raw_value = /*d*/ ctx[22].text + "";
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let hr;
    	let if_block0 = /*d*/ ctx[22].squarespacelink !== "" && create_if_block_4(ctx);
    	let if_block1 = /*d*/ ctx[22].imageLink !== "" && create_if_block_3(ctx);
    	let if_block2 = /*d*/ ctx[22].youtubeEmbedLink !== "" && create_if_block_2$1(ctx);
    	let if_block3 = /*d*/ ctx[22].soundcloudiframe !== "" && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			if (if_block3) if_block3.c();
    			t6 = space();
    			hr = element("hr");
    			add_location(h2, file$3, 152, 18, 3902);
    			add_location(p, file$3, 153, 18, 3944);
    			attr_dev(div, "class", "content-container svelte-reqee7");
    			add_location(div, file$3, 151, 16, 3852);
    			attr_dev(hr, "class", "slides svelte-reqee7");
    			add_location(hr, file$3, 183, 16, 4927);
    			attr_dev(section, "class", "svelte-reqee7");
    			add_location(section, file$3, 150, 14, 3826);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			p.innerHTML = raw_value;
    			append_dev(div, t2);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(section, t3);
    			if (if_block1) if_block1.m(section, null);
    			append_dev(section, t4);
    			if (if_block2) if_block2.m(section, null);
    			append_dev(section, t5);
    			if (if_block3) if_block3.m(section, null);
    			append_dev(section, t6);
    			append_dev(section, hr);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*curated*/ 1 && t0_value !== (t0_value = /*d*/ ctx[22].slideTitle + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*curated*/ 1 && raw_value !== (raw_value = /*d*/ ctx[22].text + "")) p.innerHTML = raw_value;
    			if (/*d*/ ctx[22].squarespacelink !== "") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*d*/ ctx[22].imageLink !== "") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(section, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*d*/ ctx[22].youtubeEmbedLink !== "") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					if_block2.m(section, t5);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*d*/ ctx[22].soundcloudiframe !== "") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1$1(ctx);
    					if_block3.c();
    					if_block3.m(section, t6);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(150:12) {#if i !== 0}",
    		ctx
    	});

    	return block;
    }

    // (157:18) {#if d.squarespacelink !== ""}
    function create_if_block_4(ctx) {
    	let a;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text("Read full article.");
    			attr_dev(a, "href", a_href_value = /*d*/ ctx[22].squareSpaceLink);
    			add_location(a, file$3, 157, 20, 4075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*curated*/ 1 && a_href_value !== (a_href_value = /*d*/ ctx[22].squareSpaceLink)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(157:18) {#if d.squarespacelink !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (162:16) {#if d.imageLink !== ""}
    function create_if_block_3(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*d*/ ctx[22].imageLink)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-reqee7");
    			add_location(img, file$3, 163, 20, 4296);
    			attr_dev(div, "class", "img-container center-cropped svelte-reqee7");
    			add_location(div, file$3, 162, 18, 4233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*curated*/ 1 && img.src !== (img_src_value = /*d*/ ctx[22].imageLink)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(162:16) {#if d.imageLink !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (168:16) {#if d.youtubeEmbedLink !== ""}
    function create_if_block_2$1(ctx) {
    	let div;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			iframe = element("iframe");
    			if (iframe.src !== (iframe_src_value = /*d*/ ctx[22].youtubeEmbedLink)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "class", "video svelte-reqee7");
    			add_location(iframe, file$3, 170, 20, 4557);
    			attr_dev(div, "class", "img-container");
    			add_location(div, file$3, 168, 18, 4443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, iframe);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*curated*/ 1 && iframe.src !== (iframe_src_value = /*d*/ ctx[22].youtubeEmbedLink)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(168:16) {#if d.youtubeEmbedLink !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (180:16) {#if d.soundcloudiframe !== ""}
    function create_if_block_1$1(ctx) {
    	let html_tag;
    	let raw_value = /*d*/ ctx[22].soundcloudIframe + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*curated*/ 1 && raw_value !== (raw_value = /*d*/ ctx[22].soundcloudIframe + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(180:16) {#if d.soundcloudiframe !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (149:10) {#each curated as d, i}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*i*/ ctx[24] !== 0 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[24] !== 0) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(149:10) {#each curated as d, i}",
    		ctx
    	});

    	return block;
    }

    // (133:6) <div slot="foreground">
    function create_foreground_slot(ctx) {
    	let div0;
    	let div4;
    	let div2;
    	let section;
    	let raw_value = /*curated*/ ctx[0][0].intro + "";
    	let t0;
    	let div1;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2;
    	let hr;
    	let t3;
    	let t4;
    	let div3;
    	let p0;
    	let t5;
    	let br0;
    	let t6;
    	let t7;
    	let button;
    	let t9;
    	let br1;
    	let t10;
    	let p1;
    	let t11;
    	let a;
    	let div4_class_value;
    	let each_value = /*curated*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			section = element("section");
    			t0 = space();
    			div1 = element("div");
    			img = element("img");
    			t1 = text("\n              Scroll Down");
    			t2 = space();
    			hr = element("hr");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div3 = element("div");
    			p0 = element("p");
    			t5 = text("Don't see your favorite cinema here? ");
    			br0 = element("br");
    			t6 = text("We'd like to hear from\n              you!");
    			t7 = space();
    			button = element("button");
    			button.textContent = "Suggest a space";
    			t9 = space();
    			br1 = element("br");
    			t10 = space();
    			p1 = element("p");
    			t11 = text("Designed and developed by Laura Aragó, Spe Chen, Víctor Garcia and Santiago Salcido in the \n            ");
    			a = element("a");
    			a.textContent = "Master’s program in Visual Tools to Empower Citizens";
    			attr_dev(section, "class", "svelte-reqee7");
    			add_location(section, file$3, 135, 12, 3407);
    			if (img.src !== (img_src_value = "../img/arrow_down.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "scrollDown");
    			attr_dev(img, "width", "48");
    			attr_dev(img, "height", "48");
    			add_location(img, file$3, 137, 14, 3502);
    			attr_dev(div1, "class", "scrollDown");
    			add_location(div1, file$3, 136, 12, 3463);
    			attr_dev(hr, "class", "intro svelte-reqee7");
    			add_location(hr, file$3, 145, 12, 3713);
    			attr_dev(div2, "class", "content-containerIntro svelte-reqee7");
    			add_location(div2, file$3, 134, 10, 3358);
    			add_location(br0, file$3, 189, 51, 5118);
    			add_location(p0, file$3, 188, 12, 5063);
    			attr_dev(button, "onclick", "window.open('https://forms.gle/bdWFVUhQ4oYcEgZ77')");
    			attr_dev(button, "class", "svelte-reqee7");
    			add_location(button, file$3, 192, 12, 5195);
    			attr_dev(div3, "class", "button-container svelte-reqee7");
    			add_location(div3, file$3, 187, 10, 5020);
    			add_location(br1, file$3, 195, 10, 5331);
    			attr_dev(a, "href", "http://www.mastervisualtoolsudg.com/");
    			attr_dev(a, "target", "blank");
    			add_location(a, file$3, 198, 12, 5483);
    			attr_dev(p1, "class", "footer svelte-reqee7");
    			add_location(p1, file$3, 196, 10, 5348);
    			attr_dev(div4, "class", div4_class_value = "panel-left " + (/*fullscreen*/ ctx[6] ? "hide" : "show") + " svelte-reqee7");
    			add_location(div4, file$3, 133, 8, 3292);
    			attr_dev(div0, "slot", "foreground");
    			add_location(div0, file$3, 132, 6, 3260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div4);
    			append_dev(div4, div2);
    			append_dev(div2, section);
    			section.innerHTML = raw_value;
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			append_dev(div2, t2);
    			append_dev(div2, hr);
    			append_dev(div4, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p0);
    			append_dev(p0, t5);
    			append_dev(p0, br0);
    			append_dev(p0, t6);
    			append_dev(div3, t7);
    			append_dev(div3, button);
    			append_dev(div4, t9);
    			append_dev(div4, br1);
    			append_dev(div4, t10);
    			append_dev(div4, p1);
    			append_dev(p1, t11);
    			append_dev(p1, a);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*curated*/ 1 && raw_value !== (raw_value = /*curated*/ ctx[0][0].intro + "")) section.innerHTML = raw_value;
    			if (dirty & /*curated*/ 1) {
    				each_value = /*curated*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*fullscreen*/ 64 && div4_class_value !== (div4_class_value = "panel-left " + (/*fullscreen*/ ctx[6] ? "hide" : "show") + " svelte-reqee7")) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot.name,
    		type: "slot",
    		source: "(133:6) <div slot=\\\"foreground\\\">",
    		ctx
    	});

    	return block;
    }

    // (106:4) <Scroller top={0} bottom={0.8} bind:index bind:offset bind:progress>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(106:4) <Scroller top={0} bottom={0.8} bind:index bind:offset bind:progress>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let div3;
    	let div1;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let a_href_value;
    	let t1;
    	let button;

    	let t2_value = (/*fullscreen*/ ctx[6]
    	? "Back to curated overview"
    	: "Explore map") + "";

    	let t2;
    	let t3;
    	let div2;
    	let t4;
    	let scroller;
    	let updating_index;
    	let updating_offset;
    	let updating_progress;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*fullscreen*/ ctx[6] && create_if_block_5(ctx);

    	function scroller_index_binding(value) {
    		/*scroller_index_binding*/ ctx[17](value);
    	}

    	function scroller_offset_binding(value) {
    		/*scroller_offset_binding*/ ctx[18](value);
    	}

    	function scroller_progress_binding(value) {
    		/*scroller_progress_binding*/ ctx[19](value);
    	}

    	let scroller_props = {
    		top: 0,
    		bottom: 0.8,
    		$$slots: {
    			default: [create_default_slot$1],
    			foreground: [create_foreground_slot],
    			background: [create_background_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*index*/ ctx[7] !== void 0) {
    		scroller_props.index = /*index*/ ctx[7];
    	}

    	if (/*offset*/ ctx[8] !== void 0) {
    		scroller_props.offset = /*offset*/ ctx[8];
    	}

    	if (/*progress*/ ctx[9] !== void 0) {
    		scroller_props.progress = /*progress*/ ctx[9];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, "index", scroller_index_binding));
    	binding_callbacks.push(() => bind(scroller, "offset", scroller_offset_binding));
    	binding_callbacks.push(() => bind(scroller, "progress", scroller_progress_binding));

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = text(" Back to project home");
    			t1 = space();
    			button = element("button");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t4 = space();
    			create_component(scroller.$$.fragment);
    			if (img.src !== (img_src_value = /*home*/ ctx[11])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "home");
    			attr_dev(img, "width", "24px");
    			attr_dev(img, "height", "24px");
    			set_style(img, "margin-right", "10px");
    			add_location(img, file$3, 75, 11, 1688);
    			attr_dev(a, "href", a_href_value = /*curated*/ ctx[0][0].projectHomeLink);
    			attr_dev(a, "class", "svelte-reqee7");
    			add_location(a, file$3, 74, 8, 1640);
    			attr_dev(div0, "class", "homeLink svelte-reqee7");
    			add_location(div0, file$3, 73, 6, 1609);
    			attr_dev(button, "class", "svelte-reqee7");
    			add_location(button, file$3, 83, 6, 1885);
    			attr_dev(div1, "class", "topbar svelte-reqee7");
    			add_location(div1, file$3, 72, 4, 1582);
    			attr_dev(div2, "class", "nav svelte-reqee7");
    			add_location(div2, file$3, 88, 4, 2053);
    			attr_dev(div3, "class", "content svelte-reqee7");
    			add_location(div3, file$3, 71, 2, 1556);
    			attr_dev(main, "class", "svelte-reqee7");
    			add_location(main, file$3, 70, 0, 1547);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(a, t0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			append_dev(button, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div3, t4);
    			mount_component(scroller, div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggle*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*curated*/ 1 && a_href_value !== (a_href_value = /*curated*/ ctx[0][0].projectHomeLink)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*fullscreen*/ 64) && t2_value !== (t2_value = (/*fullscreen*/ ctx[6]
    			? "Back to curated overview"
    			: "Explore map") + "")) set_data_dev(t2, t2_value);

    			if (/*fullscreen*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*fullscreen*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const scroller_changes = {};

    			if (dirty & /*$$scope, fullscreen, curated, selectedCountry, CountryLat, index, CountryLong, CountryZoom, listFiltered*/ 268435711) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_index && dirty & /*index*/ 128) {
    				updating_index = true;
    				scroller_changes.index = /*index*/ ctx[7];
    				add_flush_callback(() => updating_index = false);
    			}

    			if (!updating_offset && dirty & /*offset*/ 256) {
    				updating_offset = true;
    				scroller_changes.offset = /*offset*/ ctx[8];
    				add_flush_callback(() => updating_offset = false);
    			}

    			if (!updating_progress && dirty & /*progress*/ 512) {
    				updating_progress = true;
    				scroller_changes.progress = /*progress*/ ctx[9];
    				add_flush_callback(() => updating_progress = false);
    			}

    			scroller.$set(scroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(scroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(scroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_component(scroller);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { curated } = $$props;
    	let { list } = $$props;

    	list.map(d => {
    		d.visible = true;
    		return d;
    	});

    	let listFiltered = list;
    	let countries = [...new Set(list.map(d => d.country))];
    	let selectedCountry;
    	let CountryLat = 20, CountryLong = 100, CountryZoom = 3;
    	let fullscreen = false;
    	let selectedMarkers;
    	let activeMarkers = list;
    	let index = 0, offset, progress;
    	let home = "/img/home.png";

    	function cinemaFilter(d) {
    		selectedMarkers = d.split(",");

    		activeMarkers = list.map(d => {
    			if (selectedMarkers.includes(d.cinemaId)) {
    				d.visible = true;
    			} else {
    				d.visible = false;
    			}

    			return d;
    		});

    		return activeMarkers;
    	}

    	function filter(d) {
    		$$invalidate(2, selectedCountry = d);

    		$$invalidate(1, listFiltered = selectedCountry === "all"
    		? list.map(d => {
    				d.visible = true;
    				return d;
    			})
    		: list.map(d => {
    				if (d.country === selectedCountry) {
    					$$invalidate(3, CountryLat = d.CountryLat);
    					$$invalidate(4, CountryLong = d.CountryLong);
    					$$invalidate(5, CountryZoom = d.CountryZoom);
    					d.visible = true;
    				} else {
    					d.visible = false;
    				}

    				return d;
    			}));
    	}

    	function toggle() {
    		$$invalidate(6, fullscreen = fullscreen ? false : true);

    		if (fullscreen === true) {
    			list.map(d => {
    				d.visible = true;
    				return d;
    			});
    		}
    	}

    	const writable_props = ["curated", "list"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selectedCountry = select_value(this);
    		$$invalidate(2, selectedCountry);
    		$$invalidate(10, countries);
    	}

    	function scroller_index_binding(value) {
    		index = value;
    		$$invalidate(7, index);
    	}

    	function scroller_offset_binding(value) {
    		offset = value;
    		$$invalidate(8, offset);
    	}

    	function scroller_progress_binding(value) {
    		progress = value;
    		$$invalidate(9, progress);
    	}

    	$$self.$$set = $$props => {
    		if ("curated" in $$props) $$invalidate(0, curated = $$props.curated);
    		if ("list" in $$props) $$invalidate(15, list = $$props.list);
    	};

    	$$self.$capture_state = () => ({
    		Scroller,
    		Mapy: Map_1,
    		fly,
    		curated,
    		list,
    		listFiltered,
    		countries,
    		selectedCountry,
    		CountryLat,
    		CountryLong,
    		CountryZoom,
    		fullscreen,
    		selectedMarkers,
    		activeMarkers,
    		index,
    		offset,
    		progress,
    		home,
    		cinemaFilter,
    		filter,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("curated" in $$props) $$invalidate(0, curated = $$props.curated);
    		if ("list" in $$props) $$invalidate(15, list = $$props.list);
    		if ("listFiltered" in $$props) $$invalidate(1, listFiltered = $$props.listFiltered);
    		if ("countries" in $$props) $$invalidate(10, countries = $$props.countries);
    		if ("selectedCountry" in $$props) $$invalidate(2, selectedCountry = $$props.selectedCountry);
    		if ("CountryLat" in $$props) $$invalidate(3, CountryLat = $$props.CountryLat);
    		if ("CountryLong" in $$props) $$invalidate(4, CountryLong = $$props.CountryLong);
    		if ("CountryZoom" in $$props) $$invalidate(5, CountryZoom = $$props.CountryZoom);
    		if ("fullscreen" in $$props) $$invalidate(6, fullscreen = $$props.fullscreen);
    		if ("selectedMarkers" in $$props) selectedMarkers = $$props.selectedMarkers;
    		if ("activeMarkers" in $$props) activeMarkers = $$props.activeMarkers;
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    		if ("offset" in $$props) $$invalidate(8, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(9, progress = $$props.progress);
    		if ("home" in $$props) $$invalidate(11, home = $$props.home);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		curated,
    		listFiltered,
    		selectedCountry,
    		CountryLat,
    		CountryLong,
    		CountryZoom,
    		fullscreen,
    		index,
    		offset,
    		progress,
    		countries,
    		home,
    		cinemaFilter,
    		filter,
    		toggle,
    		list,
    		select_change_handler,
    		scroller_index_binding,
    		scroller_offset_binding,
    		scroller_progress_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { curated: 0, list: 15 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*curated*/ ctx[0] === undefined && !("curated" in props)) {
    			console.warn("<App> was created without expected prop 'curated'");
    		}

    		if (/*list*/ ctx[15] === undefined && !("list" in props)) {
    			console.warn("<App> was created without expected prop 'list'");
    		}
    	}

    	get curated() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set curated(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsvFormat(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsvFormat(",");

    var csvParse = csv.parse;

    function responseText(response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      return response.text();
    }

    function text$1(input, init) {
      return fetch(input, init).then(responseText);
    }

    function dsvParse(parse) {
      return function(input, init, row) {
        if (arguments.length === 2 && typeof init === "function") row = init, init = undefined;
        return text$1(input, init).then(function(response) {
          return parse(response, row);
        });
      };
    }

    var csv$1 = dsvParse(csvParse);

    /*
    	This object has the sheet 'id' and the tab id 'gid'. That's where you data lives

    	If you look at a spreadsheet url:

    	https://docs.google.com/spreadsheets/d/1W8XUcp44uGqrouqCoRmh-GPWsRXhveti0jZYOu5FQ1M/edit#gid=1900255899
                                              |____________________________________________|         |_________|
                                                                    |                                     |
    														       'id'                                 'gid'
    */
    const sheets = [
        {
    	//   "id": "1W8XUcp44uGqrouqCoRmh-GPWsRXhveti0jZYOu5FQ1M", ---> old sheets
    	  "id": "14psN2GYNeN5898bbPpeg0PZ5fdCjSm3_M7IqUxbbC0Y",
          "gid": "0"
        },
        {
          "id": "14psN2GYNeN5898bbPpeg0PZ5fdCjSm3_M7IqUxbbC0Y",
          "gid": "854640559"
        }
    ];

    /*
    	This async function gets a spreadsheet id and the tab id.

    	The function uses an object *destructuring pattern*, so ...
    		* function({par1, par2})
    	... instead of
    		* function(obj)
    	
    	This makes it more concise and easier to read, we don't need to do
    	obj.par1 and obj.par2 inside the function; but par1 and par2 directly,
    	or in this case id and gid.

    	It uses d3-fetch's csv parser for convenience —so it loads and parses in one call.
    	The parse returns an array of objects with the table headers as properties.

    	header1 | header2 | header3               [
    	---------------------------     =====>      { "header1": 10, "header2": 12, "header3": 13 },
             10 |      12 |      13                 { "header1": 24, "header2": 18, "header3": 0 },
    		 24 |      18 |       0                ]
    	
    */
    const fetchGDocs = async({ id, gid }) => {
    	const url = `https://docs.google.com/spreadsheets/u/1/d/${id}/export?format=csv&id=${id}&gid=${gid}`;
    	const response = await csv$1(url);	
    	return response;
    };

    /*
    	This async function is what gets the ball rolling. It fetches the data and passes it to the newly created App object
    	(App as in App.svelte)
    	
    	The first line is a bit complicated, bit by bit, in reverse, it calls the fetchGDocs function ...
    		* fetchGDocs(d)
    		
    	... for every item in sheets —using map ...
    		* sheets.map(d => fetchGDocs(d))

    	... inside a Promise.all() method, which takes an iterable (here a map) of promises (fetchDocs is an async function)
    	as an input, and resolve when all of the input's promises have resolved, or if the input iterable contains no promises ...
    		* Promise.all(sheets.map(d => fetchGDocs(d)))

    	... and returns an array of the results of the input promises.
    	Here we have *destructured* the array [curated, list] we know Promise.all() resolves to so we can use curated and list later on.
    		* const [curated, list] = await Promise.all(sheets.map(d => fetchGDocs(d)));

    	Read more here:
    	* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
    	* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    	* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    */
    const data = async () => {
    	const [curated, list] = await Promise.all(sheets.map(d => fetchGDocs(d)));
    	
    	new App({
    		target: document.body,
    		props: {
    			curated: curated,
    			list: list
    		}
    	});
    };

    /*
    	Call the function data to ... get the ball rolling (yes, I said it twice)
    */
    data();

    var app$1 = app;

    return app$1;

}());
//# sourceMappingURL=bundle.js.map
