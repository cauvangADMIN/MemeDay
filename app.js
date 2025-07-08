// MemeEveryDay - App Logic

// Kết nối Supabase
const supabaseUrl = 'https://zaskyftvhsjsmgdnejos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphc2t5ZnR2aHNqc21nZG5lam9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODcxODgsImV4cCI6MjA2NzM2MzE4OH0.NyEOlbOsyz4s5jsTBvo5-9wt3zbETf3aq-gYHDOO_bM';

let supabase; // <-- chỉ khai báo let, KHÔNG const!

// Đảm bảo thư viện Supabase đã được tải
document.addEventListener('DOMContentLoaded', async function() {
  // Nếu dùng window.supabase thì phải check đúng script đã load xong!
  if (typeof window.supabase === 'undefined') {
    alert('Thư viện Supabase chưa được load!');
    return;
  }
  supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  await initPage();
});

// Đường dẫn cơ sở đến bucket chứa ảnh meme
const BUCKET_URL = 'https://zaskyftvhsjsmgdnejos.supabase.co/storage/v1/object/public/meme-images';

// Meme data - Sẽ được cập nhật từ Supabase
let MEMES = [];

// Chủ đề meme
const TOPICS = [
  { label: "Tổng hợp", icon: "🔍" },
  { label: "Animal", icon: "🐱" },
  { label: "Anime", icon: "🎭" },
  { label: "Human", icon: "👨" },
  { label: "Dark", icon: "🌑" },
  { label: "Game", icon: "🎮" },
  { label: "Sex Joke", icon: "🔞" }
];

// Render meme feed
function renderFeed() {
  const el = document.getElementById("feed");
  if (!MEMES.length) {
    el.innerHTML = '<div class="card"><p>Không có meme nào để hiển thị.</p></div>';
    return;
  }
  el.innerHTML = MEMES.map(meme => `
    <div class="card">
      <div class="post-header">
        <img src="assets/images/admin.jpg" class="post-avatar"/>
        <div><span class="post-author">Admin</span></div>
      </div>
      <div class="meme-container">
        <img src="${meme.img}" class="meme-image" alt="Meme" />
      </div>
      <div class="post-actions">
        <button class="action-btn${meme.liked?' liked':''}" onclick="likeMeme(${meme.id})">
          ❤️ <span>${meme.likes}</span>
        </button>
        <span class="meme-category">${meme.category ? meme.category.toUpperCase() : 'UNCATEGORIZED'}</span>
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
async function likeMeme(id) {
  // Lấy trạng thái like từ localStorage
  const likedMemes = JSON.parse(localStorage.getItem('liked_memes') || '{}');

  if (likedMemes[id]) {
    alert('Bạn đã like meme này rồi!');
    return;
  }

  const idx = MEMES.findIndex(m => m.id === id);
  if (idx < 0) return;
  const meme = MEMES[idx];

  meme.liked = true;
  meme.likes += 1;
  renderFeed();

  // Update DB
  try {
    const { error } = await supabase
      .from('memes')
      .update({ likes: meme.likes })
      .eq('id', id);
    if (error) {
      // Nếu lỗi, rollback lại
      meme.liked = false;
      meme.likes -= 1;
      renderFeed();
      alert("Có lỗi khi lưu like lên server!");
      return;
    }
    // Ghi lại trạng thái đã like vào localStorage
    likedMemes[id] = true;
    localStorage.setItem('liked_memes', JSON.stringify(likedMemes));
  } catch (err) {
    meme.liked = false;
    meme.likes -= 1;
    renderFeed();
    alert("Có lỗi khi lưu like!");
  }
}

// Xử lý filter theo tag
let currentTag = '';
function filterByTag(tag) {
  currentTag = tag === currentTag ? '' : tag;
  renderChips(currentTag);
  // Chuyển đổi category sang chữ thường khi query
  const categoryQuery = currentTag ? currentTag.toLowerCase() : '';
  fetchAndRenderMemes(categoryQuery, 'created_at', false);
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
  
  // Thêm sự kiện click cho các liên kết trong bottom-nav
  const bottomNavLinks = document.querySelectorAll('#bottomNav a');
  bottomNavLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Xóa class active khỏi tất cả các liên kết
      bottomNavLinks.forEach(l => l.classList.remove('active'));
      
      // Thêm class active cho liên kết được click
      this.classList.add('active');
      
      // Đồng bộ với nav bar trên desktop
      const linkText = this.textContent.trim();
      const desktopNavLinks = document.querySelectorAll('.nav a');
      
      desktopNavLinks.forEach(desktopLink => {
        if (desktopLink.textContent.trim() === linkText) {
          // Kích hoạt sự kiện click trên liên kết desktop tương ứng
          desktopLink.click();
        }
      });
    });
  });
}

// Xử lý tìm kiếm
function setupSearch() {
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    if (searchTerm) {
      // Lọc memes theo từ khóa tìm kiếm
      const filteredMemes = MEMES.filter(meme => 
        meme.category && meme.category.toLowerCase().includes(searchTerm)
      );
      // Cập nhật UI với kết quả lọc
      renderFilteredMemes(filteredMemes);
    } else if (currentTag) {
      // Nếu không có từ khóa tìm kiếm nhưng có category, hiển thị theo category
      const categoryQuery = currentTag.toLowerCase();
      fetchAndRenderMemes(categoryQuery, 'created_at', false);
    } else {
      // Nếu không có từ khóa tìm kiếm và không có category, hiển thị tất cả
      fetchAndRenderMemes('', 'created_at', false);
    }
  });
}

// Hàm render memes đã được lọc
function renderFilteredMemes(filteredMemes) {
  const el = document.getElementById("feed");
  if (!filteredMemes.length) {
    el.innerHTML = '<div class="card"><p>Không có meme nào phù hợp với tìm kiếm.</p></div>';
    return;
  }
  el.innerHTML = filteredMemes.map(meme => `
    <div class="card">
      <div class="post-header">
        <img src="assets/images/admin.jpg" class="post-avatar"/>
        <div><span class="post-author">Admin</span></div>
      </div>
      <div class="meme-container">
        <img src="${meme.img}" class="meme-image" alt="Meme" />
      </div>
      <div class="post-actions">
        <button class="action-btn${meme.liked?' liked':''}" onclick="likeMeme(${meme.id})">
          ❤️ <span>${meme.likes}</span>
        </button>
        <span class="meme-category">${meme.category ? meme.category.toUpperCase() : 'UNCATEGORIZED'}</span>
      </div>
    </div>
  `).join('');
}

// Hàm lấy dữ liệu meme từ Supabase
async function fetchMemesFromSupabase(category = '', sortBy = 'created_at', ascending = false) {
  try {
    let query = supabase
      .from('memes')
      .select('*');
    
    // Nếu có category được chọn, thêm điều kiện lọc
    if (category && category !== 'tổng hợp') {
      query = query.eq('category', category);
    }
    
    // Sắp xếp theo trường được chỉ định
    query = query.order(sortBy, { ascending: ascending });
    
    const { data, error } = await query;
    if (error) throw error;

    // Lấy trạng thái liked từ localStorage
    const likedMemes = JSON.parse(localStorage.getItem('liked_memes') || '{}');

    return data.map(meme => ({
      id: meme.id,
      img: `${BUCKET_URL}/${meme.img_filename}`,
      likes: meme.likes || 0,
      liked: !!likedMemes[meme.id],
      category: meme.category || ''
    }));
  } catch (err) {
    console.error('Lỗi khi fetch:', err);
    return [];
  }
}

// Hàm fetch và render memes theo category và sắp xếp
async function fetchAndRenderMemes(category = '', sortBy = 'created_at', ascending = false) {
  MEMES = await fetchMemesFromSupabase(category, sortBy, ascending);
  renderFeed();
}

// Xử lý các nút trên nav bar
function setupNavigation() {
  // Lấy tất cả các liên kết trong nav
  const navLinks = document.querySelectorAll('.nav a');
  
  // Thêm sự kiện click cho từng liên kết
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Xóa class active khỏi tất cả các liên kết
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Thêm class active cho liên kết được click
      this.classList.add('active');
      
      // Xử lý theo từng loại liên kết
      const linkText = this.textContent.trim();
      
      switch(linkText) {
        case 'Trang chủ':
          // Hiển thị tất cả meme, sắp xếp theo created_at mới nhất
          currentTag = '';
          renderChips();
          fetchAndRenderMemes('', 'created_at', false);
          break;
          
        case 'Mới nhất':
          // Hiển thị meme theo created_at, sắp xếp từ mới nhất đến cũ nhất
          currentTag = '';
          renderChips();
          fetchAndRenderMemes('', 'created_at', false);
          break;
          
        case 'Xu hướng':
          // Hiển thị meme theo likes, sắp xếp từ nhiều nhất đến ít nhất
          // Nhưng chỉ lấy những meme mới (trong 7 ngày gần đây)
          currentTag = '';
          renderChips();
          fetchTrendingMemes();
          break;
          
        case 'Yêu thích':
          // Hiển thị meme theo likes, sắp xếp từ nhiều nhất đến ít nhất
          currentTag = '';
          renderChips();
          fetchAndRenderMemes('', 'likes', false);
          break;
      }
    });
  });
}

// Hàm lấy meme xu hướng (mới và nhiều like)
async function fetchTrendingMemes() {
  try {
    // Lấy meme mới (7 ngày gần đây) và sắp xếp theo lượt like
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('likes', { ascending: false });
    
    if (error) throw error;
    
    // Lấy trạng thái liked từ localStorage
    const likedMemes = JSON.parse(localStorage.getItem('liked_memes') || '{}');
    
    MEMES = data.map(meme => ({
      id: meme.id,
      img: `${BUCKET_URL}/${meme.img_filename}`,
      likes: meme.likes || 0,
      liked: !!likedMemes[meme.id],
      category: meme.category || ''
    }));
    
    renderFeed();
  } catch (err) {
    console.error('Lỗi khi fetch xu hướng:', err);
    MEMES = [];
    renderFeed();
  }
}

// Khởi tạo trang
async function initPage() {
  setupMobileMenu();
  setupScrollToTop();
  setupBottomNav();
  setupSearch();
  setupNavigation();
  renderChips();

  // Khi trang web được tải, hiển thị tất cả meme từ database, sắp xếp theo created_at mới nhất
  await fetchAndRenderMemes('', 'created_at', false);
}