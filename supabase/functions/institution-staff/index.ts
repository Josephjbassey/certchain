import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.22.4";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RoleEnum = z.enum(["instructor", "issuer"]);

const BaseSchema = z.object({
  action: z.enum(["list", "add", "remove"]).describe("Operation"),
});

const ListSchema = BaseSchema.extend({
  action: z.literal("list"),
  institutionId: z.string().uuid(),
  search: z.string().optional(),
});

const AddSchema = BaseSchema.extend({
  action: z.literal("add"),
  institutionId: z.string().uuid(),
  // Either provide an existing userId OR an email to invite/create
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  role: RoleEnum.default("instructor"),
}).refine((d) => d.userId || d.email, {
  message: "Provide either userId or email",
  path: ["userId"],
});

const RemoveSchema = BaseSchema.extend({
  action: z.literal("remove"),
  institutionId: z.string().uuid(),
  userId: z.string().uuid(),
});

type Payload =
  | z.infer<typeof ListSchema>
  | z.infer<typeof AddSchema>
  | z.infer<typeof RemoveSchema>;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment configuration");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ success: false, error: "Missing Authorization header" }, 401);

    const supabaseAuthed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userData, error: userErr } = await supabaseAuthed.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const requesterId = userData.user.id;

    // Load requester profile and role/institution
    const { data: requesterProfile, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role, institution_id")
      .eq("id", requesterId)
      .maybeSingle();

    if (profErr) throw profErr;
    if (!requesterProfile) return json({ success: false, error: "Profile not found" }, 403);

    // Parse payload
    const raw = await req.json();
    const action = raw?.action as string | undefined;

    let payload: Payload;
    switch (action) {
      case "list":
        payload = ListSchema.parse(raw);
        await authorizeInstitutionAccess(requesterProfile, payload.institutionId);
        return await handleList(payload, supabaseAdmin);
      case "add":
        payload = AddSchema.parse(raw);
        await authorizeInstitutionAccess(requesterProfile, payload.institutionId);
        return await handleAdd(payload, supabaseAdmin);
      case "remove":
        payload = RemoveSchema.parse(raw);
        await authorizeInstitutionAccess(requesterProfile, payload.institutionId);
        return await handleRemove(payload, supabaseAdmin);
      default:
        return json({ success: false, error: "Invalid action" }, 400);
    }
  } catch (error: any) {
    console.error("institution-staff error:", error);
    return json({ success: false, error: error?.message || "Internal error" }, 500);
  }
});

async function authorizeInstitutionAccess(
  requester: { role: string; institution_id: string | null },
  targetInstitutionId: string,
) {
  // super_admin/admin can manage any institution
  if (requester.role === "super_admin" || requester.role === "admin") return;

  // institution_admin can manage their own institution
  if (requester.role === "institution_admin" && requester.institution_id === targetInstitutionId) return;

  throw new Error("Forbidden: not allowed to manage this institution");
}

async function handleList(payload: z.infer<typeof ListSchema>, supabaseAdmin: ReturnType<typeof createClient>) {
  const { institutionId, search } = payload;

  // Join institution_staff with profiles to present staff details
  const { data, error } = await supabaseAdmin
    .from("institution_staff")
    .select(
      `user_id, institution_id, profiles:profiles!institution_staff_user_id_fkey(id, email, role, disabled)`,
    )
    .eq("institution_id", institutionId);

  if (error) return json({ success: false, error: error.message }, 500);

  let staff = (data || []).map((row: any) => ({
    userId: row.user_id,
    institutionId: row.institution_id,
    email: row.profiles?.email ?? null,
    role: row.profiles?.role ?? null,
    disabled: row.profiles?.disabled ?? false,
  }));

  if (search && search.trim().length > 0) {
    const s = search.toLowerCase();
    staff = staff.filter((s0) => String(s0.email || "").toLowerCase().includes(s));
  }

  return json({ success: true, institutionId, count: staff.length, staff });
}

async function handleAdd(payload: z.infer<typeof AddSchema>, supabaseAdmin: ReturnType<typeof createClient>) {
  const { institutionId, userId, email } = payload;

  let targetUserId = userId || null;

  if (!targetUserId) {
    // Create and invite a new user via email
    // @ts-ignore
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: email!,
      email_confirm: false,
    });
    if (createErr) return json({ success: false, error: createErr.message }, 500);
    targetUserId = created?.user?.id || null;
    if (!targetUserId) return json({ success: false, error: "Failed to create user" }, 500);

    // Insert/update profile with role=instructor and institution
    const { error: profErr } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: targetUserId, email, role: "instructor", institution_id: institutionId, disabled: false }, {
        onConflict: "id",
      });
    if (profErr) return json({ success: false, error: profErr.message }, 500);
  } else {
    // Existing user: attach to institution and set role to instructor if not already
    const { error: profUpdErr } = await supabaseAdmin
      .from("profiles")
      .update({ institution_id: institutionId, role: "instructor" })
      .eq("id", targetUserId);
    if (profUpdErr) return json({ success: false, error: profUpdErr.message }, 500);
  }

  // Upsert into institution_staff
  const { error: linkErr } = await supabaseAdmin
    .from("institution_staff")
    .upsert({ institution_id: institutionId, user_id: targetUserId! }, { onConflict: "institution_id,user_id" });
  if (linkErr) return json({ success: false, error: linkErr.message }, 500);

  return json({ success: true, institutionId, userId: targetUserId });
}

async function handleRemove(payload: z.infer<typeof RemoveSchema>, supabaseAdmin: ReturnType<typeof createClient>) {
  const { institutionId, userId } = payload;

  // Remove link from institution_staff
  const { error: delErr } = await supabaseAdmin
    .from("institution_staff")
    .delete()
    .eq("institution_id", institutionId)
    .eq("user_id", userId);

  if (delErr) return json({ success: false, error: delErr.message }, 500);

  // Disassociate institution on profile (role unchanged; adjust from admin panel if needed)
  const { error: profErr } = await supabaseAdmin
    .from("profiles")
    .update({ institution_id: null })
    .eq("id", userId);

  if (profErr) return json({ success: false, error: profErr.message }, 500);

  return json({ success: true, institutionId, userId });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
