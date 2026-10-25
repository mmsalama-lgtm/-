/* Accounts and cloud save — fill both values from Supabase: Project Settings → API (or Data API).
   url: the Project URL, like https://abcdefghijkl.supabase.co
   key: the anon / publishable key (safe to publish: the database rules decide what each user can read and write).
   Leave them empty to keep the platform as it is, with everything in the browser. Never put the service_role key here. */
window.CIA_CLOUD = {
  url: "",
  key: ""
};
