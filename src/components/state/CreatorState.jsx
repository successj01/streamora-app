import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import { normalizeUser } from "../../utils/streamData";

const CreatorContext = createContext(null);

/**
 * Proxies the authenticated user's public profile as the single source of
 * truth for a Streamora "creator". Any non-negative creator data (bio,
 * stats, streams) lives on the user/API and this context simply mirrors it.
 */
const CreatorProvider = ({ children }) => {
  const { user, isAuthenticated, updateUser } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    let cancelled = false;

    userService
      .getProfile()
      .then((data) => {
        if (cancelled) return;

        const updated = data?.user || data;
        if (!updated?.username) return;

        updateUser(updated);
      })
      .catch(() => {
        // keep cached user / silent
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?._id]);

  const createCreatorProfile = useCallback(
    async ({ name, bio, username, files = {} } = {}) => {
      const data = await userService.updateProfileWithFiles(
        {
          name,
          bio,
          username,
          isCreator: true,
        },
        files
      );

      const updated = data?.user || data;
      if (updated?.username) {
        await updateUser(updated);
      }

      return updated;
    },
    [updateUser]
  );

  const updateCreatorProfile = useCallback(
    (updates) => {
      return createCreatorProfile(updates);
    },
    [createCreatorProfile]
  );

  const clearCreatorProfile = useCallback(() => {
    return userService.updateProfile({ isCreator: false });
  }, []);

  const clearError = useCallback(() => {}, []);

  const value = useMemo(() => {
    const creator = user ? normalizeUser(user) : null;

    return {
      creatorProfile: creator?.isCreator ? creator : null,
      loading: !user && isAuthenticated,
      error: "",

      createCreatorProfile,
      updateCreatorProfile,
      clearCreatorProfile,
      clearError,
    };
  }, [
    user,
    isAuthenticated,
    createCreatorProfile,
    updateCreatorProfile,
    clearCreatorProfile,
    clearError,
  ]);

  return (
    <CreatorContext.Provider value={value}>
      {children}
    </CreatorContext.Provider>
  );
};

export const useCreator = () => {
  const context = useContext(CreatorContext);

  if (!context) {
    throw new Error(
      "useCreator must be used inside a CreatorProvider."
    );
  }

  return context;
};

export { CreatorProvider };

export default CreatorContext;