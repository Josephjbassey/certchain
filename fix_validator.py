with open('supabase/functions/_shared/validators.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for idx, line in enumerate(lines):
    if 'body = await req.json();' in line:
        new_lines.append(line)
        new_lines.append('    if (typeof body !== "object" || body === null || Array.isArray(body)) {\n')
        new_lines.append('      throw badRequestError("Request body must be a JSON object");\n')
        new_lines.append('    }\n')
    else:
        # also apply the unknown type updates here if any match
        line = line.replace('any[]', 'unknown[]')
        line = line.replace('(value: any)', '(value: unknown)')
        new_lines.append(line)

with open('supabase/functions/_shared/validators.ts', 'w') as f:
    f.writelines(new_lines)
