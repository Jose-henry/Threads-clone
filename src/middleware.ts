import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const isIgnoredRoute = createRouteMatcher([
  '/api/webhook/clerk',
]);

export default clerkMiddleware((auth, req) => {
  if (!auth().userId && !isPublicRoute(req) && !isIgnoredRoute(req)) {
    return auth().redirectToSignIn();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
