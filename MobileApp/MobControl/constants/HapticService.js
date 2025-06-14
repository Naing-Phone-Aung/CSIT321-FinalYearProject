import * as Haptics from 'expo-haptics';

/**
 * Triggers a haptic feedback notification to signal success.
 * Use for positive actions like successful form submission, item creation, etc.
 */
const triggerSuccess = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Triggers a haptic feedback notification to signal a warning.
 * Use for non-critical alerts or actions that require attention.
 */
const triggerWarning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Triggers a haptic feedback notification to signal an error.
 * Use for failed actions, validation errors, etc.
 */
const triggerError = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/**
 * Triggers a light impact haptic feedback.
 * Great for gentle taps or minor UI interactions.
 */
const triggerImpactLight = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Triggers a medium impact haptic feedback.
 * The most common choice for standard button presses and general actions.
 */
const triggerImpactMedium = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Triggers a heavy impact haptic feedback.
 * Use for significant actions or "destructive" operations like deleting something.
 */
const triggerImpactHeavy = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Triggers a selection haptic feedback.
 * Use when a user is scrubbing through a list or a picker wheel.
 */
const triggerSelection = () => {
  Haptics.selectionAsync();
};

export const HapticFeedback = {
  success: triggerSuccess,
  warning: triggerWarning,
  error: triggerError,
  impactLight: triggerImpactLight,
  impactMedium: triggerImpactMedium,
  impactHeavy: triggerImpactHeavy,
  selection: triggerSelection,
};