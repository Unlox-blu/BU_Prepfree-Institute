import LoginPage from './login/page';
/**
 * This page serves as the root entry point (admin.prepfree.com or ,<college-domain>.prepfree.com).
 * It imports and renders the LoginPage component to cover the base URL,
 * relying on the middleware to set the correct 'role' context for the login component.
 */
export default function RootPage() {
  return <LoginPage />;
}