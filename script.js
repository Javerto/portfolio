
document.addEventListener('DOMContentLoaded', () => {
  // --- Navbar & Theme ---
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.navbar__hamburger');
  const navLinks = document.querySelector('.navbar__links');

  window.addEventListener('scroll', () => {
    if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  if(hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

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

  const themeBtns = document.querySelectorAll('.theme-btn');
  const rootElement = document.documentElement;
  const savedTheme = localStorage.getItem('portfolioTheme') || 'warm';
  
  function applyTheme(themeName) {
    if (themeName === 'light') rootElement.removeAttribute('data-theme');
    else rootElement.setAttribute('data-theme', themeName);
    themeBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-set') === themeName));
    localStorage.setItem('portfolioTheme', themeName);
  }
  applyTheme(savedTheme);
  themeBtns.forEach(btn => btn.addEventListener('click', () => applyTheme(btn.getAttribute('data-set'))));

  // --- GitHub API ---
  let allRepos = [];
  async function fetchGithubRepos() {
    const projectsGrid = document.getElementById('github-projects-grid');
    if (!projectsGrid) return;
    try {
      const response = await fetch(`https://api.github.com/users/Javerto/repos?sort=updated&direction=desc`);
      const repos = await response.json();
      allRepos = repos.filter(repo => !repo.fork && repo.name !== 'Javerto.github.io');
      displayRepos(allRepos.slice(0, 6));
      setupFilters();
    } catch (e) { console.error(e); }
  }
  function displayRepos(reposToShow) {
    const projectsGrid = document.getElementById('github-projects-grid');
    if(!projectsGrid) return;
    projectsGrid.innerHTML = '';
    reposToShow.forEach((repo, index) => {
      const repoNum = (index + 1) < 10 ? `0${index + 1}` : index + 1;
      const languageTag = repo.language ? `<span class="tag">${repo.language}</span>` : '';
      projectsGrid.insertAdjacentHTML('beforeend', `
        <div class="project-card reveal revealed">
          <span class="project-card__number">GH-${repoNum}</span>
          <h3 class="project-card__title">${repo.name.replace(/-/g, ' ')}</h3>
          <p class="project-card__desc">${repo.description || 'Bu proje için açıklama bulunmuyor.'}</p>
          <div class="project-card__tags">${languageTag}<span class="tag">GitHub Repo</span></div>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-card__link">Kodu İncele</a>
        </div>
      `);
    });
  }
  function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        filter === 'all' ? displayRepos(allRepos.slice(0, 6)) : displayRepos(allRepos.filter(r => r.language && r.language.toLowerCase() === filter.toLowerCase()));
      });
    });
  }
  fetchGithubRepos();

  // --- EmailJS ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    emailjs.init("hpBBeC-vYwYUvVYwY"); 
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = contactForm.querySelector('.form__submit');
      btn.disabled = true;
      emailjs.sendForm('service_a5fo4ac', 'template_l1jbzkk', this).then(() => {
        document.getElementById('form-status').textContent = 'Başarıyla gönderildi!';
        contactForm.reset();
      }).catch(() => {
        document.getElementById('form-status').textContent = 'Hata oluştu!';
      }).finally(() => btn.disabled = false);
    });
  }

  // --- STABLE MODAL SYSTEM ---
  const caseStudies = {
    "Finansal Raporlama Otomasyonu": {
      "problem": "Manuel veri toplama süreci çok zaman alıyordu ve insan hatasına açıktı. Raporların hazırlanması her hafta 3 iş günü sürüyordu.",
      "solution": "Excel VBA kullanarak dinamik veri çekme ve raporlama makroları geliştirildi. Veriler otomatik olarak valide edildi ve standart rapor formatlarına dönüştürüldü.",
      "result": "Raporlama süresi 3 günden 1 saate indirildi (%80 iyileşme). Hatalı veri girişi sıfıra indirildi."
    },
    "ETL ve Veri Raporlama Otomasyonu": {
      "problem": "Banka operasyonlarından gelen büyük veri setlerinin SPSS Modeler ile işlenmesi sırasında tekrarlayan manuel işlemler verimliliği düşürüyordu.",
      "solution": "Python tabanlı bir ETL betiği yazılarak veri temizleme ve dönüştürme süreçleri otomatikleştirildi. Veri ambarı entegrasyonu sağlandı.",
      "result": "Veri işleme hızı %60 arttı ve raporlama süreçleri gerçek zamanlıya yakın hale getirildi."
    }
  };

  const blogPosts = {
    "Veri Temizliği: Neden Analiz Süresinin %80'ini Alır?": {
        "content": "Veri temizliği, ham verilerin analiz edilebilir hale getirilmesi sürecidir. Genellikle eksik verilerin doldurulması, hatalı girişlerin düzeltilmesi ve aykırı değerlerin (outliers) yönetilmesini içerir. <br><br><b>Neden bu kadar zaman alır?</b> Çünkü veri her zaman kirli gelir. Farklı kaynaklardan gelen formatlar, yazım hataları ve mantıksal tutarsızlıklar, analistin veriyi anlaması ve temizlemesi için büyük bir çaba gerektirir. <br><br><b>Süreç nasıl yönetilmeli?</b><br>1. Veriyi Tanıma<br>2. Eksik Verileri Analiz Etme<br>3. Standartlaştırma<br>4. Validasyon."
    }
  };

  document.addEventListener('click', (e) => {
    const modal = document.getElementById('global-modal');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    // Case Study Click using .closest()
    const caseBtn = e.target.closest('.project-card__case-study');
    if (caseBtn) {
      const title = caseBtn.closest('.project-card').querySelector('.project-card__title').innerText;
      const data = caseStudies[title];
      if (data) {
        modalBody.innerHTML = `
          <h2 style="margin-bottom: 20px; color: var(--color-accent);">${title}</h2>
          <div style="margin-bottom: 20px;"><strong style="display: block; margin-bottom: 5px;">Problem:</strong><p style="color: var(--color-text-light);">${data.problem}</p></div>
          <div style="margin-bottom: 20px;"><strong style="display: block; margin-bottom: 5px;">Çözüm:</strong><p style="color: var(--color-text-light);">${data.solution}</p></div>
          <div style="margin-bottom: 20px;"><strong style="display: block; margin-bottom: 5px;">Sonuç:</strong><p style="color: var(--color-text-light);">${data.result}</p></div>
        `;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
      }
    }

    // Blog Post Click using .closest()
    const blogBtn = e.target.closest('.blog-card__link');
    if (blogBtn) {
      const title = blogBtn.closest('.blog-card').querySelector('.blog-card__title').innerText;
      const data = blogPosts[title];
      if (data) {
        modalBody.innerHTML = `
          <h2 style="margin-bottom: 20px; color: var(--color-accent);">${title}</h2>
          <div style="line-height: 1.8; color: var(--color-text-light);">${data.content}</div>
        `;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
      }
    }

    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
  });

  const closeBtn = document.getElementById('close-modal');
  if(closeBtn) {
    closeBtn.onclick = () => {
      const modal = document.getElementById('global-modal');
      if(modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
      }
    };
  }
});
