export {
  APP_SCHEME,
  RESET_PASSWORD_LINK,
  VERIFY_EMAIL_LINK,
  authClient,
  useSession,
} from './client';
export { describeAuthError, type AuthErrorLike } from './errors';
export { useEnsureGuestSession } from './guest';
