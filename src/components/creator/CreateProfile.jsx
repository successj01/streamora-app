import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Image as ImageIcon,
  User,
  AtSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useCreator } from "../state/CreatorState";

// ==========================================
// Constants
// ==========================================

const CATEGORIES = [
  "Entertainment",
  "Gaming",
  "Music",
  "Sports",
  "Education",
  "Comedy",
  "Lifestyle",
  "Technology",
  "News",
];

const MAX_BIO_LENGTH = 160;
const MAX_USERNAME_LENGTH = 30;
const MAX_NAME_LENGTH = 50;
const MIN_USERNAME_LENGTH = 3;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

const USERNAME_PATTERN = /^[a-z0-9_]+$/;

const INITIAL_FORM_STATE = {
  name: "",
  username: "",
  bio: "",
  category: CATEGORIES[0],
  avatar: "",
  banner: "",
};

// ==========================================
// Helpers
// ==========================================

const normalizeUsername = (username) => {
  return username
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
};

const validateProfileForm = (formData) => {
  const name = formData.name.trim();
  const username = normalizeUsername(formData.username);

  if (!name) {
    return "Please enter your creator name.";
  }

  if (name.length > MAX_NAME_LENGTH) {
    return `Creator name cannot exceed ${MAX_NAME_LENGTH} characters.`;
  }

  if (!username) {
    return "Please choose a username.";
  }

  if (username.length < MIN_USERNAME_LENGTH) {
    return `Username must contain at least ${MIN_USERNAME_LENGTH} characters.`;
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return `Username cannot exceed ${MAX_USERNAME_LENGTH} characters.`;
  }

  if (!USERNAME_PATTERN.test(username)) {
    return "Username can only contain letters, numbers, and underscores.";
  }

  if (formData.bio.length > MAX_BIO_LENGTH) {
    return `Your bio cannot exceed ${MAX_BIO_LENGTH} characters.`;
  }

  return "";
};

const validateImageFile = (file) => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Please select a valid image file (PNG, JPEG, or WEBP).";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image size must be smaller than 5MB.";
  }

  return "";
};

// ==========================================
// Field Label
// ==========================================

const FieldLabel = ({ htmlFor, children }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-gray-300"
    >
      {children}
    </label>
  );
};

// ==========================================
// Error Message
// ==========================================

const FormError = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
    >
      <AlertCircle
        size={18}
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      />

      <span>{message}</span>
    </div>
  );
};

// ==========================================
// Create Profile
// ==========================================

const CreateProfile = () => {
  const navigate = useNavigate();

  const {
    createCreatorProfile,
    loading: creatorLoading,
  } = useCreator();

  const [formData, setFormData] = useState(
    INITIAL_FORM_STATE
  );

  const [avatarPreview, setAvatarPreview] =
    useState("");

  const [bannerPreview, setBannerPreview] =
    useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [error, setError] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // Store generated object URLs.
  const objectUrlsRef = useRef({
    avatar: "",
    banner: "",
  });

  // ==========================================
  // Cleanup Object URLs
  // ==========================================

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      Object.values(objectUrls).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // ==========================================
  // Loading State
  // ==========================================

  const isSubmitting =
    submitting || creatorLoading;

  // ==========================================
  // Image Input Accept
  // ==========================================

  const imageInputAccept = useMemo(
    () => ACCEPTED_IMAGE_TYPES.join(","),
    []
  );

  // ==========================================
  // Handle Text Input
  // ==========================================

  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));

      if (error) {
        setError("");
      }
    },
    [error]
  );

  // ==========================================
  // Handle Image Upload
  // ==========================================

  const handleImageChange = useCallback(
    (event, field) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const validationMessage =
        validateImageFile(file);

      if (validationMessage) {
        setError(validationMessage);

        // Allow the same file to be selected again.
        event.target.value = "";

        return;
      }

      // Revoke previous URL for this field.
      const previousUrl =
        objectUrlsRef.current[field];

      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      // Create new preview URL.
      const previewUrl =
        URL.createObjectURL(file);

      objectUrlsRef.current[field] =
        previewUrl;

      if (field === "avatar") {
        setAvatarPreview(previewUrl);
        setAvatarFile(file);
      }

      if (field === "banner") {
        setBannerPreview(previewUrl);
        setBannerFile(file);
      }

      setFormData((previous) => ({
        ...previous,
        [field]: previewUrl,
      }));

      setError("");
    },
    []
  );

  // ==========================================
  // Submit Profile
  // ==========================================

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      setError("");

      const validationMessage =
        validateProfileForm(formData);

      if (validationMessage) {
        setError(validationMessage);
        return;
      }

      setSubmitting(true);

      try {
        const profile = {
          name: formData.name.trim(),

          username: normalizeUsername(
            formData.username
          ),

          bio: formData.bio.trim(),

          isCreator: true,

          files: {
            avatar: avatarFile,
            banner: bannerFile,
          },
        };

        await createCreatorProfile(profile);

        navigate("/creator");
      } catch (submitError) {
        setError(
          submitError?.message ||
            submitError?.response?.data?.message ||
            "Unable to create your creator profile. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      formData,
      avatarFile,
      bannerFile,
      createCreatorProfile,
      navigate,
    ]
  );

  // ==========================================
  // Bio Character Count
  // ==========================================

  const bioCharacterCount =
    formData.bio.length;

  // ==========================================
  // Render
  // ==========================================

  return (
    <main className="min-h-screen bg-[#0f0f10] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-red-500">
            Creator Studio
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Create your creator profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Build your Streamora creator identity
            and start connecting with your audience.
          </p>
        </div>

        {/* Profile Card */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141416] shadow-xl">

          {/* Banner */}

          <div className="relative h-48 bg-[#1b1b1e] sm:h-56">

            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Creator banner preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-600">
                <ImageIcon
                  size={40}
                  aria-hidden="true"
                />
              </div>
            )}

            <label className="absolute right-4 top-4 flex cursor-pointer items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold backdrop-blur transition hover:bg-black/90">
              <Camera
                size={16}
                aria-hidden="true"
              />

              Change banner

              <input
                type="file"
                accept={imageInputAccept}
                onChange={(event) =>
                  handleImageChange(
                    event,
                    "banner"
                  )
                }
                className="hidden"
                aria-label="Upload banner image"
              />
            </label>
          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="p-6 sm:p-8"
          >

            {/* Avatar */}

            <div className="-mt-16 mb-8">
              <label className="group relative block h-28 w-28 cursor-pointer overflow-hidden rounded-full border-4 border-[#141416] bg-[#1b1b1e]">

                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Creator avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-600">
                    <User
                      size={38}
                      aria-hidden="true"
                    />
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <Camera
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <input
                  type="file"
                  accept={imageInputAccept}
                  onChange={(event) =>
                    handleImageChange(
                      event,
                      "avatar"
                    )
                  }
                  className="hidden"
                  aria-label="Upload avatar image"
                />
              </label>
            </div>

            {/* Error */}

            <FormError message={error} />

            {/* Fields */}

            <div className="grid gap-5 sm:grid-cols-2">

              {/* Creator Name */}

              <div>
                <FieldLabel htmlFor="name">
                  Creator name
                </FieldLabel>

                <div className="relative">
                  <User
                    size={18}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your creator name"
                    maxLength={MAX_NAME_LENGTH}
                    autoComplete="name"
                    required
                    className="w-full rounded-lg border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                  />
                </div>
              </div>

              {/* Username */}

              <div>
                <FieldLabel htmlFor="username">
                  Username
                </FieldLabel>

                <div className="relative">
                  <AtSign
                    size={18}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                  />

                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username"
                    maxLength={
                      MAX_USERNAME_LENGTH
                    }
                    autoComplete="username"
                    required
                    className="w-full rounded-lg border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                  />
                </div>

                <p className="mt-1 text-xs text-gray-600">
                  Letters, numbers, and underscores
                  only.
                </p>
              </div>

              {/* Category */}

              <div className="sm:col-span-2">
                <FieldLabel htmlFor="category">
                  Primary category
                </FieldLabel>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                >
                  {CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Bio */}

              <div className="sm:col-span-2">
                <FieldLabel htmlFor="bio">
                  Bio
                </FieldLabel>

                <div className="relative">
                  <FileText
                    size={18}
                    aria-hidden="true"
                    className="absolute left-3 top-3 text-gray-600"
                  />

                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength={MAX_BIO_LENGTH}
                    rows={4}
                    placeholder="Tell your audience about yourself..."
                    className="w-full resize-none rounded-lg border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                  />
                </div>

                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-gray-600">
                    {bioCharacterCount}/
                    {MAX_BIO_LENGTH}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              {/* Cancel */}

              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-gray-400 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Submit */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                      aria-hidden="true"
                    />

                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={17}
                      aria-hidden="true"
                    />

                    Create profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CreateProfile;