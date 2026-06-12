import type {
  Category,
  ContentLanguage,
  EventStatus,
  Locality,
  ScraperType,
  AlertFrequency,
} from "./constants";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: Category;
  website_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  locality: Locality | null;
  latitude: number | null;
  longitude: number | null;
  languages: ContentLanguage[];
  image_url: string | null;
  source_url: string | null;
  description_en: string | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  organization_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  category: Category;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price: string | null;
  language: ContentLanguage | null;
  is_recurring: boolean;
  is_recurring_template: boolean;
  recurrence_parent_id: string | null;
  recurrence_interval_days: number;
  recurrence_description: string | null;
  source_url: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  organization?: Organization | null;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
  created_at: string;
};

export type NewsletterPreferences = {
  id: string;
  user_id: string | null;
  email: string;
  frequency: AlertFrequency;
  categories: Category[];
  organization_ids: string[];
  languages: ContentLanguage[];
  locale: string;
  manage_token: string;
  active: boolean;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ScrapingSource = {
  id: string;
  name: string;
  url: string;
  type: ScraperType;
  active: boolean;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
};
