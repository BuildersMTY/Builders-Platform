# Buildmancer Static Waitlist Deploy

This folder is a standalone static landing page. It does not need the Next app,
backend, app routes, or local JSON waitlist endpoint.

## Files

- `index.html` - the complete landing page.
- `assets/builderslogo2.svg` - Buildmancer icon and favicon.
- `assets/buildmancer-demo.mp4` - demo video used in the viewport.
- `config.example.js` - copy this to `config.js` and fill Supabase values.
- `supabase/schema.sql` - table, grants, and Row Level Security policy.

## 1. Create Supabase Project

1. Create a project in Supabase.
2. Open the SQL Editor.
3. Run `supabase/schema.sql`.

The table is `public.waitlist_signups`. RLS is enabled and only anonymous
inserts are granted. There is no public select policy, so visitors can add
themselves but cannot read the list.

## 2. Get Supabase Client Values

In the Supabase dashboard, copy:

- Project URL
- Publishable key, usually formatted like `sb_publishable_...`

Supabase currently recommends publishable keys for public browser clients. Do
not put a secret key or service role key into a static site.

## 3. Configure The Static Page

Create `config.js` next to `index.html`:

```js
window.BUILDMANCER_WAITLIST_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabasePublishableKey: "sb_publishable_...",
  tableName: "waitlist_signups",
};
```

Keep `config.example.js` as the template. Upload `config.js` with the site.

## 4. Deploy

You can deploy the contents of `static-waitlist/` to any static host:

- Netlify: drag the `static-waitlist` folder into the Netlify deploy UI.
- Vercel: create a project with `static-waitlist` as the root and no build command.
- Cloudflare Pages: direct upload the folder or connect it as the project root.
- S3/R2/static hosting: upload all files preserving paths.

The final deployed structure must look like:

```text
/
  index.html
  config.js
  assets/
    builderslogo2.svg
    buildmancer-demo.mp4
```

## 5. Test

1. Open the deployed URL.
2. Click `Watch demo`; it should scroll to the video viewport.
3. Submit a real email.
4. Confirm a new row appears in Supabase table editor under
   `waitlist_signups`.
5. Try submitting the same email again. It should show the duplicate-friendly
   message instead of adding a second row.

## Notes

- This is a static browser-only integration. The publishable key is visible by
  design; RLS is what protects the table.
- The SQL grants only `insert` to `anon`; no `select`, `update`, or `delete` is
  granted.
- For bot reduction, the form includes a hidden `company` honeypot field.
- If you later need stricter abuse protection, add a Supabase Edge Function,
  Turnstile, or a server endpoint.
