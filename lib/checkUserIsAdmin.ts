import { User } from '@/models/user';

async function checkUserIsAdmin(userId: string): Promise<boolean> {
  try {
    const user = await User.findById(userId);
    return user.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export { checkUserIsAdmin };
