document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Fetch data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderProfile(data.profile);
            renderAbout(data.about);
            renderConsulting(data.consulting);
            renderExperience(data.experience);
            renderProjects(data.projects);
            renderEducation(data.education);

            document.getElementById('year').textContent = new Date().getFullYear();
            lucide.createIcons();
        })
        .catch(error => console.error('Error loading data:', error));
});

function renderProfile(profile) {
    document.getElementById('profile-name').textContent = profile.name;
    document.getElementById('profile-title').textContent = profile.title;
    document.getElementById('profile-image').src = profile.image;

    const container = document.getElementById('social-links');
    profile.socials.forEach(social => {
        const a = document.createElement('a');
        a.href = social.url;
        a.className = 'social-link';
        a.target = '_blank';

        // Map social names to Lucide icons
        let iconName = 'link';
        if (social.name.toLowerCase() === 'github') iconName = 'github';
        if (social.name.toLowerCase() === 'linkedin') iconName = 'linkedin';
        if (social.name.toLowerCase() === 'email') iconName = 'mail';

        a.innerHTML = `<i data-lucide="${iconName}"></i>`;
        container.appendChild(a);
    });
}

function renderAbout(about) {
    const container = document.getElementById('about-text');
    about.paragraphs.forEach(p => {
        const pEl = document.createElement('p');
        pEl.innerHTML = p;
        container.appendChild(pEl);
    });
}

function renderConsulting(consulting) {
    if (!consulting) return;
    document.getElementById('consulting-company-image').src = consulting.image;
    document.getElementById('consulting-company-image').onerror = function () {
        this.src = 'assets/placeholder-logo.svg';
    };
    document.getElementById('consulting-desc').textContent = consulting.description;
    document.getElementById('consulting-cta').textContent = consulting.cta;
    document.getElementById('consulting-cta').href = `mailto:${consulting.email}`;
    const list = document.getElementById('consulting-services');
    consulting.services.forEach(service => {
        const li = document.createElement('li');
        li.textContent = service;
        list.appendChild(li);
    });
}

function renderExperience(experience) {
    const container = document.getElementById('experience-list');
    // Limit to first 3 items to fit the card nicely
    experience.forEach(exp => {
        const div = document.createElement('div');
        div.className = 'exp-item';
        div.innerHTML = `
            <img src="${exp.logo}" alt="${exp.company}" class="exp-logo" onerror="this.src='assets/placeholder-logo.svg'">
            <div class="exp-details">
                <h3>${exp.title}</h3>
                <p class="exp-meta">${exp.company} | ${exp.period}</p>
                <p class="exp-desc">${exp.description}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderProjects(projects) {
    const container = document.getElementById('projects-grid');
    // Show top 6 projects
    projects.slice(0, 6).forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-item';

        const imageSrc = project.image || 'assets/placeholder.jpg';
        const tagsHtml = project.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('');

        let actionsHtml = '';
        if (project.demo) {
            actionsHtml += `<a href="${project.demo}" target="_blank" class="project-btn"><i data-lucide="external-link"></i> Demo</a>`;
        }
        if (project.github) {
            actionsHtml += `<a href="${project.github}" target="_blank" class="project-btn"><i data-lucide="github"></i> Code</a>`;
        }
        if (project.report) {
            actionsHtml += `<a href="${project.report}" target="_blank" class="project-btn"><i data-lucide="file-text"></i> PDF</a>`;
        }

        card.innerHTML = `
            <img src="${imageSrc}" alt="${project.title}" class="project-img" onerror="this.src='assets/placeholder.jpg'">
            <div class="project-info">
                <h3 class="project-title">${project.title}</h3>
                <div class="project-tags">${tagsHtml}</div>
            </div>
            <div class="project-actions">
                ${actionsHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

function renderEducation(education) {
    const container = document.getElementById('education-list');
    education.forEach(edu => {
        const div = document.createElement('div');
        div.className = 'edu-item';
        div.innerHTML = `
            <p class="edu-degree">${edu.degree}</p>
            <p class="edu-school">${edu.school}, ${edu.year}</p>
        `;
        container.appendChild(div);
    });
}
