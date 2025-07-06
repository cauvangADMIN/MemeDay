// MemeEveryDay - App Logic

// Kết nối Supabase
const supabaseUrl = 'https://zaskyftvhsjsmgdnejos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphc2t5ZnR2aHNqc21nZG5lam9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODcxODgsImV4cCI6MjA2NzM2MzE4OH0.NyEOlbOsyz4s5jsTBvo5-9wt3zbETf3aq-gYHDOO_bM';
// Sửa lại cách khởi tạo client Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Đường dẫn cơ sở đến bucket chứa ảnh meme
const BUCKET_URL = 'https://zaskyftvhsjsmgdnejos.supabase.co/storage/v1/object/public/meme-images/';

// Meme data - Sử dụng đường dẫn từ Supabase bucket
const MEMES = [
  { id: 1, img: `${BUCKET_URL}/meme_01.jpg`, likes: 42, comments: 7, liked: false },
  { id: 2, img: `${BUCKET_URL}/meme_02.jpg`, likes: 28, comments: 5, liked: false },
  { id: 3, img: `${BUCKET_URL}/meme_03.jpg`, likes: 35, comments: 9, liked: false },
  { id: 4, img: `${BUCKET_URL}/meme_04.jpg`, likes: 19, comments: 3, liked: false },
  { id: 5, img: `${BUCKET_URL}/meme_05.jpg`, likes: 56, comments: 12, liked: false },
  { id: 6, img: `${BUCKET_URL}/meme_06.jpg`, likes: 31, comments: 6, liked: false }
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

// Hàm lấy dữ liệu meme từ Supabase
async function fetchMemesFromSupabase() {
  try {
    // Giả sử bạn có bảng 'memes' trong Supabase
    const { data, error } = await supabase
      .from('memes')
      .select('*');
    
    if (error) throw error;
    
    // Cập nhật đường dẫn ảnh để sử dụng bucket
    const processedData = data.map(meme => ({
      ...meme,
      img: `${BUCKET_URL}/${meme.img_filename}` // Giả sử có cột img_filename trong bảng
    }));
    
    return processedData;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu từ Supabase:', error);
    return MEMES; // Trả về dữ liệu mặc định nếu có lỗi
  }
}

// Khởi tạo trang
async function initPage() {
  setupMobileMenu();
  setupScrollToTop();
  setupBottomNav();
  setupSearch();
  
  renderChips();
  
  // Bạn có thể bỏ comment dòng dưới đây nếu muốn lấy dữ liệu từ Supabase
  // const memesData = await fetchMemesFromSupabase();
  // if (memesData && memesData.length > 0) {
  //   MEMES.length = 0; // Xóa dữ liệu cũ
  //   MEMES.push(...memesData); // Thêm dữ liệu mới
  // }
  
  renderFeed();
}

// Gọi hàm khởi tạo khi trang đã tải xong
document.addEventListener('DOMContentLoaded', initPage);