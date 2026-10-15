import { build } from 'vite';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';

await build();
await mkdir('dist/computer-engineering', { recursive: true });
const index = await readFile('dist/index.html', 'utf8');
const departmentIndex = index.replace(/<title>.*?<\/title>/, '<title>Computer Engineering — SNJB College of Engineering</title>').replace('Explore engineering at SNJB’s Late Sau. Kantabai Bhavarlalji Jain College of Engineering, Chandwad. Programmes, learning, campus life and Computer Engineering.', 'Discover the Computer Engineering programme at SNJB, Chandwad: curriculum by batch, faculty, laboratories, student work and published outcomes.').replace(/\s*<link rel="preload" as="image"[^>]+>/g, '').replace('</head>', '    <link rel="preload" as="image" href="/campaign/learning-desktop.webp" media="(min-width: 768px)" />\n    <link rel="preload" as="image" href="/campaign/learning-phone.webp" media="(max-width: 767px)" />\n  </head>');
await writeFile('dist/computer-engineering/index.html', departmentIndex);
await mkdir('dist/explore', { recursive: true });
const directoryIndex = index.replace(/<title>.*?<\/title>/, '<title>Explore SNJB — Complete resource directory</title>').replace(/\s*<link rel="preload" as="image"[^>]+>/g, '');
await writeFile('dist/explore/index.html', directoryIndex);
for (const [route,title] of [['student-life','Campus life — SNJB College of Engineering'],['apply','Apply — SNJB College of Engineering']]) {
  await mkdir(`dist/${route}`, { recursive:true });
  await writeFile(`dist/${route}/index.html`, index.replace(/<title>.*?<\/title>/, `<title>${title}</title>`).replace(/\s*<link rel="preload" as="image"[^>]+>/g, ''));
}
await copyFile('dist/index.html', 'dist/404.html');
console.log('Prepared Home, Computer Engineering, Explore, Campus life and Apply entries.');
