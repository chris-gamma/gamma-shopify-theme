/**
 * Toggle to enable or disable the legacy rentals integration.
 * Set this to false once the legacy WordPress catalogue is no longer needed.
 */
export const LEGACY_RENTALS_ENABLED = true;
/** Toggle debug logging for legacy rentals */
const LEGACY_RENTALS_DEBUG = true;
/**
 * Default base URI for the legacy WordPress API.
 * You can override this per-component via data-legacy-base-uri on predictive-search-component.
 */
export const DEFAULT_LEGACY_API_BASE_URI = 'https://locationgamma.com/fr/';

/**
 * @typedef {object} LegacyOgImage
 * @property {string} url
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {object} LegacyYoastHeadJson
 * @property {LegacyOgImage[]} [og_image]
 */

/**
 * @typedef {object} LegacyProductTitle
 * @property {string} rendered
 */

/**
 * @typedef {object} LegacyProductApiLinkItem
 * @property {string} href
 */

/**
 * @typedef {Object.<string, LegacyProductApiLinkItem[]>} LegacyProductApiLinks
 */

/**
 * @typedef {object} LegacyProductApiItem
 * @property {LegacyProductTitle} title
 * @property {string} link
 * @property {LegacyYoastHeadJson} [yoast_head_json]
 * @property {LegacyProductApiLinks} [_links]
 */

/**
 * @typedef {object} LegacyRentalImage
 * @property {string} url
 * @property {string} alt
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {object} LegacyRentalItem
 * @property {string} link
 * @property {string} title
 * @property {LegacyRentalImage | undefined} [image]
 */

/**
 * @typedef {object} LegacyRentalResultsResources
 * @property {{ rentals: LegacyRentalItem[] }} results
 */

/**
 * @typedef {object} LegacyRentalResults
 * @property {LegacyRentalResultsResources} resources
 */

/** @type {HTMLDivElement | null} */
var htmlEntityDecoderContainer = null;

/**
 * Decode HTML entities using the browser's DOM, running the decode twice to
 * handle double-encoded values like "′" -> "′".
 *
 * @param {string} value
 * @returns {string}
 */
function decodeHtmlEntitiesTwice(value) {
  if (!value) return '';
  if (!htmlEntityDecoderContainer) {
    htmlEntityDecoderContainer = document.createElement('div');
  }
  var container = htmlEntityDecoderContainer;
  // First pass
  container.innerHTML = value;
  var once = container.textContent || container.innerText || '';
  // Second pass to catch numeric refs that were themselves encoded
  container.innerHTML = once;
  var twice = container.textContent || container.innerText || '';
  return twice;
}

/**
 * Build a rental image from the first og:image entry, matching existing sizing rules.
 *
 * @param {LegacyOgImage | null | undefined} first
 * @param {string} title
 * @returns {LegacyRentalImage | undefined}
 */
function buildLegacyImageFromOg(first, title) {
  if (!first || typeof first.url !== 'string') {
    return undefined;
  }

  var width =
    typeof first.width === 'number' && first.width > 0
      ? Math.min(first.width, 1200)
      : 1200;

  var height =
    typeof first.height === 'number' && first.height > 0 ? first.height : width;

  return {
    url: first.url,
    alt: title,
    width: width,
    height: height,
  };
}

/**
 * Get the featured media API href from a product item.
 *
 * @param {LegacyProductApiItem} item
 * @returns {string | null}
 */
function getFeaturedMediaHref(item) {
  var links = item && item._links;
  if (!links) return null;

  var featured = links['wp:featuredmedia'];
  if (!Array.isArray(featured) || featured.length < 1) {
    return null;
  }

  var first = featured[0];
  if (first && typeof first.href === 'string') {
    return first.href;
  }

  return null;
}

/**
 * Normalize a single WordPress product item to the rental format.
 *
 * @param {LegacyProductApiItem} item
 * @returns {{ rental: LegacyRentalItem | null, featuredMediaHref: string | null }}
 */
function normalizeLegacyProductItem(item) {
  if (
    !item ||
    !item.link ||
    !item.title ||
    typeof item.title.rendered !== 'string'
  ) {
    return { rental: null, featuredMediaHref: null };
  }

  // Decode HTML entities in the title (including double-encoded numeric entities)
  var title = decodeHtmlEntitiesTwice(item.title.rendered);

  /** @type {LegacyRentalImage | undefined} */
  var image;

  var yoast = item.yoast_head_json;
  var ogImages = yoast && Array.isArray(yoast.og_image) ? yoast.og_image : null;
  if (ogImages && ogImages.length > 0) {
    var first = ogImages[0];
    image = buildLegacyImageFromOg(first, title);
  }

  /** @type {string | null} */
  var featuredMediaHref = null;
  if (!image) {
    featuredMediaHref = getFeaturedMediaHref(item);
  }

  return {
    rental: {
      link: item.link,
      title: title,
      image: image,
    },
    featuredMediaHref: featuredMediaHref,
  };
}

/** @type {string | null} */
var lastLegacyQueryKey = null;
/** @type {LegacyRentalResults | null} */
var lastLegacyQueryResult = null;
/** @type {number} */
var legacyRequestCount = 0;
/** @type {Map<string, LegacyOgImage | null>} */
var legacyMediaOgImageCache = new Map();

/**
 * Fetch the yoast og_image from a media endpoint, caching by URL.
 *
 * @param {string} href
 * @param {AbortSignal | undefined} [signal]
 * @returns {Promise<LegacyOgImage | null>}
 */
async function fetchLegacyMediaOgImage(href, signal) {
  if (!href) {
    return null;
  }

  /** @type {URL} */
  var url;
  try {
    url = new URL(href);
  } catch (_error) {
    return null;
  }

  url.searchParams.set('_fields', 'yoast_head_json.og_image');
  var cacheKey = url.toString();

  if (legacyMediaOgImageCache.has(cacheKey)) {
    return legacyMediaOgImageCache.get(cacheKey) || null;
  }

  /** @type {Response} */
  var response;
  try {
    legacyRequestCount += 1;
    if (LEGACY_RENTALS_DEBUG) {
      // Keep this lightweight; only used when debugging.
      // eslint-disable-next-line no-console
      console.debug(
        '[LegacyRentals] Fetch #%s (media)\n%s',
        legacyRequestCount,
        url.toString(),
      );
    }

    response = await fetch(url.toString(), {
      method: 'GET',
      signal: signal,
    });
  } catch (_networkError) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  /** @type {unknown} */
  var data;
  try {
    data = await response.json();
  } catch (_parseError) {
    return null;
  }

  var yoast = data && /** @type {any} */ (data).yoast_head_json;
  var ogImages = yoast && Array.isArray(yoast.og_image) ? yoast.og_image : null;
  var first = ogImages && ogImages.length > 0 ? ogImages[0] : null;
  var og = first && typeof first.url === 'string' ? first : null;

  legacyMediaOgImageCache.set(cacheKey, og);
  return og;
}

/**
 * Fetch legacy rental results from the WordPress REST API and normalize them.
 *
 * Returns:
 * {
 *   resources: {
 *     results: {
 *       rentals: [ { link, title, image? }, ... ]
 *     }
 *   }
 * }
 *
 * or null when disabled, on error, when there is no search term
 * or when the search term is too short.
 *
 * @param {string} searchTerm
 * @param {string | undefined} apiBaseUri
 * @param {AbortSignal | undefined} [signal]
 * @param {number | string | undefined} [maxResults]
 * @returns {Promise<LegacyRentalResults | null>}
 */
export async function fetchLegacyRentals(
  searchTerm,
  apiBaseUri,
  signal,
  maxResults,
) {
  if (!LEGACY_RENTALS_ENABLED) {
    return null;
  }

  var value = (searchTerm || '').trim();

  var perPage = parseInt(String(maxResults ?? ''), 10);
  if (!Number.isFinite(perPage) || perPage < 1) {
    perPage = 10;
  } else if (perPage > 100) {
    perPage = 100;
  }

  if (!value || value.length < 3) {
    return null;
  }

  var base = apiBaseUri || DEFAULT_LEGACY_API_BASE_URI;
  var cacheKey = base + '\n' + value + '\n' + perPage;

  if (cacheKey === lastLegacyQueryKey && lastLegacyQueryResult) {
    return lastLegacyQueryResult;
  }

  /** @type {URL} */
  var url;
  try {
    url = new URL('wp-json/wp/v2/products', base);
  } catch (_error) {
    return null;
  }

  url.searchParams.set('search', value);
  url.searchParams.set('context', 'embed');
  url.searchParams.set('orderby', 'relevance');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set(
    '_fields',
    'title.rendered,link,yoast_head_json.og_image,_links.wp:featuredmedia',
  );

  /** @type {Response} */
  var response;
  try {
    legacyRequestCount += 1;
    if (LEGACY_RENTALS_DEBUG) {
      // Keep this lightweight; only used when debugging.
      // eslint-disable-next-line no-console
      console.debug(
        '[LegacyRentals] Fetch #%s for \"%s\" (%s)\n%s',
        legacyRequestCount,
        value,
        base,
        url.toString(),
      );
    }

    response = await fetch(url.toString(), {
      method: 'GET',
      signal: signal,
    });
  } catch (_networkError) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  /** @type {unknown} */
  var data;
  try {
    data = await response.json();
  } catch (_parseError) {
    return null;
  }

  if (!Array.isArray(data)) {
    return null;
  }

  /** @type {LegacyRentalItem[]} */
  var rentals = [];
  /** @type {Array<{ index: number, href: string, title: string }>} */
  var mediaFallbacks = [];

  for (var i = 0; i < data.length; i += 1) {
    /** @type {LegacyProductApiItem} */
    var raw = data[i];
    var normalized = normalizeLegacyProductItem(raw);
    if (normalized && normalized.rental) {
      rentals.push(normalized.rental);
      if (!normalized.rental.image && normalized.featuredMediaHref) {
        mediaFallbacks.push({
          index: rentals.length - 1,
          href: normalized.featuredMediaHref,
          title: normalized.rental.title,
        });
      }
    }
  }

  if (mediaFallbacks.length > 0) {
    await Promise.all(
      mediaFallbacks.map(async function (entry) {
        var og = await fetchLegacyMediaOgImage(entry.href, signal);
        var image = buildLegacyImageFromOg(og, entry.title);
        var target = rentals[entry.index];
        if (target && image) {
          target.image = image;
        }
      }),
    );
  }

  /** @type {LegacyRentalResults} */
  var result = {
    resources: {
      results: {
        rentals: rentals,
      },
    },
  };

  lastLegacyQueryKey = cacheKey;
  lastLegacyQueryResult = result;
  return result;
}
