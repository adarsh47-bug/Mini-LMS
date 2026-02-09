/**
 * Usage Examples
 *
 * Demonstrates the unified notification system and other features.
 * All app feedback (success, error, warning, info) uses useNotification.
 */

import { useNotification } from '@/src/context';

// ============================================================================
// NOTIFICATION EXAMPLES — QUICK HELPERS
// ============================================================================

/**
 * Example: Convenience methods (recommended for most cases)
 */
export function ExampleQuickNotifications() {
  const notification = useNotification();

  const onLogin = () => notification.success('Welcome back, John!');
  const onError = () => notification.error('Failed to save changes.');
  const onWarning = () => notification.warning('Please allow camera access.');
  const onInfo = () => notification.info('You have been signed out.');

  return null;
}

// ============================================================================
// NOTIFICATION EXAMPLES — FULL CONFIG
// ============================================================================

/**
 * Example: Full notification with actions
 */
export function ExampleNotificationWithActions() {
  const { showNotification } = useNotification();

  const handleDelete = () => {
    showNotification({
      title: 'Post deleted',
      variant: 'delete',
      actions: [
        {
          label: 'Undo',
          onPress: () => {
            // Restore the post
            console.log('Undoing delete...');
          },
        },
      ],
    });
  };

  return null;
}

/**
 * Example 3: Bottom notification
 */
export function ExampleBottomNotification() {
  const { showNotification } = useNotification();

  const handleArchive = () => {
    showNotification({
      title: 'Moved to archive',
      variant: 'archive',
      position: 'bottom',
      duration: 3000,
    });
  };

  return null;
}

/**
 * Example 4: Custom notification
 */
export function ExampleCustomNotification() {
  const { showNotification } = useNotification();

  const handleCustomAction = () => {
    showNotification({
      title: 'New message received',
      variant: 'custom',
      duration: 5000,
      actions: [
        {
          label: 'View',
          onPress: () => {
            console.log('Viewing message...');
          },
        },
        {
          label: 'Dismiss',
          onPress: () => {
            console.log('Dismissing...');
          },
        },
      ],
    });
  };

  return null;
}

// ============================================================================
// REACT HOOK FORM + ZOD VALIDATION EXAMPLES
// ============================================================================

/**
 * Example: Using React Hook Form with Zod validation
 * 
 * This is the recommended approach used throughout the app.
 * See LoginScreen.tsx, RegisterScreen.tsx for full examples.
 */
import { loginSchema, type LoginInput } from '@/src/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export function ExampleReactHookFormValidation() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    // Form is valid, data is type-safe
    console.log('Valid data:', data);
    // Proceed with login...
  };

  // Use Controller to wrap inputs
  // <Controller
  //   control={control}
  //   name="username"
  //   render={({ field }) => (
  //     <ThemedInput {...field} error={errors.username?.message} />
  //   )}
  // />

  return null;
}
