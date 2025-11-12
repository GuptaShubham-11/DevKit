import { User } from '@/models/user';

export async function checkUserIsAdmin(userId: string): Promise<boolean> {
  try {
    const user = await User.findById(userId);
    return user.isAdmin || false;
  } catch {
    // console.error('Error checking admin status:', error);
    return false;
  }
}
