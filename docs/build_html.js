const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const docsDir = __dirname;
const sprints = ['Sprint0', 'Sprint1', 'Sprint2', 'Sprint3', 'Sprint4', 'Sprint5'];
const files = ['Sprint_Backlog.md', 'Feature_Work_Evidence.md', 'Resources_Used.md'];

let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blood Donation Management System - FYP Documentation</title>
    <style>
        :root { --primary-color: #e53e3e; --text-color: #2d3748; --bg-color: #f7fafc; --border-color: #e2e8f0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.7; color: var(--text-color); margin: 0; display: flex; background: var(--bg-color); }
        .sidebar { width: 320px; height: 100vh; position: sticky; top: 0; background: white; border-right: 1px solid var(--border-color); padding: 2.5rem 1.5rem; overflow-y: auto; box-shadow: 2px 0 10px rgba(0,0,0,0.03); box-sizing: border-box; }
        .sidebar h2 { font-size: 1.1rem; color: var(--primary-color); margin-top: 2rem; margin-bottom: 0.8rem; border-bottom: 2px solid var(--primary-color); padding-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .sidebar .top-title { font-size: 1.5rem; border: none; text-align: center; margin-top: 0; margin-bottom: 2rem; color: #1a202c; text-transform: none; letter-spacing: normal; }
        .sidebar ul { list-style: none; padding: 0; margin: 0; }
        .sidebar li { margin-bottom: 0.6rem; }
        .sidebar a { text-decoration: none; color: #4a5568; font-size: 0.95rem; font-weight: 500; transition: all 0.2s; display: block; padding: 0.3rem 0; border-left: 2px solid transparent; padding-left: 10px; margin-left: -12px; }
        .sidebar a:hover { color: var(--primary-color); border-left-color: var(--primary-color); background: #fff5f5; }
        .content { flex: 1; padding: 4rem 6rem; max-width: 1000px; background: white; min-height: 100vh; box-shadow: -2px 0 15px rgba(0,0,0,0.02); margin: 0 auto; }
        h1, h2, h3, h4 { color: #1a202c; margin-top: 2.5rem; font-weight: 700; }
        h1 { font-size: 2.8rem; border-bottom: 3px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 2rem; line-height: 1.2; }
        h2 { font-size: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
        h3 { font-size: 1.5rem; color: #2d3748; }
        p, li { font-size: 1.1rem; color: #4a5568; }
        table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
        th, td { padding: 1rem 1.2rem; text-align: left; border-bottom: 1px solid var(--border-color); }
        th { background: #f8fafc; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; color: #4a5568; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:nth-child(even) { background-color: #fbfdff; }
        tbody tr:hover { background-color: #f7fafc; }
        pre { background: #1e293b; color: #f8fafc; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.95rem; margin: 2rem 0; line-height: 1.5; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
        code { font-family: 'Consolas', 'Monaco', monospace; background: #fee2e2; color: #b91c1c; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.9em; }
        pre code { background: transparent; color: inherit; padding: 0; box-shadow: none; }
        blockquote { border-left: 4px solid var(--primary-color); margin: 2rem 0; padding: 1rem 1.5rem; background: #fff5f5; color: #4a5568; font-style: italic; border-radius: 0 8px 8px 0; font-size: 1.1rem; }
        .section-wrapper { margin-bottom: 6rem; position: relative; }
        .section-wrapper::after { content: ''; display: block; width: 50px; height: 4px; background: var(--border-color); margin-top: 3rem; border-radius: 2px; }
        .section-wrapper:last-child::after { display: none; }
        .main-header { text-align: center; margin-bottom: 4rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border-color); }
        .main-header h1 { border: none; font-size: 3.5rem; margin-bottom: 1rem; padding-bottom: 0; color: #1a202c; }
        .main-header p { font-size: 1.4rem; color: #718096; margin: 0; }
        
        /* Smooth scrolling */
        html { scroll-behavior: smooth; }
        
        /* Anchor offset for sticky sidebar */
        [id] { scroll-margin-top: 2rem; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 class="top-title">FYP Documentation</h2>`;

sprints.forEach(sprint => {
    htmlContent += `\n        <h2>${sprint.replace('Sprint', 'Sprint ')}</h2>\n        <ul>`;
    files.forEach(file => {
        const id = `${sprint}_${file.replace('.md', '')}`;
        const title = file.replace(/_/g, ' ').replace('.md', '');
        htmlContent += `\n            <li><a href="#${id}">${title}</a></li>`;
    });
    htmlContent += `\n        </ul>`;
});

htmlContent += `
    </div>
    <div class="content">
        <div class="main-header">
            <h1>Blood Donation Management System</h1>
            <p>Final Year Project Complete Documentation<br/>Sprints 1 to 5</p>
        </div>`;

sprints.forEach(sprint => {
    files.forEach(file => {
        const filePath = path.join(docsDir, sprint, file);
        if (fs.existsSync(filePath)) {
            const mdContent = fs.readFileSync(filePath, 'utf8');
            const id = `${sprint}_${file.replace('.md', '')}`;
            htmlContent += `\n        <div id="${id}" class="section-wrapper">\n`;
            htmlContent += marked.parse(mdContent);
            htmlContent += `\n        </div>`;
        }
    });
});

htmlContent += `
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(docsDir, 'FYP_Documentation.html'), htmlContent);
console.log('Successfully generated FYP_Documentation.html!');
