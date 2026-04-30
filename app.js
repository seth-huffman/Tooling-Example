(() => {
    // Fixed variant definitions: suffix, color, mode background class
    const VARIANTS = [
        { suffix: 'day-enabled',    label: 'Enabled',    color: '#000000', mode: 'day',   bgClass: 'day-bg' },
        { suffix: 'day-disabled',   label: 'Disabled',   color: '#444444', mode: 'day',   bgClass: 'day-bg' },
        { suffix: 'day-checked',    label: 'Checked',    color: '#a6af00', mode: 'day',   bgClass: 'day-bg' },
        { suffix: 'day-pressed',    label: 'Pressed',    color: '#00000054', mode: 'day',   bgClass: 'day-bg' },
        { suffix: 'day-editable',   label: 'Editable',   color: '#027179', mode: 'day',   bgClass: 'day-bg' },
        { suffix: 'day-flat',       label: 'Flat',       color: '#FFFFFF', mode: 'day',   bgClass: 'day-bg' },
        { suffix: 'day-secondary',  label: 'Secondary',  color: '#008809', mode: 'day',   bgClass: 'day-bg' },
        { suffix: 'night-enabled',  label: 'Enabled',    color: '#000000', mode: 'night', bgClass: 'night-bg' },
        { suffix: 'night-disabled', label: 'Disabled',   color: '#bebebe', mode: 'night', bgClass: 'night-bg' },
        { suffix: 'night-checked',  label: 'Checked',    color: '#d9ff00', mode: 'night', bgClass: 'night-bg' },
        { suffix: 'night-pressed',  label: 'Pressed',    color: '#ffffff7e', mode: 'night', bgClass: 'night-bg' },
        { suffix: 'night-editable', label: 'Editable',   color: '#00a6d0', mode: 'night', bgClass: 'night-bg' },
        { suffix: 'night-flat',     label: 'Flat',       color: '#FFFFFF', mode: 'night', bgClass: 'night-bg' },
        { suffix: 'night-secondary',label: 'Secondary',  color: '#00bb0c', mode: 'night', bgClass: 'night-bg' },
    ];

    // DOM Elements
    const dropZone          = document.getElementById('drop-zone');
    const fileInput         = document.getElementById('file-input');
    const assetListSection  = document.getElementById('asset-list');
    const assetCountEl      = document.getElementById('asset-count');
    const assetItemsEl      = document.getElementById('asset-items');
    const clearAllBtn       = document.getElementById('clear-all-btn');
    const githubSection     = document.getElementById('github-section');
    const previewList       = document.getElementById('preview-list');
    const previewArea       = document.getElementById('preview-area');
    const uploadBtn         = document.getElementById('upload-btn');
    const statusEl          = document.getElementById('status');
    const addFolderBtn      = document.getElementById('add-folder-btn');
    const customFolderInput = document.getElementById('custom-folder');
    const folderSelect      = document.getElementById('folder-path');
    const toggleDayBtn      = document.getElementById('toggle-day');
    const toggleNightBtn    = document.getElementById('toggle-night');
    const toggleSingleBtn   = document.getElementById('toggle-single');
    const toggleMultiBtn    = document.getElementById('toggle-multi');

    // Asset store: [{name, baseName, svgText}]
    let assets      = [];
    let activeMode  = 'day';
    let colorMode   = 'single'; // 'single' or 'multi'

    // --- Theme Toggle ---
    toggleDayBtn.addEventListener('click', () => {
        activeMode = 'day';
        toggleDayBtn.classList.add('active');
        toggleNightBtn.classList.remove('active');
        generatePreviews();
    });

    toggleNightBtn.addEventListener('click', () => {
        activeMode = 'night';
        toggleNightBtn.classList.add('active');
        toggleDayBtn.classList.remove('active');
        generatePreviews();
    });

    // --- Color Mode Toggle ---
    toggleSingleBtn.addEventListener('click', () => {
        colorMode = 'single';
        toggleSingleBtn.classList.add('active');
        toggleMultiBtn.classList.remove('active');
        generatePreviews();
    });

    toggleMultiBtn.addEventListener('click', () => {
        colorMode = 'multi';
        toggleMultiBtn.classList.add('active');
        toggleSingleBtn.classList.remove('active');
        generatePreviews();
    });

    // --- Prevent drops outside drop zone ---
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());

    // --- Drop Zone ---
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
        fileInput.value = '';
    });

    // --- File Handling (multiple) ---
    function handleFiles(fileList) {
        const svgFiles = Array.from(fileList).filter((f) =>
            f.name.toLowerCase().endsWith('.svg')
        );

        if (svgFiles.length === 0) {
            setStatus('Please upload SVG files.', 'error');
            return;
        }

        let loaded = 0;
        svgFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const baseName = file.name.replace(/\.svg$/i, '');
                if (!assets.find((a) => a.baseName === baseName)) {
                    assets.push({ name: file.name, baseName, svgText: e.target.result });
                }
                loaded++;
                if (loaded === svgFiles.length) refreshUI();
            };
            reader.readAsText(file);
        });
    }

    // --- Remove single asset ---
    function removeAsset(baseName) {
        assets = assets.filter((a) => a.baseName !== baseName);
        refreshUI();
    }

    // --- Clear All ---
    clearAllBtn.addEventListener('click', () => {
        assets = [];
        refreshUI();
    });

    // --- Refresh everything ---
    function refreshUI() {
        renderAssetList();
        generatePreviews();

        const hasAssets = assets.length > 0;
        assetListSection.classList.toggle('hidden', !hasAssets);
        githubSection.classList.toggle('hidden', !hasAssets);
        uploadBtn.disabled = !hasAssets;
    }

    // --- Asset list in right panel ---
    function renderAssetList() {
        assetItemsEl.innerHTML = '';
        assetCountEl.textContent = `(${assets.length})`;

        assets.forEach((asset) => {
            const li = document.createElement('li');

            const nameSpan = document.createElement('span');
            nameSpan.className = 'asset-name';
            nameSpan.textContent = asset.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-asset';
            removeBtn.textContent = '×';
            removeBtn.title = 'Remove';
            removeBtn.addEventListener('click', () => removeAsset(asset.baseName));

            li.appendChild(nameSpan);
            li.appendChild(removeBtn);
            assetItemsEl.appendChild(li);
        });
    }

    // --- SVG Recoloring ---
    function recolorSvg(svgText, targetColor) {
        const parser = new DOMParser();
        const doc    = parser.parseFromString(svgText, 'image/svg+xml');
        const svg    = doc.documentElement;

        const allElements = svg.querySelectorAll('*');
        allElements.forEach((el) => {
            const fill = el.getAttribute('fill');
            if (fill && fill !== 'none' && fill !== 'transparent' && !fill.startsWith('url')) {
                el.setAttribute('fill', targetColor);
            }

            const stroke = el.getAttribute('stroke');
            if (stroke && stroke !== 'none' && stroke !== 'transparent' && !stroke.startsWith('url')) {
                el.setAttribute('stroke', targetColor);
            }

            const style = el.getAttribute('style');
            if (style) {
                const newStyle = style
                    .replace(/fill\s*:\s*[^;]+/gi, `fill: ${targetColor}`)
                    .replace(/stroke\s*:\s*[^;]+/gi, `stroke: ${targetColor}`);
                el.setAttribute('style', newStyle);
            }
        });

        const styleTags = svg.querySelectorAll('style');
        styleTags.forEach((styleTag) => {
            styleTag.textContent = styleTag.textContent
                .replace(/fill\s*:\s*[^;]+/gi, `fill: ${targetColor}`)
                .replace(/stroke\s*:\s*[^;]+/gi, `stroke: ${targetColor}`);
        });

        return new XMLSerializer().serializeToString(svg);
    }

    // --- SVG Opacity for Multi-Color Disabled ---
    function applyDisabledOpacity(svgText) {
        const parser = new DOMParser();
        const doc    = parser.parseFromString(svgText, 'image/svg+xml');
        const svg    = doc.documentElement;
        svg.setAttribute('opacity', '0.38');
        return new XMLSerializer().serializeToString(svg);
    }

    // --- Preview Generation ---
    function generatePreviews() {
        previewList.innerHTML = '';
        const placeholder = previewArea.querySelector('.placeholder-text');

        if (assets.length === 0) {
            if (!placeholder) {
                const p = document.createElement('p');
                p.className = 'placeholder-text';
                p.textContent = 'Your SVG variants will appear here';
                previewArea.insertBefore(p, previewList);
            }
            return;
        }

        if (placeholder) placeholder.remove();

        assets.forEach((asset) => {
            const block = document.createElement('div');
            block.className = 'asset-preview-block';

            const heading = document.createElement('h3');
            heading.textContent = asset.name;
            block.appendChild(heading);

            const grid = document.createElement('div');
            grid.className = 'preview-grid';

            if (colorMode === 'single') {
                VARIANTS.filter((v) => v.mode === activeMode).forEach((variant) => {
                    const recolored = recolorSvg(asset.svgText, variant.color);
                    grid.appendChild(createPreviewCard(variant.label, recolored, variant.bgClass));
                });
            } else {
                // Multi-color mode: enabled (original) and disabled (reduced opacity)
                const bgClass = activeMode === 'day' ? 'day-bg' : 'night-bg';
                grid.appendChild(createPreviewCard('Enabled', asset.svgText, bgClass));
                grid.appendChild(createPreviewCard('Disabled', applyDisabledOpacity(asset.svgText), bgClass));
            }

            block.appendChild(grid);
            previewList.appendChild(block);
        });
    }

    function createPreviewCard(label, svgText, bgClass) {
        const card = document.createElement('div');
        card.className = `preview-card ${bgClass}`;

        const svgContainer = document.createElement('div');
        svgContainer.className = 'svg-container';
        svgContainer.innerHTML = svgText;

        const labelEl = document.createElement('div');
        labelEl.className = 'card-label';
        labelEl.textContent = label;

        card.appendChild(svgContainer);
        card.appendChild(labelEl);
        return card;
    }

    // --- Custom Folder ---
    addFolderBtn.addEventListener('click', () => {
        let path = customFolderInput.value.trim();
        if (!path) return;
        if (!path.endsWith('/')) path += '/';
        const existing = Array.from(folderSelect.options).map((o) => o.value);
        if (!existing.includes(path)) {
            const option = document.createElement('option');
            option.value = path;
            option.textContent = path;
            folderSelect.appendChild(option);
        }
        folderSelect.value = path;
        customFolderInput.value = '';
    });

    // --- GitHub Upload ---
    uploadBtn.addEventListener('click', async () => {
        const token         = document.getElementById('github-token').value.trim();
        const owner         = document.getElementById('repo-owner').value.trim();
        const repo          = document.getElementById('repo-name').value.trim();
        const branch        = document.getElementById('branch-name').value.trim() || 'main';
        const folder        = folderSelect ? folderSelect.value : '';
        const commitMessage = document.getElementById('commit-message').value.trim();
        const committerName = document.getElementById('committer-name').value.trim();

        if (!token || !owner || !repo) {
            setStatus('Please fill in GitHub token, owner, and repository name.', 'error');
            return;
        }

        // Build the list of files to upload based on the current color mode
        const filesToUpload = [];
        assets.forEach((asset) => {
            if (colorMode === 'single') {
                VARIANTS.forEach((variant) => {
                    filesToUpload.push({
                        filename: `${asset.baseName}_${variant.suffix}.svg`,
                        content: recolorSvg(asset.svgText, variant.color),
                    });
                });
            } else {
                ['day', 'night'].forEach((mode) => {
                    filesToUpload.push({
                        filename: `${asset.baseName}_${mode}-enabled.svg`,
                        content: asset.svgText,
                    });
                    filesToUpload.push({
                        filename: `${asset.baseName}_${mode}-disabled.svg`,
                        content: applyDisabledOpacity(asset.svgText),
                    });
                });
            }
        });

        uploadBtn.disabled = true;
        let uploaded = 0;
        const total = filesToUpload.length;

        try {
            for (const file of filesToUpload) {
                setStatus(`Uploading… ${uploaded + 1}/${total}: ${file.filename}`, 'info');
                await uploadToGitHub(token, owner, repo, branch, folder, file.filename, file.content, commitMessage, committerName);
                uploaded++;
            }
            setStatus(`Successfully uploaded ${total} SVG${total !== 1 ? 's' : ''} to ${owner}/${repo}/${folder || ''}`, 'success');
        } catch (err) {
            setStatus(`Upload failed (${uploaded}/${total}): ${err.message}`, 'error');
        } finally {
            uploadBtn.disabled = assets.length === 0;
        }
    });

    async function uploadToGitHub(token, owner, repo, branch, folder, filename, content, commitMsg, committerName) {
        const path   = `${folder}${filename}`;
        const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`;

        let sha;
        try {
            const existing = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (existing.ok) {
                const data = await existing.json();
                sha = data.sha;
            }
        } catch {
            // File doesn't exist
        }

        const body = {
            message: commitMsg || (sha ? `Update ${filename}` : `Add ${filename}`),
            content: btoa(unescape(encodeURIComponent(content))),
            branch,
        };
        if (committerName) {
            body.committer = { name: committerName, email: `${committerName.replace(/\s+/g, '.').toLowerCase()}@users.noreply.github.com` };
        }
        if (sha) body.sha = sha;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP ${response.status}`);
        }
    }

    // --- Status Helper ---
    function setStatus(msg, type) {
        statusEl.innerHTML = `<span class="${type}">${escapeHtml(msg)}</span>`;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
})();
