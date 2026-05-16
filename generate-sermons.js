#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const path = require('path');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'yeshua-love';
const API_KEY = process.env.FIREBASE_WEB_API_KEY || 'AIzaSyAO5bbK1A7y0qJdBgdscUZZ4jn84Dh6W_4';
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://yeshua-love.org').replace(/\/$/, '');
const COLLECTION = process.env.SERMON_COLLECTION || 'sermons';

const SERVICE_NAMES = {
    'sunday-morning': '주일오전예배',
    'sunday-afternoon': '주일오후예배',
    wednesday: '수요예배',
    friday: '금요예배',
    'sunday-school': '주일학교'
};

const SERVICE_ORDER = [
    'sunday-morning',
    'sunday-afternoon',
    'wednesday',
    'friday',
    'sunday-school'
];

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    let parsed;
                    try {
                        parsed = JSON.parse(body);
                    } catch (error) {
                        reject(new Error(`Firestore returned invalid JSON: ${body.slice(0, 200)}`));
                        return;
                    }

                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        const message = parsed.error?.message || body.slice(0, 200);
                        reject(new Error(`Firestore request failed (${res.statusCode}): ${message}`));
                        return;
                    }

                    resolve(parsed);
                });
            })
            .on('error', reject);
    });
}

function parseFirestoreValue(value) {
    if (!value) return null;
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.integerValue !== undefined) return Number(value.integerValue);
    if (value.doubleValue !== undefined) return Number(value.doubleValue);
    if (value.booleanValue !== undefined) return value.booleanValue;
    if (value.timestampValue !== undefined) return value.timestampValue;
    if (value.nullValue !== undefined) return null;
    if (value.arrayValue !== undefined) {
        return (value.arrayValue.values || []).map(parseFirestoreValue);
    }
    if (value.mapValue !== undefined) {
        const object = {};
        Object.entries(value.mapValue.fields || {}).forEach(([key, nestedValue]) => {
            object[key] = parseFirestoreValue(nestedValue);
        });
        return object;
    }
    return null;
}

async function getAllSermons() {
    const sermons = [];
    let pageToken = '';

    do {
        const params = new URLSearchParams({
            key: API_KEY,
            pageSize: '300'
        });
        if (pageToken) params.set('pageToken', pageToken);

        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?${params}`;
        const response = await fetchJson(url);

        for (const document of response.documents || []) {
            const fields = document.fields || {};
            sermons.push({
                id: document.name.split('/').pop(),
                date: parseFirestoreValue(fields.date) || '',
                title: parseFirestoreValue(fields.title) || '제목 없음',
                service: parseFirestoreValue(fields.service) || 'sermon',
                category: parseFirestoreValue(fields.category) || '',
                content: normalizeContent(parseFirestoreValue(fields.content)),
                updatedAt: parseFirestoreValue(fields.updatedAt) || parseFirestoreValue(fields.timestamp) || ''
            });
        }

        pageToken = response.nextPageToken || '';
    } while (pageToken);

    sermons.sort(compareSermons);
    return sermons;
}

function normalizeContent(content) {
    if (Array.isArray(content)) {
        return content.map((page) => String(page || '')).filter((page) => stripHtml(page).trim());
    }
    if (typeof content === 'string' && content.trim()) return [content];
    return [];
}

function compareSermons(a, b) {
    const byDate = dateToTime(b.date) - dateToTime(a.date);
    if (byDate !== 0) return byDate;
    return String(a.title).localeCompare(String(b.title), 'ko');
}

function dateToTime(date) {
    const iso = toIsoDate(date);
    if (!iso) return 0;
    const time = new Date(`${iso}T00:00:00Z`).getTime();
    return Number.isNaN(time) ? 0 : time;
}

function toIsoDate(date) {
    const match = String(date || '').match(/(\d{4})[.\-/년\s]*(\d{1,2})[.\-/월\s]*(\d{1,2})/);
    if (!match) return '';
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function dateForFilename(date) {
    return toIsoDate(date).replaceAll('-', '') || 'undated';
}

function sanitizeFilePart(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9가-힣_-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80) || 'sermon';
}

function getSermonFilename(sermon) {
    const date = dateForFilename(sermon.date);
    const service = sanitizeFilePart(sermon.service);
    const id = sanitizeFilePart(sermon.id).slice(0, 16);
    return `${date}-${service}-${id}.html`;
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function escapeXml(value) {
    return escapeHtml(value);
}

function stripHtml(value) {
    return String(value || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function truncate(value, length) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= length) return text;
    return `${text.slice(0, length - 1).trim()}…`;
}

function getServiceName(service) {
    return SERVICE_NAMES[service] || service || '설교';
}

function getDescription(sermon) {
    const serviceName = getServiceName(sermon.service);
    const bodyText = stripHtml(sermon.content.join(' '));
    return truncate(`${sermon.date} ${serviceName} 말씀: ${sermon.title}. ${bodyText}`, 155);
}

function getArticleText(sermon) {
    return stripHtml(sermon.content.join(' '));
}

function getGroupedSermons(sermons) {
    const grouped = {};
    for (const sermon of sermons) {
        if (!grouped[sermon.service]) grouped[sermon.service] = [];
        grouped[sermon.service].push(sermon);
    }
    return grouped;
}

function generateSermonHTML(sermon, allSermons) {
    const serviceName = getServiceName(sermon.service);
    const filename = getSermonFilename(sermon);
    const canonicalUrl = `${SITE_URL}/sermons/${filename}`;
    const description = getDescription(sermon);
    const articleText = getArticleText(sermon);
    const isoDate = toIsoDate(sermon.date);
    const sameServiceSermons = allSermons.filter((item) => item.service === sermon.service);
    const currentIndex = sameServiceSermons.findIndex((item) => item.id === sermon.id);
    const newerSermon = currentIndex > 0 ? sameServiceSermons[currentIndex - 1] : null;
    const olderSermon = currentIndex >= 0 && currentIndex < sameServiceSermons.length - 1
        ? sameServiceSermons[currentIndex + 1]
        : null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: sermon.title,
        datePublished: isoDate || sermon.date,
        dateModified: sermon.updatedAt || isoDate || sermon.date,
        articleSection: serviceName,
        keywords: [serviceName, sermon.category, sermon.title].filter(Boolean).join(', '),
        articleBody: truncate(articleText, 5000),
        publisher: {
            '@type': 'Organization',
            name: '예슈아 사랑교회',
            url: SITE_URL
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl
        },
        description
    };

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(sermon.title)} | ${escapeHtml(serviceName)} ${escapeHtml(sermon.date)} | 예슈아 사랑교회</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
    <meta property="og:title" content="${escapeHtml(sermon.title)} | 예슈아 사랑교회">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${SITE_URL}/og-image.png">
    <meta property="og:site_name" content="예슈아 사랑교회">
    <meta property="og:locale" content="ko_KR">
    <meta property="article:published_time" content="${escapeHtml(isoDate || sermon.date)}">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2).replace(/<\/script/gi, '<\\/script')}</script>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Malgun Gothic", "Apple SD Gothic Neo", system-ui, sans-serif;
            color: #23272f;
            background: #f7f4ee;
            line-height: 1.8;
        }
        .site-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px 24px;
            background: #1f3042;
            color: #fff;
        }
        .site-header a { color: #f5d77b; text-decoration: none; font-weight: 700; }
        .site-header strong { font-size: 1.05rem; }
        .breadcrumb {
            padding: 12px 24px;
            background: #fff;
            border-bottom: 1px solid #e3ded2;
            color: #69717d;
            font-size: 0.92rem;
        }
        .breadcrumb a { color: #2c6b78; text-decoration: none; }
        main {
            width: min(860px, calc(100% - 32px));
            margin: 32px auto 56px;
        }
        .sermon-header,
        .sermon-content,
        .sermon-nav {
            background: #fff;
            border: 1px solid #e3ded2;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(20, 24, 32, 0.06);
        }
        .sermon-header {
            padding: 32px;
            border-top: 5px solid #2c9aa0;
        }
        .service-badge {
            display: inline-block;
            margin-bottom: 14px;
            padding: 4px 12px;
            border-radius: 999px;
            background: #e6f3f3;
            color: #17666b;
            font-weight: 700;
            font-size: 0.86rem;
        }
        h1 {
            margin: 0 0 12px;
            line-height: 1.35;
            color: #17202b;
            font-size: clamp(1.7rem, 4vw, 2.45rem);
        }
        .meta { color: #687382; font-size: 0.98rem; }
        .category {
            display: inline-block;
            margin-top: 10px;
            color: #6b4e08;
            background: #fff3c4;
            border-radius: 999px;
            padding: 2px 10px;
            font-size: 0.86rem;
        }
        .sermon-content {
            margin-top: 22px;
            padding: 34px;
            font-size: 1.05rem;
        }
        .sermon-content h1,
        .sermon-content h2,
        .sermon-content h3 { color: #17202b; line-height: 1.45; }
        .sermon-content p { margin: 0 0 1em; }
        .sermon-content blockquote {
            margin: 1.2em 0;
            padding-left: 18px;
            border-left: 4px solid #2c9aa0;
            color: #4e5967;
        }
        .page-break {
            border: 0;
            border-top: 1px dashed #c9c1b2;
            margin: 32px 0;
        }
        .sermon-nav {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 22px;
            padding: 16px;
        }
        .nav-link,
        .back-link {
            display: block;
            padding: 12px 14px;
            color: #1d5d67;
            text-decoration: none;
            border-radius: 8px;
        }
        .nav-link:hover,
        .back-link:hover { background: #eef7f7; }
        .nav-link.next { text-align: right; }
        .back-link {
            margin-top: 20px;
            text-align: center;
            background: #1f3042;
            color: #f5d77b;
            font-weight: 700;
        }
        footer {
            padding: 28px 16px;
            text-align: center;
            color: #7a828d;
            font-size: 0.9rem;
        }
        footer a { color: #2c6b78; }
        @media (max-width: 640px) {
            .site-header { align-items: flex-start; flex-direction: column; }
            main { width: min(100% - 20px, 860px); margin-top: 20px; }
            .sermon-header,
            .sermon-content { padding: 22px; }
            .sermon-nav { grid-template-columns: 1fr; }
            .nav-link.next { text-align: left; }
        }
    </style>
</head>
<body>
<header class="site-header">
    <a href="../index.html">예슈아 사랑교회</a>
    <strong>설교 말씀</strong>
    <a href="../sermon.html">인터랙티브 보기</a>
</header>
<nav class="breadcrumb">
    <a href="../index.html">홈</a> &rsaquo;
    <a href="../sermon.html">설교 말씀</a> &rsaquo;
    ${escapeHtml(serviceName)} &rsaquo;
    ${escapeHtml(sermon.title)}
</nav>
<main>
    <section class="sermon-header">
        <span class="service-badge">${escapeHtml(serviceName)}</span>
        <h1>${escapeHtml(sermon.title)}</h1>
        <div class="meta">${escapeHtml(sermon.date)} | ${escapeHtml(serviceName)}</div>
        ${sermon.category ? `<div class="category">${escapeHtml(sermon.category)}</div>` : ''}
    </section>
    <article class="sermon-content">
        ${sermon.content.join('\n<hr class="page-break">\n')}
    </article>
    <nav class="sermon-nav" aria-label="설교 이동">
        ${olderSermon ? `<a class="nav-link" href="${getSermonFilename(olderSermon)}">이전 말씀<br>${escapeHtml(olderSermon.date)} ${escapeHtml(olderSermon.title)}</a>` : '<span></span>'}
        ${newerSermon ? `<a class="nav-link next" href="${getSermonFilename(newerSermon)}">다음 말씀<br>${escapeHtml(newerSermon.date)} ${escapeHtml(newerSermon.title)}</a>` : '<span></span>'}
    </nav>
    <a class="back-link" href="../sermon.html">설교 말씀 페이지로 돌아가기</a>
</main>
<footer>
    예슈아 사랑교회 | <a href="${SITE_URL}">yeshua-love.org</a>
</footer>
</body>
</html>`;
}

function generateIndexHTML(sermons) {
    const grouped = getGroupedSermons(sermons);
    const serviceSections = SERVICE_ORDER
        .filter((service) => grouped[service]?.length)
        .map((service) => {
            const items = grouped[service]
                .map((sermon) => `<li>
                    <a href="${getSermonFilename(sermon)}">
                        <span class="date">${escapeHtml(sermon.date)}</span>
                        <span class="title">${escapeHtml(sermon.title)}</span>
                        ${sermon.category ? `<span class="category">${escapeHtml(sermon.category)}</span>` : ''}
                    </a>
                </li>`)
                .join('\n');

            return `<section class="service-section">
                <h2>${escapeHtml(getServiceName(service))}</h2>
                <ul>${items}</ul>
            </section>`;
        })
        .join('\n');

    const description = `예슈아 사랑교회의 설교 말씀 목록입니다. 총 ${sermons.length}개의 말씀을 확인할 수 있습니다.`;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '설교 말씀 목록 - 예슈아 사랑교회',
        description,
        url: `${SITE_URL}/sermons/index.html`,
        publisher: {
            '@type': 'Organization',
            name: '예슈아 사랑교회',
            url: SITE_URL
        }
    };

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>설교 말씀 목록 | 예슈아 사랑교회</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${SITE_URL}/sermons/index.html">
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <meta property="og:type" content="website">
    <meta property="og:title" content="설교 말씀 목록 | 예슈아 사랑교회">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${SITE_URL}/sermons/index.html">
    <meta property="og:image" content="${SITE_URL}/og-image.png">
    <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2).replace(/<\/script/gi, '<\\/script')}</script>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Malgun Gothic", "Apple SD Gothic Neo", system-ui, sans-serif;
            color: #23272f;
            background: #f7f4ee;
        }
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px 24px;
            background: #1f3042;
            color: #fff;
        }
        header a { color: #f5d77b; text-decoration: none; font-weight: 700; }
        main {
            width: min(920px, calc(100% - 32px));
            margin: 34px auto 56px;
        }
        h1 {
            margin: 0 0 8px;
            font-size: clamp(1.8rem, 4vw, 2.6rem);
            color: #17202b;
        }
        .subtitle {
            margin: 0 0 28px;
            color: #687382;
        }
        .service-section {
            margin-bottom: 22px;
            padding: 24px;
            background: #fff;
            border: 1px solid #e3ded2;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(20, 24, 32, 0.06);
        }
        .service-section h2 {
            margin: 0 0 14px;
            padding-bottom: 8px;
            border-bottom: 2px solid #2c9aa0;
            color: #17202b;
            font-size: 1.25rem;
        }
        ul { list-style: none; margin: 0; padding: 0; }
        li + li { border-top: 1px solid #ebe5d8; }
        li a {
            display: grid;
            grid-template-columns: 96px 1fr auto;
            gap: 12px;
            align-items: center;
            padding: 12px 6px;
            color: #23272f;
            text-decoration: none;
            border-radius: 8px;
        }
        li a:hover { background: #eef7f7; }
        .date { color: #687382; font-size: 0.9rem; }
        .title { font-weight: 700; }
        .category {
            padding: 2px 9px;
            color: #6b4e08;
            background: #fff3c4;
            border-radius: 999px;
            font-size: 0.82rem;
            white-space: nowrap;
        }
        footer {
            padding: 28px 16px;
            text-align: center;
            color: #7a828d;
            font-size: 0.9rem;
        }
        footer a { color: #2c6b78; }
        @media (max-width: 640px) {
            header { flex-direction: column; align-items: flex-start; }
            main { width: min(100% - 20px, 920px); margin-top: 22px; }
            .service-section { padding: 18px; }
            li a { grid-template-columns: 1fr; gap: 4px; }
            .category { width: fit-content; }
        }
    </style>
</head>
<body>
<header>
    <a href="../index.html">예슈아 사랑교회</a>
    <strong>설교 말씀</strong>
    <a href="../sermon.html">인터랙티브 보기</a>
</header>
<main>
    <h1>설교 말씀 목록</h1>
    <p class="subtitle">총 ${sermons.length}개의 설교 말씀이 있습니다.</p>
    ${serviceSections || '<p>등록된 설교 말씀이 없습니다.</p>'}
</main>
<footer>
    예슈아 사랑교회 | <a href="${SITE_URL}">yeshua-love.org</a>
</footer>
</body>
</html>`;
}

function generateSitemap(sermons) {
    const today = new Date().toISOString().slice(0, 10);
    const staticPages = [
        { loc: `${SITE_URL}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
        { loc: `${SITE_URL}/sermon.html`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
        { loc: `${SITE_URL}/sermons/index.html`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
        { loc: `${SITE_URL}/sundayschool.html`, lastmod: today, changefreq: 'monthly', priority: '0.7' }
    ];

    const sermonPages = sermons.map((sermon) => ({
        loc: `${SITE_URL}/sermons/${getSermonFilename(sermon)}`,
        lastmod: toIsoDate(sermon.date) || today,
        changefreq: 'monthly',
        priority: '0.7'
    }));

    const urls = [...staticPages, ...sermonPages]
        .map((page) => `    <url>
        <loc>${escapeXml(page.loc)}</loc>
        <lastmod>${escapeXml(page.lastmod)}</lastmod>
        <changefreq>${escapeXml(page.changefreq)}</changefreq>
        <priority>${escapeXml(page.priority)}</priority>
    </url>`)
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function cleanSermonsDirectory(sermonsDir) {
    fs.mkdirSync(sermonsDir, { recursive: true });
    for (const entry of fs.readdirSync(sermonsDir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.html')) {
            fs.unlinkSync(path.join(sermonsDir, entry.name));
        }
    }
}

async function main() {
    console.log('Fetching sermons from Firestore...');
    const sermons = await getAllSermons();
    console.log(`Fetched ${sermons.length} sermons.`);
    if (sermons.length === 0) {
        throw new Error('No sermons were fetched. Aborting to avoid deploying an empty sermon archive.');
    }

    const rootDir = process.cwd();
    const sermonsDir = path.join(rootDir, 'sermons');
    cleanSermonsDirectory(sermonsDir);

    for (const sermon of sermons) {
        const filename = getSermonFilename(sermon);
        fs.writeFileSync(path.join(sermonsDir, filename), generateSermonHTML(sermon, sermons), 'utf8');
        console.log(`Generated sermons/${filename}`);
    }

    fs.writeFileSync(path.join(sermonsDir, 'index.html'), generateIndexHTML(sermons), 'utf8');
    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), generateSitemap(sermons), 'utf8');

    console.log('Generated sermons/index.html');
    console.log('Updated sitemap.xml');
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

module.exports = {
    getSermonFilename,
    generateIndexHTML,
    generateSermonHTML,
    generateSitemap,
    toIsoDate
};
