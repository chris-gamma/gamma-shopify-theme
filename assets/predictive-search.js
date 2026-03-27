import { Component } from '@theme/component';
import { debounce, onAnimationEnd, prefersReducedMotion } from '@theme/utilities';
import { sectionRenderer } from '@theme/section-renderer';
import { morph } from '@theme/morph';
import { RecentlyViewed } from '@theme/recently-viewed-products';
import { DialogCloseEvent, DialogOpenEvent, DialogComponent } from '@theme/dialog';
import { LEGACY_RENTALS_ENABLED, fetchLegacyRentals, DEFAULT_LEGACY_API_BASE_URI } from './predictive-search-legacy.js';

/**
 * A custom element that allows the user to search for resources available on the store.
 *
 * @typedef {object} Refs
 * @property {HTMLInputElement} searchInput - The search input element.
 * @property {HTMLElement} predictiveSearchResults - The predictive search results container.
 * @property {HTMLElement} resetButton - The reset button element.
 * @property {HTMLElement[]} [resultsItems] - The search results items elements.
 * @property {HTMLElement} [recentlyViewedWrapper] - The recently viewed products wrapper.
 * @property {HTMLElement[]} [recentlyViewedTitle] - The recently viewed title elements.
 * @property {HTMLElement[]} [recentlyViewedItems] - The recently viewed product items.
 * @extends {Component<Refs>}
 */
class PredictiveSearchComponent extends Component {
  requiredRefs = ['searchInput', 'predictiveSearchResults', 'resetButton'];

  #controller = new AbortController();

  /**
   * @type {AbortController | null}
   */
  #activeFetch = null;

  #emptyStateLoaded = false;

  #legacyRequestToken = 0;

  /**
   * @type {AbortController | null}
   */
  #legacyAbortController = null;

  /**
   * Get the dialog component.
   * @returns {DialogComponent | null} The dialog component.
   */
  get dialog() {
    return this.closest('dialog-component');
  }

  connectedCallback() {
    super.connectedCallback();

    const { dialog } = this;
    const { signal } = this.#controller;

    if (this.refs.searchInput.value.length > 0) {
      this.#showResetButton();
    }

    if (dialog) {
      document.addEventListener('keydown', this.#handleKeyboardShortcut, { signal });
      dialog.addEventListener(DialogCloseEvent.eventName, this.#handleDialogClose, { signal });
      dialog.addEventListener(DialogOpenEvent.eventName, this.#handleDialogOpen, { signal, once: true });

      this.addEventListener('click', this.#handleModalClick, { signal });
    }

    if (RecentlyViewed.getProducts().length > 0) {
      requestIdleCallback(() => {
        this.#loadEmptyState();
      });
    }
  }

  /**
   * Handles clicks within the predictive search modal to maintain focus on the input
   * @param {MouseEvent} event - The mouse event
   */
  #handleModalClick = (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const isInteractiveElement =
      target instanceof HTMLButtonElement ||
      target instanceof HTMLAnchorElement ||
      target instanceof HTMLInputElement ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input');

    if (!isInteractiveElement && this.refs.searchInput) {
      this.refs.searchInput.focus();
    }
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller.abort();
    if (this.#legacyAbortController) {
      this.#legacyAbortController.abort();
      this.#legacyAbortController = null;
    }
  }

  /**
   * Handles the CMD+K key combination.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  #handleKeyboardShortcut = (event) => {
    if (event.metaKey && event.key === 'k') {
      this.dialog?.toggleDialog();
    }
  };

  /**
   * Handles the dialog close event.
   */
  #handleDialogClose = () => {
    this.#resetSearch();
  };

  #handleDialogOpen = () => {
    if (!this.#emptyStateLoaded && RecentlyViewed.getProducts().length > 0) {
      this.#loadEmptyState();
    }
  };

  #loadEmptyState() {
    if (this.#emptyStateLoaded) return;
    this.#emptyStateLoaded = true;
    this.resetSearch(false);
  }

  get #allResultsItems() {
    const containers = Array.from(
      this.querySelectorAll(
        '.predictive-search-results__wrapper-queries, ' +
          '.predictive-search-results__wrapper-products, ' +
          '.predictive-search-results__list'
      )
    );

    const allItems = containers
      .flatMap((container) => {
        if (container.classList.contains('predictive-search-results__wrapper-products')) {
          return Array.from(container.querySelectorAll('.predictive-search-results__card'));
        }
        return Array.from(container.querySelectorAll('[ref="resultsItems[]"], .predictive-search-results__card'));
      })
      .filter((item) => item instanceof HTMLElement);

    return /** @type {HTMLElement[]} */ (allItems);
  }

  /**
   * Track whether the last interaction was keyboard-based
   * @type {boolean}
   */
  #isKeyboardNavigation = false;

  get #currentIndex() {
    return this.#allResultsItems?.findIndex((item) => item.getAttribute('aria-selected') === 'true') ?? -1;
  }

  set #currentIndex(index) {
    if (!this.#allResultsItems?.length) return;

    let activeItem = null;

    this.#allResultsItems.forEach((item) => {
      item.classList.remove('keyboard-focus');
    });

    for (const [itemIndex, item] of this.#allResultsItems.entries()) {
      if (itemIndex === index) {
        item.setAttribute('aria-selected', 'true');
        if (this.#isKeyboardNavigation) {
          item.classList.add('keyboard-focus');
        }
        activeItem = item;
      } else {
        item.removeAttribute('aria-selected');
      }
    }

    activeItem?.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'nearest' });
    this.refs.searchInput.focus();
  }

  get #currentItem() {
    return this.#allResultsItems?.[this.#currentIndex];
  }

  /**
   * Navigate through the predictive search results using arrow keys or close them with the Escape key.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  onSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.#resetSearch();
      return;
    }

    if (!this.#allResultsItems?.length || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      return;
    }

    const currentIndex = this.#currentIndex;
    const totalItems = this.#allResultsItems.length;

    switch (event.key) {
      case 'ArrowDown':
        this.#isKeyboardNavigation = true;
        event.preventDefault();
        this.#currentIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        break;

      case 'Tab':
        if (event.shiftKey) {
          this.#isKeyboardNavigation = true;
          event.preventDefault();
          this.#currentIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        } else {
          this.#isKeyboardNavigation = true;
          event.preventDefault();
          this.#currentIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        }
        break;

      case 'ArrowUp':
        this.#isKeyboardNavigation = true;
        event.preventDefault();
        this.#currentIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        break;

      case 'Enter': {
        const singleResultContainer = this.refs.predictiveSearchResults.querySelector('[data-single-result-url]');
        if (singleResultContainer instanceof HTMLElement && singleResultContainer.dataset.singleResultUrl) {
          event.preventDefault();
          window.location.href = singleResultContainer.dataset.singleResultUrl;
          return;
        }

        if (this.#currentIndex >= 0) {
          event.preventDefault();
          this.#currentItem?.querySelector('a')?.click();
        } else {
          const searchUrl = new URL(Theme.routes.search_url, location.origin);
          searchUrl.searchParams.set('q', this.refs.searchInput.value);
          window.location.href = searchUrl.toString();
        }
        break;
      }
    }
  };

  /**
   * Clears the recently viewed products.
   * @param {Event} event - The event.
   */
  clearRecentlyViewedProducts(event) {
    event.stopPropagation();

    RecentlyViewed.clearProducts();

    const { recentlyViewedItems, recentlyViewedTitle, recentlyViewedWrapper } = this.refs;

    const allRecentlyViewedElements = [...(recentlyViewedItems || []), ...(recentlyViewedTitle || [])];

    if (allRecentlyViewedElements.length === 0) {
      return;
    }

    if (recentlyViewedWrapper) {
      recentlyViewedWrapper.classList.add('removing');

      onAnimationEnd(recentlyViewedWrapper, () => {
        recentlyViewedWrapper.remove();
      });
    }
  }

  /**
   * Reset the search state.
   * @param {boolean} [keepFocus=true] - Whether to keep focus on input after reset
   */
  resetSearch = debounce((keepFocus = true) => {
    if (keepFocus) {
      this.refs.searchInput.focus();
    }
    this.#resetSearch();
  }, 100);

  /**
   * Debounce the search handler to fetch and display search results based on the input value.
   * Reset the current selection index and close results if the search term is empty.
   */
  search = debounce((event) => {
    // If the input is not a text input (like using the Escape key), don't search
    if (!event.inputType) return;

    const searchTerm = this.refs.searchInput.value.trim();
    this.#currentIndex = -1;

    if (!searchTerm.length) {
      this.#resetSearch();
      return;
    }

    this.#showResetButton();
    this.#getSearchResults(searchTerm);
  }, 200);

  /**
   * Resets scroll positions for search results containers
   */
  #resetScrollPositions() {
    requestAnimationFrame(() => {
      this.refs.predictiveSearchResults.querySelector('.predictive-search-results__inner')?.scrollTo(0, 0);
      this.querySelector('.predictive-search-form__content')?.scrollTo(0, 0);
    });
  }

  #toggleViewAllForLegacyOnly() {
    const viewAllButton = this.querySelector('.predictive-search__search-button');
    if (!(viewAllButton instanceof HTMLElement)) return;

    const { predictiveSearchResults } = this.refs;
    const root =
      predictiveSearchResults.querySelector('.predictive-search-results__inner') ||
      predictiveSearchResults;

    const legacyWrapper = root.querySelector('[data-legacy-rentals="true"]');
    const hasLegacy =
      legacyWrapper instanceof HTMLElement &&
      legacyWrapper.querySelectorAll('.predictive-search-results__card').length > 0;

    const hasNonLegacy =
      Array.from(root.querySelectorAll('.predictive-search-results__card')).filter(
        (card) => !card.closest('[data-legacy-rentals="true"]')
      ).length > 0;

    viewAllButton.hidden = hasLegacy && !hasNonLegacy;
  }

  /**
   * Fetch search results using the section renderer and update the results container.
   * @param {string} searchTerm - The term to search for
   */
  async #getSearchResults(searchTerm) {
    if (!this.dataset.sectionId) return;

    const url = new URL(Theme.routes.predictive_search_url, location.origin);
    url.searchParams.set('q', searchTerm);
    url.searchParams.set('resources[limit_scope]', 'each');

    const { predictiveSearchResults } = this.refs;

    const abortController = this.#createAbortController();

    sectionRenderer
      .getSectionHTML(this.dataset.sectionId, false, url)
      .then((resultsMarkup) => {
        if (!resultsMarkup) return;

        if (abortController.signal.aborted) return;

        morph(predictiveSearchResults, resultsMarkup);

        this.#resetScrollPositions();
        this.#toggleViewAllForLegacyOnly();
        this.#updateLegacyRentals(searchTerm);
      })
      .catch((error) => {
        if (abortController.signal.aborted) return;
        throw error;
      });
  }

  /**
   * Fetch the markup for the recently viewed products.
   * @returns {Promise<string | null>} The markup for the recently viewed products.
   */
  async #getRecentlyViewedProductsMarkup() {
    if (!this.dataset.sectionId) return null;

    const viewedProducts = RecentlyViewed.getProducts();
    if (viewedProducts.length === 0) return null;

    const url = new URL(Theme.routes.search_url, location.origin);
    url.searchParams.set('q', viewedProducts.map(/** @param {string} id */ (id) => `id:${id}`).join(' OR '));
    url.searchParams.set('resources[type]', 'product');

    return sectionRenderer.getSectionHTML(this.dataset.sectionId, false, url);
  }

  #hideResetButton() {
    const { resetButton } = this.refs;

    resetButton.hidden = true;
  }

  #showResetButton() {
    const { resetButton } = this.refs;

    resetButton.hidden = false;
  }

  #createAbortController() {
    const abortController = new AbortController();
    if (this.#activeFetch) {
      this.#activeFetch.abort();
    }
    this.#activeFetch = abortController;
    return abortController;
  }

  /**
   * @param {string} searchTerm
   */
  #updateLegacyRentals(searchTerm) {
    if (!LEGACY_RENTALS_ENABLED) return;

    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length < 3) return;

    const { predictiveSearchResults } = this.refs;
    if (!predictiveSearchResults) return;

    const currentToken = ++this.#legacyRequestToken;
    const baseUri = this.dataset.legacyBaseUri;

    const parsedMaxResults = parseInt(this.dataset.legacyPerPage || '', 10);
    const perPage = parsedMaxResults > 0 ? parsedMaxResults : 10;

    if (this.#legacyAbortController) {
      this.#legacyAbortController.abort();
    }

    const controller = new AbortController();
    this.#legacyAbortController = controller;

    fetchLegacyRentals(trimmed, baseUri, controller.signal, perPage)
      .then((legacyResults) => {
        if (!legacyResults) {
          this.#toggleViewAllForLegacyOnly();
          return;
        }
        if (controller.signal.aborted) return;
        if (currentToken !== this.#legacyRequestToken) return;

        this.#renderLegacyRentals(legacyResults, trimmed);
        this.#toggleViewAllForLegacyOnly();
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        this.#toggleViewAllForLegacyOnly();
        // ignore legacy API errors
      });
  }

  /**
   * @param {{ resources: { results: { rentals: any; }; }; }} legacyResults
   * @param {any} searchTerm
   */
  #renderLegacyRentals(legacyResults, searchTerm) {
    const { predictiveSearchResults } = this.refs;
    if (!predictiveSearchResults) return;

    const root =
      predictiveSearchResults.querySelector('.predictive-search-results__inner') ||
      predictiveSearchResults;

    const existing = root.querySelector('[data-legacy-rentals="true"]');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const rentals =
      legacyResults &&
      legacyResults.resources &&
      legacyResults.resources.results &&
      Array.isArray(legacyResults.resources.results.rentals)
        ? legacyResults.resources.results.rentals
        : [];

    if (!rentals.length) {
      return;
    }

    const headerTitleText = this.dataset.legacyHeaderTitle || 'Locations';

    const noResultsEl = root.querySelector('.predictive-search-results__no-results');
    if (noResultsEl instanceof HTMLElement) {
      noResultsEl.classList.add('removing');
      onAnimationEnd(noResultsEl, () => {
        if (noResultsEl.parentNode) {
          noResultsEl.parentNode.removeChild(noResultsEl);
        }
      });
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'predictive-search-results__products';
    wrapper.setAttribute('data-legacy-rentals', 'true');

    const header = document.createElement('h4');
    header.className = 'predictive-search-results__title';
    header.textContent = headerTitleText;

    const viewMoreText = this.dataset.legacyViewMoreText || '';
    if (viewMoreText) {
      const viewMoreLink = document.createElement('a');
      viewMoreLink.className = 'link button-unstyled';
      viewMoreLink.textContent = viewMoreText;
      viewMoreLink.target = '_blank';
      viewMoreLink.rel = 'noopener noreferrer';

      try {
        const url = new URL(this.dataset.legacyBaseUri || DEFAULT_LEGACY_API_BASE_URI);
        url.searchParams.set('post_type', 'gamma_product');
        url.searchParams.set('s', searchTerm || '');
        viewMoreLink.href = url.toString();
      } catch (_error) {
        viewMoreLink.href = '#';
      }

      header.appendChild(viewMoreLink);
    }

    wrapper.appendChild(header);

    const list = document.createElement('ul');
    list.className =
      'predictive-search-results__list predictive-search-results__wrapper-products list-unstyled';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', headerTitleText);
    wrapper.appendChild(list);

    rentals.forEach((/** @type {{ link: string; title: string | null; image: { url: string; alt: any; }; }} */ item) => {
      if (!item || !item.link || !item.title) return;

      const card = document.createElement('li');
      card.className =
        'predictive-search-results__card predictive-search-results__card--product predictive-search-results__card--rental';
      card.setAttribute('data-resource-type', 'rental');
      card.setAttribute('role', 'option');

      const cardInner = document.createElement('div');
      cardInner.className = 'resource-card';
      card.appendChild(cardInner);

      const cardLink = document.createElement('a');
      cardLink.className = 'resource-card__link';
      cardLink.href = item.link;
      cardLink.target = '_blank';
      cardLink.rel = 'noopener noreferrer';
      cardInner.appendChild(cardLink);

      const media = document.createElement('div');
      media.className = 'resource-card__media';
      media.style.backgroundColor = '#ffffff';
      media.style.setProperty('--resource-card-aspect-ratio', '4 / 5');
      cardInner.appendChild(media);

      if (item.image && item.image.url) {
        const img = document.createElement('img');
        img.className = 'resource-card__image';
        img.src = item.image.url;
        img.alt = item.image.alt || item.title;
        img.loading = 'lazy';
        img.style.objectFit = 'contain';
        media.appendChild(img);
      }

      const content = document.createElement('div');
      content.className = 'resource-card__content';
      cardInner.appendChild(content);

      const title = document.createElement('p');
      title.className = 'resource-card__title paragraph';
      title.textContent = item.title;
      content.appendChild(title);

      list.appendChild(card);
    });

    const productsSection = root.querySelector('#predictive-search-products');
    if (productsSection && productsSection.parentNode) {
      productsSection.parentNode.insertBefore(wrapper, productsSection);
    } else {
      const firstResultsBlock = root.querySelector(
        '#predictive-search-products, ' +
          '.predictive-search-results__wrapper-products, ' +
          '.predictive-search-results__wrapper-queries, ' +
          '.predictive-search-results__list'
      );

      if (firstResultsBlock && firstResultsBlock.parentNode) {
        firstResultsBlock.parentNode.insertBefore(wrapper, firstResultsBlock);
      } else {
        root.appendChild(wrapper);
      }
    }
  }

  #resetSearch = async () => {
    const { predictiveSearchResults, searchInput } = this.refs;
    const emptySectionId = 'predictive-search-empty';

    this.#legacyRequestToken += 1;
    if (this.#legacyAbortController) {
      this.#legacyAbortController.abort();
      this.#legacyAbortController = null;
    }

    this.#currentIndex = -1;
    searchInput.value = '';
    this.#hideResetButton();

    const abortController = this.#createAbortController();
    const url = new URL(window.location.href);
    url.searchParams.delete('page');

    const emptySectionMarkup = await sectionRenderer.getSectionHTML(emptySectionId, false, url);
    const parsedEmptySectionMarkup = new DOMParser()
      .parseFromString(emptySectionMarkup, 'text/html')
      .querySelector('.predictive-search-empty-section');

    if (!parsedEmptySectionMarkup) throw new Error('No empty section markup found');

    /** This needs to be awaited and not .then so the DOM is already morphed
     * when #closeResults is called and therefore the height is animated */
    const viewedProducts = RecentlyViewed.getProducts();

    if (viewedProducts.length > 0) {
      const recentlyViewedMarkup = await this.#getRecentlyViewedProductsMarkup();
      if (!recentlyViewedMarkup) return;

      const parsedRecentlyViewedMarkup = new DOMParser().parseFromString(recentlyViewedMarkup, 'text/html');
      const recentlyViewedProductsHtml = parsedRecentlyViewedMarkup.getElementById('predictive-search-products');
      if (!recentlyViewedProductsHtml) return;

      for (const child of recentlyViewedProductsHtml.children) {
        if (child instanceof HTMLElement) {
          child.setAttribute('ref', 'recentlyViewedWrapper');
        }
      }

      const collectionElement = parsedEmptySectionMarkup.querySelector('#predictive-search-products');
      if (!collectionElement) return;
      collectionElement.prepend(...recentlyViewedProductsHtml.children);
    }

    if (abortController.signal.aborted) return;

    morph(predictiveSearchResults, parsedEmptySectionMarkup);
    this.#resetScrollPositions();
    this.#toggleViewAllForLegacyOnly();
  };
}

if (!customElements.get('predictive-search-component')) {
  customElements.define('predictive-search-component', PredictiveSearchComponent);
}