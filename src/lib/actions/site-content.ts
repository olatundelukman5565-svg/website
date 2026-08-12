"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  updateAboutContent,
  updateContactInfo,
  updateHomepageContent,
} from "@/lib/data/site-content";
import { isRealFile, validateImageFile } from "@/lib/validation";
import { uploadImageFile } from "@/lib/upload";

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

function parsePairs(raw: string): { title: string; description: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("::");
      return { title: title.trim(), description: rest.join("::").trim() };
    });
}

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSocial(raw: string): { label: string; url: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("::");
      return { label: label.trim(), url: rest.join("::").trim() };
    });
}

export async function updateHomepageAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  const heroImage = formData.get("heroImage");
  let heroImageUrl: string | undefined;
  if (isRealFile(heroImage)) {
    const err = validateImageFile(heroImage);
    if (err) return { error: err };
    const uploaded = await uploadImageFile(heroImage, "site/hero");
    heroImageUrl = uploaded.url;
  }

  await updateHomepageContent({
    heroEyebrow: String(formData.get("heroEyebrow") || ""),
    heroTitle: String(formData.get("heroTitle") || ""),
    heroSubtitle: String(formData.get("heroSubtitle") || ""),
    ...(heroImageUrl ? { heroImageUrl } : {}),
    aboutBlurb: String(formData.get("aboutBlurb") || ""),
    whyChooseUs: parsePairs(String(formData.get("whyChooseUs") || "")),
    featuredProjectIds: formData.getAll("featuredProjectIds").map(String),
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateAboutAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  await updateAboutContent({
    intro: String(formData.get("intro") || ""),
    body: String(formData.get("body") || ""),
    approach: parsePairs(String(formData.get("approach") || "")),
    capabilities: parseLines(String(formData.get("capabilities") || "")),
  });

  revalidatePath("/about");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateContactAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  await updateContactInfo({
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    address: String(formData.get("address") || ""),
    hours: String(formData.get("hours") || ""),
    social: parseSocial(String(formData.get("social") || "")),
  });

  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  return { success: true };
}
