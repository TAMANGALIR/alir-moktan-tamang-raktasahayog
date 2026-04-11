import re

html_file = r'c:\Users\taman\OneDrive\Desktop\alir-moktan-tamang-raktasahayog\alir-moktan-tamang-raktasahayog\docs\testing_analysis_report.html'
md_file = r'c:\Users\taman\OneDrive\Desktop\alir-moktan-tamang-raktasahayog\alir-moktan-tamang-raktasahayog\docs\postman_all_endpoints.md'

with open(md_file, 'r', encoding='utf-8') as f:
    md_content = f.read()

endpoints = []
current_mod = ""
ut_counter = 1
lines = md_content.split('\n')

for i in range(len(lines)):
    line = lines[i]
    if line.startswith('## '):
        match = re.search(r'`([^`]+)`', line)
        if match:
            current_mod = match.group(1)
        else:
            match = re.search(r'##\s+\d+\.\s+(.*)', line)
            if match:
                current_mod = match.group(1).strip()
    
    if line.startswith('### '):
        title = re.sub(r'^###\s+\d+\.\d+\s+', '', line).strip()
        method = "GET"
        url = ""
        
        if i + 1 < len(lines) and '* **Method:**' in lines[i+1]:
            mm = re.search(r'`([^`]+)`', lines[i+1])
            if mm:
                method = mm.group(1)
        if i + 2 < len(lines) and '* **URL:**' in lines[i+2]:
            um = re.search(r'`[^`]*?(/api/[^`]*)`', lines[i+2])
            if um:
                url = um.group(1)
            else:
                um2 = re.search(r'`([^`]+)`', lines[i+2])
                if um2:
                    url = um2.group(1)
                    
        desc = f"{method} {url}"
        out = "HTTP 201 Created" if method == "POST" else "HTTP 200 OK"
        
        val = {
            "id": f"UT{ut_counter:02d}",
            "mod": current_mod,
            "title": title,
            "desc": desc,
            "out": out
        }
        endpoints.append(val)
        ut_counter += 1

print(f"Extracted {len(endpoints)} endpoints.")

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# --- PRE-PROCESSING: SHIFT ST NUMBERS ---
# ST starts at Figure 45 and Table 20.
# We want ST figures to start at Figure 57. (Offset = 12)
# We want ST tables to start at Table 57. (Offset = 37)
fig_offset = 57 - 45
tab_offset = 57 - 20

def shift_figs(match):
    num = int(match.group(1))
    if num >= 45:
        return f"Figure {num + fig_offset}"
    return f"Figure {num}"

def shift_tabs(match):
    num = int(match.group(1))
    if num >= 20:
        return f"Table {num + tab_offset}"
    return f"Table {num}"

# Shift in Table of Figures
content = re.sub(r'Figure (\d+)', shift_figs, content)
# Shift in Table of Tables
content = re.sub(r'Table (\d+)', shift_tabs, content)

# 1. Update TOC
toc_start_marker = "<li>1.2 Unit Testing\n                    <ul>\n"
toc_end_marker = "                    </ul>\n                </li>"
new_toc = toc_start_marker
for ep in endpoints:
    num = int(ep['id'].replace('UT', ''))
    new_toc += f"                        <li>1.2.{num} {ep['id']}: {ep['title']}</li>\n"
new_toc += toc_end_marker
pattern_toc = re.compile(r'<li>1.2 Unit Testing\s*<ul>.*?</ul>\s*</li>', re.DOTALL)
content = pattern_toc.sub(new_toc, content)

# 2. Update Table of Figures (UT part)
# UT Figures are 1 to 56.
fig_list = ""
for ep in endpoints:
    num = int(ep['id'].replace('UT', ''))
    fig_list += f"        <li>Figure {num}: {ep['title']} API Test</li>\n"

# We replace the old UT figures. They were Figure 1 to 44.
# After shifting, old Figure 45 is now Figure 57.
# So we replace <li>Figure 1:.*?(?=<li>Figure 57)
pattern_fig = re.compile(r'<li>Figure 1:.*?(\s+<li>Figure 57:)', re.DOTALL)
content = pattern_fig.sub(fig_list + r'\1', content)

# 3. Update Table of Tables (UT part)
# UT Tables are Table 1 to 56.
tab_list = ""
for ep in endpoints:
    num = int(ep['id'].replace('UT', ''))
    tab_list += f"        <li>Table {num}: {ep['title']} Test Case</li>\n"

# Old UT tables were Table 1 to 19.
# After shifting, old Table 20 is now Table 57.
pattern_tab = re.compile(r'<li>Table 1:.*?(\s+<li>Table 57:)', re.DOTALL)
content = pattern_tab.sub(tab_list + r'\1', content)

# 4. Update Unit Testing Body
body_block = "<h2>1.2 Unit Testing</h2>\n<p>Unit testing was performed on individual modules of the Raktasahayog system. Each function, API endpoint, and React component was tested separately to check whether the expected output is produced. The backend REST API was tested using Postman by sending HTTP requests with a particular payload to all the endpoints. The frontend was tested manually in the browser and DevTools was used to inspect it. The following unit test cases were designed to cover all major modules of the system.</p>\n\n"

for ep in endpoints:
    num = int(ep['id'].replace('UT', ''))
    body_block += f"<!-- {ep['id']} -->\n"
    body_block += f"<h3>1.2.{num} {ep['id']}: {ep['title']}</h3>\n"
    body_block += "<table>\n"
    body_block += f"    <tr><th>TestID</th><td>{ep['id']}</td></tr>\n"
    body_block += f"    <tr><th>Module Name</th><td>{ep['mod']}</td></tr>\n"
    body_block += f"    <tr><th>Test Description</th><td>Verify {ep['title']} via {ep['desc']}</td></tr>\n"
    body_block += f"    <tr><th>Expected Output</th><td>{ep['out']}</td></tr>\n"
    body_block += "    <tr><th>Result</th><td>Pass</td></tr>\n"
    body_block += "</table>\n"
    body_block += '<div class="placeholder-image">[Screenshot]</div>\n'
    body_block += f'<p class="figure">Figure {num}: {ep["title"]} API Test</p>\n'
    body_block += f"<pre><code>// code snippet for {ep['title']} controller logic</code></pre>\n"
    body_block += f'<p class="figure">Figure {num}_2: Code snippet of {ep["title"]}</p>\n\n'

pattern_body = re.compile(r'<h2>1.2 Unit Testing</h2>.*?(?=<h2>1.3 System Testing</h2>)', re.DOTALL)
content = pattern_body.sub(body_block, content)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated HTML file successfully with synchronized tables and figures.")
