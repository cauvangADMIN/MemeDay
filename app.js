// MemeEveryDay - App Logic

// Meme data - Sẽ được thay thế bằng các ảnh từ thư mục assets/images/meme
const MEMES = [
  { id: 1, img: "assets/images/meme/meme_01.jpg", likes: 42, comments: 7, liked: false },
  { id: 2, img: "assets/images/meme/meme_02.jpg", likes: 28, comments: 5, liked: false },
  { id: 3, img: "assets/images/meme/meme_03.jpg", likes: 35, comments: 9, liked: false },
  { id: 4, img: "assets/images/meme/meme_04.jpg", likes: 19, comments: 3, liked: false },
  { id: 5, img: "assets/images/meme/meme_05.jpg", likes: 56, comments: 12, liked: false },
  { id: 6, img: "assets/images/meme/meme_06.jpg", likes: 31, comments: 6, liked: false }
];

// Chủ đề meme
const TOPICS = [
  { label: "Funny", icon: "😂" },
  { label: "Anime", icon: "🎭" },
  { label: "Gaming", icon: "🎮" },
  { label: "Animals", icon: "🐱" },
  { label: "Trending", icon: "🔥" },
  { label: "Random", icon: "🎲" }
];

// Render meme feed
function renderFeed(filterTag = '', keyword = '') {
  const el = document.getElementById("feed");
  let data = MEMES;
  
  // Không cần filter theo tag và keyword vì đây là trang meme đơn giản
  // Nhưng giữ lại tham số để tương thích với code gọi hàm
  
  el.innerHTML = data.map(meme => `
    <div class="card">
      <div class="post-header">
        <img src="https://randomuser.me/api/portraits/men/32.jpg" class="post-avatar"/>
        <div>
          <span class="post-author">Admin</span>
        </div>
      </div>
      <div class="meme-container">
        <img src="${meme.img}" class="meme-image" alt="Meme">
      </div>
      <div class="post-actions">
        <button class="action-btn${meme.liked?' liked':''}" onclick="likeMeme(${meme.id})">
          ❤️ <span>${meme.likes}</span>
        </button>
        <button class="action-btn" onclick="openModal('Bình luận meme #${meme.id} (fake modal)')">
          💬 ${meme.comments}
        </button>
      </div>
    </div>
  `).join('');
}

// Render chủ đề
function renderChips(selected) {
  const el = document.getElementById("chipList");
  el.innerHTML = TOPICS.map(tp => `
    <span class="chip${selected && selected===tp.label ? ' selected' : ''}" onclick="filterByTag('${tp.label}')">${tp.icon} ${tp.label}</span>
  `).join('');
}

// Xử lý like meme
function likeMeme(id) {
  const idx = MEMES.findIndex(m => m.id === id);
  MEMES[idx].liked = !MEMES[idx].liked;
  MEMES[idx].likes += MEMES[idx].liked ? 1 : -1;
  renderFeed(currentTag, document.getElementById('searchInput').value);
}

// Xử lý filter theo tag
let currentTag = '';
function filterByTag(tag) {
  currentTag = tag === currentTag ? '' : tag;
  renderChips(currentTag);
  renderFeed(currentTag, document.getElementById('searchInput').value);
}

// Xử lý modal
function openModal(text) {
  document.getElementById('modalText').innerText = text;
  document.getElementById('modal').style.display = "flex";
}

function closeModal() {
  document.getElementById('modal').style.display = "none";
}

// Xử lý menu mobile
function setupMobileMenu() {
  document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('mobileNav').classList.toggle('active');
  });
}

// Xử lý nút cuộn lên đầu trang
function setupScrollToTop() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });
  
  scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Xử lý thanh điều hướng dưới cho mobile
function setupBottomNav() {
  function toggleBottomNav() {
    const bottomNav = document.getElementById('bottomNav');
    if (window.innerWidth <= 480) { // Chỉ hiển thị trên mobile thực sự
      bottomNav.style.display = 'flex';
    } else {
      bottomNav.style.display = 'none';
    }
  }
  
  window.addEventListener('resize', toggleBottomNav);
  toggleBottomNav(); // Gọi lần đầu khi tải trang
}

// Xử lý tìm kiếm
function setupSearch() {
  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderFeed(currentTag, e.target.value);
  });
}

// Khởi tạo trang
function initPage() {
  setupMobileMenu();
  setupScrollToTop();
  setupBottomNav();
  setupSearch();
  
  renderChips();
  renderFeed();
}

// Gọi hàm khởi tạo khi trang đã tải xong
document.addEventListener('DOMContentLoaded', initPage);