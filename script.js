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

  applyTheme(savedTheme);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.getAttribute('data-set'));
    });
  });

  // --- GitHub API ile Repoları Çekme ve Filtreleme ---
  let allRepos = [];
  fetchGithubRepos();

  async function fetchGithubRepos() {
    const username = 'Javerto';
    const projectsGrid = document.getElementById('github-projects-grid');
    if (!projectsGrid) return;

    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc`);
      const repos = await response.json();

      allRepos = repos.filter(repo => !repo.fork && repo.name !== 'Javerto.github.io');
      displayRepos(allRepos.slice(0, 6)); // Başlangıçta 6 tanesini göster

      setupFilters();
    } catch (error) {
      console.error('GitHub repoları çekilirken bir hata oluştu:', error);
    }
  }

  function displayRepos(reposToShow) {
    const projectsGrid = document.getElementById('github-projects-grid');
    projectsGrid.innerHTML = '';

    reposToShow.forEach((repo, index) => {
      const repoNum = (index + 1) < 10 ? `0${index + 1}` : index + 1;
      const languageTag = repo.language ? `<span class="tag">${repo.language}</span>` : '';
      
      const repoHtml = `
        <div class="project-card reveal revealed">
          <span class="project-card__number">GH-${repoNum}</span>
          <h3 class="project-card__title">${repo.name.replace(/-/g, ' ')}</h3>
          <p class="project-card__desc">${repo.description || 'Bu proje için açıklama bulunmuyor.'}</p>
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
      projectsGrid.insertAdjacentHTML('beforeend', repoHtml);
    });
  }

  function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        if (filter === 'all') {
          displayRepos(allRepos.slice(0, 6));
        } else {
          const filtered = allRepos.filter(repo => 
            repo.language && repo.language.toLowerCase() === filter.toLowerCase()
          );
          displayRepos(filtered);
        }
      });
    });
  }

  // --- EmailJS İletişim Formu ---
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  // EmailJS'i kendi Public Key'inizle başlatın
  // emailjs.init("YOUR_PUBLIC_KEY"); 

  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const submitBtn = contactForm.querySelector('.form__submit');
      const originalBtnText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Gönderiliyor...';
      formStatus.textContent = '';

      // NOT: Aşağıdaki kodun çalışması için EmailJS hesabınızdan SERVICE_ID ve TEMPLATE_ID almalısınız.
      // emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
      //   .then(() => {
      //     formStatus.className = 'form__status success';
      //     formStatus.textContent = 'Mesajınız başarıyla gönderildi!';
      //     contactForm.reset();
      //   }, (error) => {
      //     formStatus.className = 'form__status error';
      //     formStatus.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
      //     console.error('EmailJS Hatası:', error);
      //   })
      //   .finally(() => {
      //     submitBtn.disabled = false;
      //     submitBtn.innerHTML = originalBtnText;
      //   });

      // Şimdilik test için simüle ediyoruz:
      setTimeout(() => {
        formStatus.className = 'form__status success';
        formStatus.textContent = 'EmailJS kurulumu yapıldığında bu mesaj iletilecektir.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        contactForm.reset();
      }, 1500);
    });
  }
});
