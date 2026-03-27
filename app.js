document.addEventListener('DOMContentLoaded', () => {
    let toolsData = [];
    let activeFilter = 'all';
    let searchQuery = '';

    const grid = document.getElementById('directory-grid');
    const filterBar = document.getElementById('filter-bar');
    const searchInput = document.getElementById('search-input');
    const statsContainer = document.getElementById('directory-stats');
    const lastUpdatedSpan = document.getElementById('last-updated');

    async function fetchData() {
        try {
            const response = await fetch('gtm-data-final.json');
            const data = await response.json();
            toolsData = data.tools;
            
            initUI(data.meta);
            renderTools();
        } catch (error) {
            console.error('Error fetching data:', error);
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--danger);">Error loading directory data. Please check if gtm-data-final.json exists.</p>`;
        }
    }

    function initUI(meta) {
        lastUpdatedSpan.textContent = meta.last_updated;

        // Populate Stats
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${meta.total_tools}</span>
                <span class="stat-label">Tools</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${meta.layers.length}</span>
                <span class="stat-label">Layers</span>
            </div>
        `;

        // Populate Filters
        meta.layers.forEach(layer => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-layer', layer);
            btn.textContent = layer.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            btn.addEventListener('click', () => {
                activeFilter = layer;
                updateFiltersUI();
                renderTools();
            });
            filterBar.appendChild(btn);
        });

        // Search Listener
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderTools();
        });
    }

    function updateFiltersUI() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-layer') === activeFilter);
        });
    }

    function renderTools() {
        grid.innerHTML = '';
        
        const filtered = toolsData.filter(tool => {
            const matchesFilter = activeFilter === 'all' || tool.layer === activeFilter;
            const matchesSearch = tool.name.toLowerCase().includes(searchQuery) || 
                                tool.stack_role.toLowerCase().includes(searchQuery);
            return matchesFilter && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No tools found matching your criteria.</p>`;
            return;
        }

        filtered.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'tool-card';
            
            const priorityClass = `priority-${tool.priority_tier.toLowerCase()}`;
            
            card.innerHTML = `
                <div class="tool-header">
                    <span class="tool-name">${tool.name}</span>
                    <span class="priority-badge ${priorityClass}">${tool.priority_tier}</span>
                </div>
                <div class="stack-role">${tool.stack_role}</div>
                <div class="layer-tag">${tool.layer.split('-').join(' ')}</div>
                
                ${tool.not_ideal_if && tool.not_ideal_if.length > 0 ? `
                    <div class="not-ideal-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        Not Ideal If
                    </div>
                    <ul class="not-ideal-list">
                        ${tool.not_ideal_if.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                ` : ''}

                <div class="tool-footer">
                    <a href="${tool.url}" class="visit-link" target="_blank">
                        Visit Website
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    fetchData();
});
