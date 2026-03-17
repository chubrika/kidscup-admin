import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'kidscup_admin_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only attach admin JWT to our API requests.
  // This prevents leaking the token to external hosts (e.g. Cloudflare R2 signed URLs).
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
