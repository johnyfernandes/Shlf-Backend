import axios from 'axios';

const OPEN_LIBRARY_BASE = process.env.OPEN_LIBRARY_API_BASE || 'https://openlibrary.org';
const COVER_BASE = 'https://covers.openlibrary.org/b';
const OPEN_LIBRARY_TIMEOUT_MS = Number(process.env.OPEN_LIBRARY_TIMEOUT_MS) || 5000;

const openLibraryClient = axios.create({
  baseURL: OPEN_LIBRARY_BASE,
  timeout: OPEN_LIBRARY_TIMEOUT_MS,
  maxContentLength: 5 * 1024 * 1024,
  maxBodyLength: 5 * 1024 * 1024
});

/**
 * Search for books using Open Library Search API
 * @param {string} query - Search query (title, author, ISBN, etc.)
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Results per page (default: 10)
 */
export const searchBooks = async (query, page = 1, limit = 10) => {
  try {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const response = await openLibraryClient.get('/search.json', {
      params: {
        q: query,
        offset,
        limit: safeLimit,
        fields: 'key,title,subtitle,author_name,author_key,first_publish_year,isbn,cover_i,number_of_pages_median,subject,language'
      }
    });

    const results = response.data.docs.map(book => formatBookSearchResult(book));

    return {
      success: true,
      data: {
        results,
        total: response.data.numFound,
        page: safePage,
        limit: safeLimit,
        hasMore: offset + safeLimit < response.data.numFound
      }
    };
  } catch (error) {
    console.error('Open Library search error:', error);
    throw new Error('Failed to search books');
  }
};

/**
 * Get detailed book information by Open Library Work ID
 * @param {string} workId - Open Library Work ID (e.g., OL45883W)
 */
export const getBookDetails = async (workId) => {
  try {
    // Remove /works/ prefix if present
    const cleanWorkId = workId.replace(/^\/works\//, '');

    // Get work details
    const workResponse = await openLibraryClient.get(`/works/${cleanWorkId}.json`);
    const work = workResponse.data;

    // Get editions to find more details (ISBN, page count, etc.)
    const editionsResponse = await openLibraryClient.get(`/works/${cleanWorkId}/editions.json`, {
      params: {
        limit: 1
      }
    });

    const edition = editionsResponse.data.entries?.[0] || {};

    return {
      success: true,
      data: formatBookDetails(work, edition)
    };
  } catch (error) {
    console.error('Open Library get book details error:', error);
    throw new Error('Failed to get book details');
  }
};

/**
 * Get book by ISBN
 * @param {string} isbn - ISBN-10 or ISBN-13
 */
export const getBookByISBN = async (isbn) => {
  try {
    const response = await openLibraryClient.get(`/isbn/${isbn}.json`);
    const edition = response.data;

    // If edition has a work, get the work details
    if (edition.works && edition.works[0]) {
      const workKey = edition.works[0].key;
      const workResponse = await openLibraryClient.get(`${workKey}.json`);

      return {
        success: true,
        data: formatBookDetails(workResponse.data, edition)
      };
    }

    return {
      success: true,
      data: formatBookDetails({}, edition)
    };
  } catch (error) {
    console.error('Open Library get book by ISBN error:', error);
    throw new Error('Failed to get book by ISBN');
  }
};

/**
 * Get author details
 * @param {string} authorId - Open Library Author ID
 */
export const getAuthorDetails = async (authorId) => {
  try {
    const cleanAuthorId = authorId.replace(/^\/authors\//, '');
    const response = await openLibraryClient.get(`/authors/${cleanAuthorId}.json`);

    return {
      success: true,
      data: {
        id: response.data.key,
        name: response.data.name,
        bio: response.data.bio?.value || response.data.bio,
        birthDate: response.data.birth_date,
        deathDate: response.data.death_date,
        photoUrl: response.data.photos?.[0] ? `${OPEN_LIBRARY_BASE}/authors/${cleanAuthorId}/photo.jpg` : null
      }
    };
  } catch (error) {
    console.error('Open Library get author details error:', error);
    throw new Error('Failed to get author details');
  }
};

/**
 * Format book search result
 */
function formatBookSearchResult(book) {
  return {
    openLibraryId: book.key,
    title: book.title,
    subtitle: book.subtitle,
    authors: book.author_name || [],
    authorKeys: book.author_key || [],
    publishedDate: book.first_publish_year?.toString(),
    isbn: book.isbn?.[0],
    coverImageUrl: book.cover_i ? `${COVER_BASE}/id/${book.cover_i}-L.jpg` : null,
    pageCount: book.number_of_pages_median || null,
    subjects: book.subject?.slice(0, 10) || [],
    languages: book.language || []
  };
}

/**
 * Format detailed book information
 */
function formatBookDetails(work, edition) {
  const description = typeof work.description === 'object'
    ? work.description?.value
    : work.description;

  // Get cover ID from work or edition
  const coverId = work.covers?.[0] || edition.covers?.[0];

  // Get ISBN
  const isbn = edition.isbn_13?.[0] || edition.isbn_10?.[0];

  // Get page count
  const pageCount = edition.number_of_pages || work.number_of_pages;

  return {
    openLibraryId: work.key,
    title: work.title || edition.title,
    subtitle: work.subtitle || edition.subtitle,
    authors: work.authors?.map(a => a.author?.name || a.name).filter(Boolean) || [],
    authorKeys: work.authors?.map(a => a.author?.key || a.key).filter(Boolean) || [],
    description,
    publishedDate: edition.publish_date || work.first_publish_year?.toString(),
    isbn,
    coverImageUrl: coverId ? `${COVER_BASE}/id/${coverId}-L.jpg` : null,
    pageCount,
    subjects: work.subjects?.slice(0, 15) || [],
    rawWorkData: work,
    rawEditionData: edition
  };
}

/**
 * Get cover image URL
 * @param {string} coverId - Cover ID
 * @param {string} size - Size (S, M, L)
 */
export const getCoverUrl = (coverId, size = 'L') => {
  if (!coverId) return null;
  return `${COVER_BASE}/id/${coverId}-${size}.jpg`;
};

/**
 * Get cover image URL by ISBN
 */
export const getCoverUrlByISBN = (isbn, size = 'L') => {
  if (!isbn) return null;
  return `${COVER_BASE}/isbn/${isbn}-${size}.jpg`;
};

export default {
  searchBooks,
  getBookDetails,
  getBookByISBN,
  getAuthorDetails,
  getCoverUrl,
  getCoverUrlByISBN
};
