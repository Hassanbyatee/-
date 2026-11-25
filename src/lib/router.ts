import type { AppView } from '../components/Navbar';

export interface ParsedRoute {
  view: AppView;
  sectionId?: string;
  tripId?: string;
  modalMode?: 'seats' | 'full_car';
}

const SECTION_PATH_MAP: Record<string, string> = {
  'available-trips': '/available-trips',
  'trips-list': '/available-trips',
  'empty-cars-section': '/empty-cars',
  destinations: '/destinations',
  'loyalty-section': '/loyalty',
  loyalty: '/loyalty',
  'become-driver': '/become-driver',
};

export function parseRoute(pathname: string): ParsedRoute {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';

  if (clean === '/') {
    return { view: 'home' };
  }
  if (clean === '/empty-cars') {
    return { view: 'empty-cars' };
  }
  if (clean === '/available-trips') {
    return { view: 'home', sectionId: 'available-trips' };
  }
  if (clean === '/destinations') {
    return { view: 'home', sectionId: 'destinations' };
  }
  if (clean === '/loyalty') {
    return { view: 'home', sectionId: 'loyalty-section' };
  }
  if (clean === '/become-driver') {
    return { view: 'home', sectionId: 'become-driver' };
  }
  if (clean === '/passenger') {
    return { view: 'passenger' };
  }
  if (clean === '/driver') {
    return { view: 'driver' };
  }
  if (clean === '/admin') {
    return { view: 'admin' };
  }
  if (clean === '/privacy') {
    return { view: 'privacy' };
  }
  if (clean === '/terms') {
    return { view: 'terms' };
  }
  if (clean === '/cancellation') {
    return { view: 'cancellation' };
  }
  if (clean === '/contact') {
    return { view: 'contact' };
  }

  if (clean.startsWith('/trips/')) {
    const tripId = decodeURIComponent(clean.slice('/trips/'.length).split('/')[0] || '');
    if (tripId) {
      return { view: 'home', tripId, modalMode: 'seats' };
    }
  }

  if (clean.startsWith('/book-full-car/')) {
    const tripId = decodeURIComponent(clean.slice('/book-full-car/'.length).split('/')[0] || '');
    if (tripId) {
      return { view: 'empty-cars', tripId, modalMode: 'full_car' };
    }
  }

  return { view: 'home' };
}

export function pathForView(view: AppView, sectionId?: string): string {
  if (view === 'home') {
    if (sectionId && SECTION_PATH_MAP[sectionId]) {
      return SECTION_PATH_MAP[sectionId];
    }
    return '/';
  }
  return `/${view}`;
}

export function pushRoute(path: string, replace = false): void {
  if (typeof window === 'undefined') return;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const current = window.location.pathname || '/';
  if (current === normalized) return;
  const search = window.location.search && normalized === '/' ? window.location.search : '';
  const targetUrl = `${normalized}${search}`;
  if (replace) {
    window.history.replaceState(null, '', targetUrl);
  } else {
    window.history.pushState(null, '', targetUrl);
  }
}
