// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
});

// Animate skill bars on scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillBars = entry.target.querySelectorAll('.skill-progress');
            skillBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe skill sections
document.querySelectorAll('.skill-category').forEach(section => {
    observer.observe(section);
});

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Placeholder for form submission
        // In a real application, you would send this data to a server
        alert('Mesajınız alındı! (Bu bir placeholder, gerçek bir form gönderimi için backend entegrasyonu gerekir)');
        
        // Reset form
        contactForm.reset();
    });
}

// Add active class to nav links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
});

// Fetch App Store data for project detail pages
function fetchAppStoreData(appId) {
    const apiUrl = `https://itunes.apple.com/lookup?id=${appId}&country=tr`;
    
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                return data.results[0];
            }
            return null;
        })
        .catch(error => {
            console.error('Error fetching App Store data:', error);
            return null;
        });
}

// Update project detail page with App Store data
function updateProjectDetailWithAppStoreData(appId, options = {}) {
    fetchAppStoreData(appId).then(appData => {
        if (!appData) return;

        // Update title if not already set
        if (options.updateTitle && appData.trackName) {
            const titleElement = document.querySelector('.project-detail-title');
            if (titleElement && !titleElement.textContent.includes(appData.trackName)) {
                titleElement.textContent = appData.trackName;
            }
        }

        // Update app store info section
        const appStoreInfo = document.querySelector('.app-store-info');
        if (appStoreInfo) {
            // Check if rating info already exists
            const existingRating = Array.from(appStoreInfo.querySelectorAll('.info-item')).find(item => 
                item.textContent.includes('Değerlendirme')
            );

            // Update rating if available and not already exists
            if (appData.averageUserRating && !existingRating) {
                const ratingDiv = document.createElement('div');
                ratingDiv.className = 'info-item';
                ratingDiv.innerHTML = `<strong>Değerlendirme:</strong> <span>⭐ ${appData.averageUserRating.toFixed(1)}/5.0 (${appData.userRatingCount || 0} değerlendirme)</span>`;
                appStoreInfo.insertBefore(ratingDiv, appStoreInfo.firstChild);
            } else if (appData.averageUserRating && existingRating) {
                existingRating.innerHTML = `<strong>Değerlendirme:</strong> <span>⭐ ${appData.averageUserRating.toFixed(1)}/5.0 (${appData.userRatingCount || 0} değerlendirme)</span>`;
            }

            // Check if version info already exists
            const existingVersion = Array.from(appStoreInfo.querySelectorAll('.info-item')).find(item => 
                item.textContent.includes('Sürüm')
            );

            // Update version
            if (appData.version && !existingVersion) {
                const versionItem = document.createElement('div');
                versionItem.className = 'info-item';
                versionItem.innerHTML = `<strong>Sürüm:</strong> <span>${appData.version}</span>`;
                appStoreInfo.appendChild(versionItem);
            }

            // Check if size info already exists
            const existingSize = Array.from(appStoreInfo.querySelectorAll('.info-item')).find(item => 
                item.textContent.includes('Boyut') || item.textContent.includes('Büyüklük')
            );

            // Update file size
            if (appData.fileSizeBytes && !existingSize) {
                const sizeInMB = (appData.fileSizeBytes / (1024 * 1024)).toFixed(1);
                const sizeDiv = document.createElement('div');
                sizeDiv.className = 'info-item';
                sizeDiv.innerHTML = `<strong>Uygulama Boyutu:</strong> <span>${sizeInMB} MB</span>`;
                appStoreInfo.appendChild(sizeDiv);
            }
        }

        // Update image placeholder with app icon
        const imagePlaceholder = document.querySelector('.image-placeholder-large');
        if (imagePlaceholder && appData.artworkUrl512) {
            const img = document.createElement('img');
            img.src = appData.artworkUrl512;
            img.alt = appData.trackName;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '12px';
            imagePlaceholder.innerHTML = '';
            imagePlaceholder.appendChild(img);
        }

        // Update description if provided
        if (options.updateDescription && appData.description) {
            const descriptionSection = document.querySelector('.project-detail-info > p');
            if (descriptionSection && descriptionSection.textContent.includes('[Placeholder]')) {
                // Keep original description, just add App Store description as additional info
                const appStoreDesc = document.createElement('p');
                appStoreDesc.textContent = appData.description;
                appStoreDesc.style.marginTop = '1rem';
                descriptionSection.parentNode.insertBefore(appStoreDesc, descriptionSection.nextSibling);
            }
        }
    });
}

// Auto-fetch data for project pages
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a project detail page
    const projectDetailSection = document.querySelector('.project-detail[data-app-id]');
    
    if (projectDetailSection) {
        const appId = projectDetailSection.getAttribute('data-app-id');
        if (appId) {
            updateProjectDetailWithAppStoreData(appId, {
                updateTitle: false,
                updateDescription: false
            });
        }
    }
});

