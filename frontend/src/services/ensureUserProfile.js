import { updateProfile } from 'firebase/auth';


export const ensureUserProfile = async (user) => {
  if (!user) return;

  if (user.displayName) return;

  let displayName = '';

  if (user.email) {
    displayName = user.email.split('@')[0];
  } else {
    displayName = `User-${user.uid.slice(0, 6)}`;
  }

  await updateProfile(user, {
    displayName,
  });
};
