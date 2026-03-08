// Re-export all hooks for backward compatibility
export { useDashboardStats } from "./useDashboard";
export { useProfiles } from "./useProfiles";
export { useConnections, usePendingRequests, useSendConnection, useRespondConnection } from "./useConnections";
export { useCoaches, useCoachingSessions, useBookSession, useCancelSession, useRateSession } from "./useCoaching";
export { useEvents, useRegisterEvent, useUnregisterEvent } from "./useEvents";
export { useObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from "./useObjectives";
export { useNotifications } from "./useNotifications";
export { usePosts, useInfinitePosts, useToggleReaction, useUserReactions, useComments, useAddComment, useDeletePost } from "./useFeed";
export { useUserBadges, useAllBadges } from "./useBadges";
