(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.SermonSanitizer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const ALLOWED_TAGS = new Set([
        'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
        'h4', 'h5', 'h6', 'hr', 'i', 'li', 'ol', 'p', 'pre', 's', 'span',
        'strike', 'strong', 'sub', 'sup', 'u', 'ul'
    ]);
    const DROP_TAGS = new Set([
        'applet', 'base', 'canvas', 'embed', 'form', 'frame', 'frameset',
        'iframe', 'input', 'link', 'math', 'meta', 'noscript', 'object',
        'script', 'select', 'style', 'svg', 'textarea', 'video', 'audio'
    ]);
    const ALLOWED_CLASS_PREFIXES = [
        'ql-align-', 'ql-direction-', 'ql-font-', 'ql-indent-', 'ql-size-',
        'ql-syntax'
    ];

    function isSafeUrl(value) {
        const url = String(value || '').trim().replace(/[\u0000-\u001f\u007f\s]+/g, '');
        const lower = url.toLowerCase();
        if (!url) return false;
        if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
            return false;
        }
        if (url.startsWith('#') || url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return true;
        }
        try {
            const parsed = new URL(url, 'https://yeshua-love.org');
            return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
        } catch (error) {
            return false;
        }
    }

    function sanitizeStyle(value) {
        const safe = [];
        const unsafePattern = /url\s*\(|expression\s*\(|javascript:|vbscript:|data:|@import|-moz-binding|behavior\s*:/i;
        const colorPattern = /^(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|hsla?\([\d\s,.%]+\)|[a-z]+)$/i;

        String(value || '').split(';').forEach((declaration) => {
            const [rawProperty, ...rawValueParts] = declaration.split(':');
            if (!rawProperty || rawValueParts.length === 0) return;

            const property = rawProperty.trim().toLowerCase();
            const rawValue = rawValueParts.join(':').trim();
            const valueLower = rawValue.toLowerCase();

            if (!rawValue || rawValue.length > 120 || unsafePattern.test(valueLower)) return;

            if ((property === 'color' || property === 'background-color') && colorPattern.test(rawValue)) {
                safe.push(`${property}: ${rawValue}`);
            } else if (property === 'text-align' && /^(left|right|center|justify)$/.test(valueLower)) {
                safe.push(`${property}: ${valueLower}`);
            }
        });

        return safe.join('; ');
    }

    function sanitizeClass(value) {
        return String(value || '')
            .split(/\s+/)
            .filter((className) => ALLOWED_CLASS_PREFIXES.some((prefix) => className === prefix || className.startsWith(prefix)))
            .join(' ');
    }

    function unwrapElement(element) {
        const parent = element.parentNode;
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
    }

    function sanitizeElement(element) {
        const tag = element.tagName.toLowerCase();
        const nextAttributes = [];

        Array.from(element.attributes).forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value;

            if (name.startsWith('on')) return;

            if (name === 'class') {
                const className = sanitizeClass(value);
                if (className) nextAttributes.push(['class', className]);
                return;
            }

            if (name === 'style') {
                const style = sanitizeStyle(value);
                if (style) nextAttributes.push(['style', style]);
                return;
            }

            if (tag === 'a' && name === 'href' && isSafeUrl(value)) {
                nextAttributes.push(['href', value.trim()]);
                return;
            }

            if (tag === 'a' && name === 'title') {
                nextAttributes.push(['title', value.slice(0, 200)]);
                return;
            }

            if (tag === 'a' && name === 'target' && value === '_blank') {
                nextAttributes.push(['target', '_blank']);
                nextAttributes.push(['rel', 'noopener noreferrer']);
            }
        });

        Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
        nextAttributes.forEach(([name, value]) => element.setAttribute(name, value));
    }

    function sanitizeNode(node) {
        Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === 3) return;

            if (child.nodeType !== 1) {
                child.remove();
                return;
            }

            const tag = child.tagName.toLowerCase();
            if (DROP_TAGS.has(tag)) {
                child.remove();
                return;
            }

            if (!ALLOWED_TAGS.has(tag)) {
                const moved = Array.from(child.childNodes);
                unwrapElement(child);
                moved.forEach(sanitizeNode);
                return;
            }

            sanitizeElement(child);
            sanitizeNode(child);
        });
    }

    function fallbackSanitize(html) {
        return String(html || '')
            .replace(/<\s*(script|style|iframe|object|embed|svg|math|form|textarea|select|video|audio|canvas)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
            .replace(/<\s*\/?\s*(base|frame|frameset|input|link|meta|noscript|option)[^>]*>/gi, '')
            .replace(/\s+on[a-z0-9_-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
            .replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
            .replace(/\s+href\s*=\s*(["'])\s*(javascript:|data:|vbscript:)[\s\S]*?\1/gi, '');
    }

    function sanitizeSermonHtml(html) {
        const source = String(html || '');
        if (!source) return '';

        if (typeof document === 'undefined') {
            return fallbackSanitize(source);
        }

        const template = document.createElement('template');
        template.innerHTML = source;
        sanitizeNode(template.content);
        return template.innerHTML;
    }

    function sanitizeSermonPages(pages) {
        return Array.isArray(pages) ? pages.map(sanitizeSermonHtml) : [];
    }

    return {
        sanitizeSermonHtml,
        sanitizeSermonPages
    };
});
