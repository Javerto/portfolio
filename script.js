// ============================================
// PORTFOLYO SİTESİ - ANA SCRIPT DOSYASI
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.navbar__hamburger');
  const navLinks = document.querySelector('.navbar__links');

  // --- Navbar scroll efekti ---
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // --- Mobil menü aç/kapa ---
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // --- Menü linkine tıklanınca mobil menüyü kapat ---
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // --- Basit fade-in animasyonu (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach(el => observer.observe(el));

  // --- Tema Seçici (Theme Switcher) ---
  const themeBtns = document.querySelectorAll('.theme-btn');
  const rootElement = document.documentElement;
  
  // LocalStorage'dan kayıtlı temayı oku, yoksa 'warm' kullan
  const savedTheme = localStorage.getItem('portfolioTheme') || 'warm';
  
  function applyTheme(themeName) {
    if (themeName === 'light') {
      rootElement.removeAttribute('data-theme');
    } else {
      rootElement.setAttribute('data-theme', themeName);
    }
    
    themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set') === themeName);
    });
    
    localStorage.setItem('portfolioTheme', themeName);
  }

  // Sayfa yüklendiğinde hafızadaki temayı uygula
  applyTheme(savedTheme);

  // Buton tıklamalarını dinle
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.getAttribute('data-set'));
    });
  });

  // --- GitHub API ile Repoları Çekme ---
  fetchGithubRepos();
});

async function fetchGithubRepos() {
  const username = 'Javerto';
  const projectsGrid = document.getElementById('github-projects-grid');
  
  if (!projectsGrid) return;

  try {
    // GitHub API'ye istek at (En son güncellenenleri getir)
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc`);
    const repos = await response.json();

    // Sadece portfolyo reposu hariç public repoları filtrele
    const validRepos = repos
      .filter(repo => !repo.fork && repo.name !== 'Javerto.github.io') 
      .slice(0, 4); 

    let indexCount = 0; // GitHub projeleri için numaralandırmayı sıfırdan başlat

    for (const repo of validRepos) {
      indexCount++;
      const repoNum = indexCount < 10 ? `0${indexCount}` : indexCount;
      
      // Dil bilgisini tag olarak ayarla (Bazen API'den null döner)
      const languageTag = repo.language ? `<span class="tag">${repo.language}</span>` : '';

      // Açıklama Metni: Önce repo.description kontrol et, yoksa README dosyasını çek
      let descText = repo.description;
      
      if (!descText) {
        try {
          // default_branch kullanarak ana daldaki README.md'yi çeker
          const readmeRes = await fetch(`https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/README.md`);
          if (readmeRes.ok) {
            const readmeText = await readmeRes.text();
            
            // Markdown karakterlerini, başlıkları, resimleri ve linkleri basitçe temizle
            let cleanText = readmeText
              .replace(/#.*$/gm, '') // Başlıkları sil
              .replace(/!\[.*?\]\(.*?\)/g, '') // Resimleri sil
              .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Linklerin sadece metnini bırak
              .replace(/<[^>]*>/g, '') // HTML etiketlerini sil
              .replace(/[\r\n]+/g, ' ') // Satır atlamalarını boşluğa çevir
              .trim();

            if (cleanText.length > 150) {
              descText = cleanText.substring(0, 150) + '...';
            } else if (cleanText.length > 0) {
              descText = cleanText;
            } else {
              descText = 'Bu proje için henüz bir açıklama girilmemiş.';
            }
          } else {
            descText = 'Bu proje için henüz bir açıklama girilmemiş.';
          }
        } catch (e) {
          descText = 'Bu proje için henüz bir açıklama girilmemiş.';
        }
      }

      // Yeni kartın HTML'ini oluştur
      const repoHtml = `
        <div class="project-card reveal revealed">
          <span class="project-card__number">GH-${repoNum}</span>
          <h3 class="project-card__title">${repo.name.replace(/-/g, ' ')}</h3>
          <p class="project-card__desc">
            ${descText}
          </p>
          <div class="project-card__tags">
            ${languageTag}
            <span class="tag">GitHub Repo</span>
          </div>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-card__link">
            Kodu İncele 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>
      `;

      // Grid'in sonuna ekle
      projectsGrid.insertAdjacentHTML('beforeend', repoHtml);
    }

  } catch (error) {
    console.error('GitHub repoları çekilirken bir hata oluştu:', error);
  }
}
