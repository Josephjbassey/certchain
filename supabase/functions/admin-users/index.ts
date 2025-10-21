import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.22.4";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RoleEnum = z.enum([
  "super_admin",
  "institution_admin",
  "instructor",
  "candidate",
]);

const BaseSchema = z.object({
  action: z.enum(["list", "create", "update", "delete"]).describe("Operation"),
});

const ListSchema = BaseSchema.extend({
  action: z.literal("list"),
  page: z.number().int().min(1).optional().default(1),
  perPage: z.number().int().min(1).max(100).optional().default(25),
  search: z.string().optional(),
});

const CreateSchema = BaseSchema.extend({
  action: z.literal("create"),
  email: z.string().email(),
  role: RoleEnum,
  institutionId: z.string().uuid().optional(),
});

const UpdateSchema = BaseSchema.extend({
  action: z.literal("update"),
  userId: z.string().uuid(),
  role: RoleEnum.optional(),
  disabled: z.boolean().optional(),
  institutionId: z.string().uuid().optional(),
});

const DeleteSchema = BaseSchema.extend({
  action: z.literal("delete"),
  userId: z.string().uuid(),
});

type Payload = z.infer<typeof ListSchema | typeof CreateSchema | typeof UpdateSchema | typeof DeleteSchema>;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Env requirements
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment configuration");
    }

    // Auth: verify requester and role via profiles
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ success: false, error: "Missing Authorization header" }, 401);
    }

    const supabaseAuthed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userData, error: userErr } = await supabaseAuthed.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const requesterId = userData.user.id;

    // Check if user has super_admin role
    const { data: roles, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requesterId);

    if (roleErr) {
      throw roleErr;
    }

    const userRoles = roles?.map(r => r.role) || [];
    if (!userRoles.includes('super_admin')) {
      return json({ success: false, error: "Forbidden: super admin only" }, 403);
    }

    // Parse payload
    const raw = await req.json();
    const action = raw?.action as string | undefined;

    let payload: Payload;
    switch (action) {
      case "list":
        payload = ListSchema.parse(raw);
        return await handleList(payload, supabaseAdmin);
      case "create":
        payload = CreateSchema.parse(raw);
        return await handleCreate(payload, supabaseAdmin);
      case "update":
        payload = UpdateSchema.parse(raw);
        return await handleUpdate(payload, supabaseAdmin);
      case "delete":
        payload = DeleteSchema.parse(raw);
        return await handleDelete(payload, supabaseAdmin);
      default:
        return json({ success: false, error: "Invalid action" }, 400);
    }
  } catch (error: any) {
    console.error("admin-users error:", error);
    return json({ success: false, error: error?.message || "Internal error" }, 500);
  }
});

async function handleList(payload: z.infer<typeof ListSchema>, supabaseAdmin: any) {
  const { page, perPage, search } = payload;

  // Supabase admin list users (auth table)
  // @ts-ignore types for admin API are available at runtime
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
  if (error) return json({ success: false, error: error.message }, 500);

  const users = data?.users || [];
  const userIds = users.map((u: any) => u.id);

  // Fetch profiles and roles
  const { data: profiles, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, institution_id")
    .in("id", userIds);

  if (profErr) return json({ success: false, error: profErr.message }, 500);

  const { data: userRoles, error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .select("user_id, role")
    .in("user_id", userIds);

  if (roleErr) return json({ success: false, error: roleErr.message }, 500);

  const profileMap = new Map(profiles?.map((p: any) => [p.id, p]));
  const roleMap = new Map(userRoles?.map((r: any) => [r.user_id, r.role]));

  let result = users.map((u: any) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    role: roleMap.get(u.id) || 'candidate',
    institution_id: (profileMap.get(u.id) as any)?.institution_id || null,
  }));

  // Optional simple search by email
  if (search && search.trim().length > 0) {
    const s = search.toLowerCase();
    result = result.filter((u: any) => String(u.email || "").toLowerCase().includes(s));
  }

  return json({ success: true, page, perPage, count: result.length, users: result });
}

async function handleCreate(payload: z.infer<typeof CreateSchema>, supabaseAdmin: any) {
  const { email, role, institutionId } = payload;

  // Create auth user (send invite email automatically by default)
  // @ts-ignore
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: false,
  });
  if (createErr) return json({ success: false, error: createErr.message }, 500);

  const user = created.user;
  if (!user?.id) return json({ success: false, error: "Failed to create user" }, 500);

  // Insert profile row
  const { error: profErr } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: user.id,
      email,
      institution_id: institutionId ?? null,
    });
  if (profErr) return json({ success: false, error: profErr.message }, 500);

  // Insert role
  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .insert({
      user_id: user.id,
      role,
    });
  if (roleErr) return json({ success: false, error: roleErr.message }, 500);

  return json({ success: true, userId: user.id, email, role, institutionId: institutionId ?? null });
}

async function handleUpdate(payload: z.infer<typeof UpdateSchema>, supabaseAdmin: any) {
  const { userId, role, disabled, institutionId } = payload;

  const profilePatch: Record<string, unknown> = {};
  if (typeof institutionId !== "undefined") profilePatch.institution_id = institutionId;

  if (Object.keys(profilePatch).length > 0) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update(profilePatch)
      .eq("id", userId);

    if (error) return json({ success: false, error: error.message }, 500);
  }

  // Update role if specified
  if (role) {
    // Delete existing roles
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    
    // Insert new role
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role });
    
    if (roleErr) return json({ success: false, error: roleErr.message }, 500);
  }

  return json({ success: true, userId, updated: { role, ...profilePatch } });
}

async function handleDelete(payload: z.infer<typeof DeleteSchema>, supabaseAdmin: any) {
  const { userId } = payload;

  // Delete auth user first
  // @ts-ignore
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (delErr) return json({ success: false, error: delErr.message }, 500);

  // Cleanup profile row
  const { error: profErr } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", userId);
  if (profErr) return json({ success: false, error: profErr.message }, 500);

  return json({ success: true, userId });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
