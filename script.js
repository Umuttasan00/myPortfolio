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
    // Try with country parameter first, then without if it fails
    const apiUrl = `https://itunes.apple.com/lookup?id=${appId}&country=tr&entity=software`;
    
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('iTunes API response:', data);
            if (data.results && data.results.length > 0) {
                const appData = data.results[0];
                console.log('App data fields:', Object.keys(appData));
                console.log('Screenshot URLs available:', {
                    screenshotUrls: appData.screenshotUrls?.length || 0,
                    screenshots: appData.screenshots?.length || 0,
                    ipadScreenshotUrls: appData.ipadScreenshotUrls?.length || 0,
                    iphoneScreenshotUrls: appData.iphoneScreenshotUrls?.length || 0
                });
                return appData;
            }
            console.log('No results found in API response');
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

        // Update app icon in detail page
        const appIcon = document.querySelector('.project-detail-app-icon');
        if (appIcon && appData.artworkUrl512) {
            appIcon.src = appData.artworkUrl512.replace('512x512bb', '200x200bb');
            appIcon.style.display = 'block';
            const placeholder = appIcon.nextElementSibling;
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        }

        // Update app title if available
        const appTitle = document.querySelector('.project-detail-app-title');
        if (appTitle && appData.trackName) {
            appTitle.textContent = appData.trackName;
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

// Load app icons for project cards on main page
function loadProjectCardIcons() {
    const projectCards = document.querySelectorAll('.project-card[data-app-id]');
    
    projectCards.forEach(card => {
        const appId = card.getAttribute('data-app-id');
        if (appId) {
            fetchAppStoreData(appId).then(appData => {
                if (appData && appData.artworkUrl512) {
                    const iconImg = card.querySelector('.project-app-icon');
                    if (iconImg) {
                        iconImg.src = appData.artworkUrl512.replace('512x512bb', '200x200bb');
                        iconImg.style.display = 'block';
                        const placeholder = iconImg.nextElementSibling;
                        if (placeholder) {
                            placeholder.style.display = 'none';
                        }
                    }
                }
            });
        }
    });
}

// Load screenshots for detail pages from local images folder
function loadAppScreenshots(appId, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.log('Container not found:', containerSelector);
        return;
    }
    
    // Map app IDs to image folder names
    const imageFolders = {
        '6753812445': 'word_impostor',
        '6752341934': 'what_to_watch_today',
        '6754171250': 'cocktail_clob_go'
    };
    
    const folderName = imageFolders[appId];
    if (!folderName) {
        console.log('No image folder found for appId:', appId);
        container.innerHTML = '<p style="color: var(--text-secondary); padding: 2rem; text-align: center;">Ekran görüntüleri bulunamadı.</p>';
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create screenshots grid
    const screenshotsGrid = document.createElement('div');
    screenshotsGrid.className = 'screenshots-grid';
    
    // Load screenshots from images folder (1-5)
    for (let i = 1; i <= 5; i++) {
        const screenshotItem = document.createElement('div');
        screenshotItem.className = 'screenshot-item';
        
        const img = document.createElement('img');
        img.src = `images/${folderName}/400x800bb-${i}.png`;
        img.alt = `App Screenshot ${i}`;
        img.loading = 'lazy';
        img.onerror = function() {
            // If numbered screenshot doesn't exist, try without number for first one
            if (i === 1) {
                this.src = `images/${folderName}/400x800bb.png`;
            } else {
                this.parentElement.style.display = 'none';
            }
        };
        
        // Add click event to open modal
        img.addEventListener('click', function() {
            openImageModal(this.src, this.alt);
        });
        
        screenshotItem.appendChild(img);
        screenshotsGrid.appendChild(screenshotItem);
    }
    
    container.appendChild(screenshotsGrid);
}

// Image Modal functions
function openImageModal(src, alt) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    
    if (!modal || !modalImg) return;
    
    modal.classList.add('active');
    modalImg.src = src;
    caption.textContent = alt || 'Ekran Görüntüsü';
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Auto-fetch data for project pages
document.addEventListener('DOMContentLoaded', () => {
    // Setup image modal
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
    
    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
    
    // Check if we're on the main page with project cards
    const projectCards = document.querySelectorAll('.project-card[data-app-id]');
    if (projectCards.length > 0) {
        loadProjectCardIcons();
    }
    
    // Check if we're on a project detail page
    const projectDetailSection = document.querySelector('.project-detail[data-app-id]');
    
    if (projectDetailSection) {
        const appId = projectDetailSection.getAttribute('data-app-id');
        if (appId) {
            updateProjectDetailWithAppStoreData(appId, {
                updateTitle: false,
                updateDescription: false
            });
            
            // Load screenshots
            const screenshotsContainer = document.querySelector('.project-screenshots');
            if (screenshotsContainer) {
                loadAppScreenshots(appId, '.project-screenshots');
            }
        }
    }
});

