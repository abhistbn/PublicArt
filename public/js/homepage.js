document.addEventListener("DOMContentLoaded", () => {
    class ModernHomePage {
        constructor() {
            // --- STATE APLIKASI ---
            this.allArticles = [];
            this.categories = [];
            this.currentCategory = "all";
            this.searchQuery = "";
            this.initialDisplayCount = 4;
            this.isShowingAll = false;

            // --- ELEMEN DOM ---
            this.articlesGrid = document.getElementById("articlesGrid");
            this.categoriesContainer = document.getElementById("categories");
            this.searchInput = document.getElementById("searchInput");
            this.showMoreBtn = document.getElementById("showMoreBtn");
            this.modal = document.getElementById("articleModal");
            this.modalTitle = document.getElementById("modalTitle");
            this.modalContent = document.getElementById("modalContent");
            this.closeBtn = document.querySelector(".close");

            this.init();
        }

        init() {
            this.loadData();
            this.renderCategories();
            this.renderArticles();
            this.setupEventListeners();
            this.setupScrollAnimations();
        }

        loadData() {
            this.categories = this.getSampleCategories();
            this.allArticles = this.getSampleArticles();
            console.log("Data dummy berhasil dimuat.");
        }

        renderCategories() {
            this.categories.forEach((category) => {
                const button = document.createElement("button");
                button.className = "category-btn";
                button.textContent = category.name;
                button.dataset.category = category.id;
                this.categoriesContainer.appendChild(button);
            });
        }

        renderArticles() {
            let filteredArticles = [...this.allArticles];

            // Filter berdasarkan kategori
            if (this.currentCategory !== "all") {
                filteredArticles = filteredArticles.filter(
                    (article) => article.category_id == this.currentCategory
                );
            }

            // Filter berdasarkan query pencarian
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filteredArticles = filteredArticles.filter(
                    (article) =>
                        article.title.toLowerCase().includes(query) ||
                        article.summary.toLowerCase().includes(query)
                );
            }

            // Tentukan artikel yang akan ditampilkan
            const articlesToDisplay = this.isShowingAll
                ? filteredArticles
                : filteredArticles.slice(0, this.initialDisplayCount);

            this.articlesGrid.innerHTML = "";

            if (articlesToDisplay.length === 0) {
                this.articlesGrid.innerHTML = `
                    <div class="no-results">
                        <h3>Tidak ada artikel ditemukan</h3>
                        <p>Coba ubah filter atau kata kunci pencarian Anda.</p>
                    </div>`;
            } else {
                articlesToDisplay.forEach((article, index) => {
                    const articleCard = document.createElement("article");
                    articleCard.className = "article-card fade-in";
                    articleCard.style.animationDelay = `${index * 0.1}s`;

                    const category = this.categories.find(
                        (cat) => cat.id == article.category_id
                    );
                    const categoryName = category ? category.name : "Umum";

                    articleCard.innerHTML = `
                        <div class="article-meta">
                            <span class="article-category">${categoryName}</span>
                            <span class="article-date">${this.formatDate(
                                article.created_at
                            )}</span>
                        </div>
                        <h3 class="article-title">${article.title}</h3>
                        <p class="article-summary">${article.summary}</p>
                        <a href="#" class="read-more" data-article-id="${
                            article.id
                        }">Baca Selengkapnya</a>
                    `;
                    this.articlesGrid.appendChild(articleCard);
                });
            }

            this.updateShowMoreButton(
                filteredArticles.length,
                articlesToDisplay.length
            );
        }

        setupEventListeners() {
            // Category buttons
            this.categoriesContainer.addEventListener("click", (e) => {
                if (e.target.classList.contains("category-btn")) {
                    this.categoriesContainer
                        .querySelectorAll(".category-btn")
                        .forEach((btn) => btn.classList.remove("active"));
                    e.target.classList.add("active");

                    this.currentCategory = e.target.dataset.category;
                    this.isShowingAll = false;
                    this.renderArticles();
                }
            });

            // Search input
            let debounceTimer;
            this.searchInput.addEventListener("input", (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.searchQuery = e.target.value.trim();
                    this.isShowingAll = false;
                    this.renderArticles();
                }, 300);
            });

            // Show More button
            this.showMoreBtn.addEventListener("click", () => {
                this.isShowingAll = true;
                this.renderArticles();
            });

            // Read more links
            this.articlesGrid.addEventListener("click", (e) => {
                if (e.target.classList.contains("read-more")) {
                    e.preventDefault();
                    const articleId = parseInt(e.target.dataset.articleId);
                    this.showArticleModal(articleId);
                }
            });

            // Modal close
            this.closeBtn.addEventListener("click", () => {
                this.closeModal();
            });

            // Close modal when clicking outside
            this.modal.addEventListener("click", (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });

            // Close modal with Escape key
            document.addEventListener("keydown", (e) => {
                if (
                    e.key === "Escape" &&
                    this.modal.style.display === "block"
                ) {
                    this.closeModal();
                }
            });
        }

        showArticleModal(articleId) {
            const article = this.allArticles.find((a) => a.id === articleId);
            if (article) {
                this.modalTitle.textContent = article.title;
                this.modalContent.innerHTML = `
                    <p><strong>Kategori:</strong> ${
                        this.categories.find(
                            (c) => c.id === article.category_id
                        )?.name || "Umum"
                    }</p>
                    <p><strong>Tanggal:</strong> ${this.formatDate(
                        article.created_at
                    )}</p>
                    <br>
                    <p>${article.summary}</p>
                    <br>
                    <div>${article.content}</div>
                `;
                this.modal.style.display = "block";
                document.body.style.overflow = "hidden";
            }
        }

        closeModal() {
            this.modal.style.display = "none";
            document.body.style.overflow = "auto";
        }

        updateShowMoreButton(totalFiltered, currentDisplayed) {
            const showMoreContainer = this.showMoreBtn.parentElement;

            if (
                totalFiltered > this.initialDisplayCount &&
                !this.isShowingAll
            ) {
                showMoreContainer.style.display = "block";
                this.showMoreBtn.textContent = `Lihat Semua (${
                    totalFiltered - currentDisplayed
                } lainnya)`;
            } else {
                showMoreContainer.style.display = "none";
            }
        }

        formatDate(dateString) {
            const date = new Date(dateString);
            const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "Asia/Jakarta",
            };
            return date.toLocaleDateString("id-ID", options);
        }

        setupScrollAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            }, observerOptions);

            // Observe all fade-in elements
            document.querySelectorAll(".fade-in").forEach((el) => {
                observer.observe(el);
            });

            // Re-observe new elements when articles are re-rendered
            const mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (
                            node.nodeType === 1 &&
                            node.classList.contains("fade-in")
                        ) {
                            observer.observe(node);
                        }
                    });
                });
            });

            mutationObserver.observe(this.articlesGrid, {
                childList: true,
                subtree: true,
            });
        }

        // --- DATA DUMMY ---
        getSampleCategories() {
            return [
                { id: 1, name: "Teknologi" },
                { id: 2, name: "Seni & Budaya" },
                { id: 3, name: "Pendidikan" },
                { id: 4, name: "Lingkungan" },
                { id: 5, name: "Sosial" },
                { id: 6, name: "Kesehatan" },
            ];
        }

        getSampleArticles() {
            return [
                {
                    id: 1,
                    title: "Revolusi AI dalam Seni Digital Indonesia",
                    summary:
                        "Bagaimana kecerdasan buatan mengubah lanskap seni digital di Indonesia dan membuka peluang baru bagi seniman lokal.",
                    content: `
                        <p>Kecerdasan buatan (AI) telah menjadi katalisator perubahan besar dalam dunia seni digital Indonesia. Teknologi yang dulunya hanya ada dalam khayalan kini telah menjadi alat bantu yang sangat powerful bagi para seniman Indonesia.</p>
                        
                        <h2>Transformasi Kreativitas</h2>
                        <p>Para seniman lokal kini menggunakan AI untuk menciptakan karya-karya yang sebelumnya tidak mungkin dibuat dengan cara konvensional. Dari lukisan digital yang dihasilkan algoritma hingga instalasi interaktif yang responsif terhadap pengunjung.</p>
                        
                        <h2>Platform dan Tools</h2>
                        <p>Berbagai platform AI seperti Midjourney, DALL-E, dan Stable Diffusion telah diadopsi secara masif oleh komunitas kreatif Indonesia. Hal ini memungkinkan demokratisasi dalam penciptaan seni digital.</p>
                        
                        <h2>Tantangan dan Peluang</h2>
                        <p>Meskipun memberikan banyak kemudahan, penggunaan AI dalam seni juga menimbulkan perdebatan tentang keaslian karya dan peran seniman manusia. Namun, banyak yang melihat ini sebagai evolusi natural dalam dunia seni.</p>
                        
                        <p>Ke depannya, kolaborasi antara manusia dan AI diperkirakan akan semakin erat, menciptakan bentuk-bentuk seni baru yang unik dan inovatif.</p>
                    `,
                    category_id: 1,
                    created_at: "2025-05-20T10:30:00Z",
                },
                {
                    id: 2,
                    title: "Mengenal Seni Jalanan sebagai Media Ekspresi Sosial",
                    summary:
                        "Eksplorasi mendalam tentang bagaimana seni jalanan menjadi suara bagi masyarakat urban dan medium penyampaian pesan sosial.",
                    content: `
                        <p>Seni jalanan atau street art telah berkembang dari sekadar vandalisme menjadi bentuk ekspresi artistik yang legitimate dan berpengaruh dalam masyarakat urban Indonesia.</p>
                        
                        <h2>Sejarah dan Perkembangan</h2>
                        <p>Dimulai dari gerakan underground di kota-kota besar, seni jalanan kini telah diakui sebagai bagian dari budaya visual kontemporer. Jakarta, Bandung, dan Yogyakarta menjadi epicenter perkembangan street art di Indonesia.</p>
                        
                        <h2>Pesan dan Makna</h2>
                        <p>Para street artist menggunakan dinding kota sebagai kanvas untuk menyampaikan kritik sosial, pesan politik, dan refleksi terhadap kondisi masyarakat. Karya-karya mereka sering kali menjadi cermin realitas sosial yang ada.</p>
                        
                        <h2>Teknik dan Gaya</h2>
                        <p>Dari graffiti tradisional hingga mural besar dengan teknik spray paint yang kompleks, variasi dalam seni jalanan sangat beragam. Setiap artist memiliki signature style yang unik.</p>
                        
                        <h2>Dampak Sosial</h2>
                        <p>Seni jalanan tidak hanya memperindah ruang kota, tetapi juga menjadi katalis dialog sosial dan perubahan positif dalam komunitas.</p>
                    `,
                    category_id: 2,
                    created_at: "2025-05-18T14:20:00Z",
                },
                {
                    id: 3,
                    title: "Pendidikan Seni Rupa di Era Digital: Tantangan dan Adaptasi",
                    summary:
                        "Bagaimana institusi pendidikan seni rupa beradaptasi dengan teknologi digital dan mempersiapkan mahasiswa untuk industri kreatif modern.",
                    content: `
                        <p>Dunia pendidikan seni rupa mengalami transformasi besar-besaran di era digital. Institusi pendidikan kini harus menyeimbangkan antara teknik tradisional dan kemampuan digital untuk mempersiapkan lulusan yang kompetitif.</p>
                        
                        <h2>Kurikulum Terintegrasi</h2>
                        <p>Perguruan tinggi seni kini mengintegrasikan mata kuliah digital art, 3D modeling, dan multimedia dalam kurikulum mereka. Hal ini memastikan mahasiswa memiliki skill set yang lengkap.</p>
                        
                        <h2>Fasilitas dan Teknologi</h2>
                        <p>Investasi dalam perangkat digital seperti tablet grafis, software design terbaru, dan studio multimedia menjadi prioritas utama institusi pendidikan seni.</p>
                        
                        <h2>Metode Pembelajaran</h2>
                        <p>Penggunaan virtual reality, augmented reality, dan platform pembelajaran online telah mengubah cara mahasiswa belajar dan berinteraksi dengan materi seni.</p>
                        
                        <h2>Persiapan Industri</h2>
                        <p>Kerjasama dengan industri kreatif membantu mahasiswa memahami kebutuhan pasar dan mempersiapkan mereka untuk berkarir sebagai digital artist, animator, atau desainer multimedia.</p>
                        
                        <p>Adaptasi ini penting untuk memastikan relevansi pendidikan seni rupa dengan perkembangan zaman dan kebutuhan industri.</p>
                    `,
                    category_id: 3,
                    created_at: "2025-05-15T09:45:00Z",
                },
                {
                    id: 4,
                    title: "Seni Ramah Lingkungan: Kreativitas untuk Keberlanjutan",
                    summary:
                        "Gerakan seniman Indonesia yang menggunakan material daur ulang dan konsep berkelanjutan dalam berkarya.",
                    content: `
                        <p>Kesadaran lingkungan telah mendorong para seniman Indonesia untuk berinovasi dengan material ramah lingkungan dan konsep sustainability dalam berkarya seni.</p>
                        
                        <h2>Material Berkelanjutan</h2>
                        <p>Penggunaan material daur ulang seperti plastik bekas, kertas koran, dan limbah elektronik telah menjadi tren dalam seni kontemporer Indonesia. Seniman menemukan cara kreatif untuk mengubah sampah menjadi karya seni bernilai tinggi.</p>
                        
                        <h2>Konsep Eco-Art</h2>
                        <p>Eco-art atau seni ramah lingkungan tidak hanya tentang material, tetapi juga tentang pesan yang disampaikan. Banyak karya yang mengangkat isu perubahan iklim, polusi, dan konservasi alam.</p>
                        
                        <h2>Komunitas dan Kolaborasi</h2>
                        <p>Terbentuknya komunitas seniman peduli lingkungan yang berkolaborasi dengan aktivis lingkungan dan organisasi non-profit untuk menciptakan dampak yang lebih luas.</p>
                        
                        <h2>Pameran Berkelanjutan</h2>
                        <p>Penyelenggaraan pameran seni dengan konsep zero waste dan carbon neutral menjadi standar baru dalam dunia seni Indonesia.</p>
                        
                        <p>Gerakan ini menunjukkan bahwa seni tidak hanya tentang keindahan, tetapi juga tentang tanggung jawab terhadap planet bumi.</p>
                    `,
                    category_id: 4,
                    created_at: "2025-05-12T16:30:00Z",
                },
                {
                    id: 5,
                    title: "Peran Seni dalam Membangun Harmoni Sosial",
                    summary:
                        "Analisis tentang bagaimana seni dapat menjadi jembatan untuk mempersatukan perbedaan dalam masyarakat yang beragam.",
                    content: `
                        <p>Indonesia dengan keberagaman budaya, agama, dan etnisnya membutuhkan media untuk membangun harmoni sosial. Seni terbukti menjadi salah satu alat yang paling efektif untuk menyatukan perbedaan.</p>
                        
                        <h2>Seni sebagai Bahasa Universal</h2>
                        <p>Seni memiliki kemampuan unik untuk menyampaikan pesan tanpa terbatas oleh bahasa verbal. Lukisan, patung, tari, dan musik dapat dipahami oleh siapa saja, terlepas dari latar belakang budaya mereka.</p>
                        
                        <h2>Program Seni Komunitas</h2>
                        <p>Berbagai program seni komunitas telah berhasil mempertemukan kelompok-kelompok yang berbeda. Workshop bersama, festival seni multikultural, dan proyek kolaboratif antar komunitas menjadi contoh sukses.</p>
                        
                        <h2>Seni Partisipatif</h2>
                        <p>Konsep seni partisipatif di mana masyarakat tidak hanya menjadi penonton tetapi juga terlibat aktif dalam proses kreatif telah terbukti efektif membangun empati dan pemahaman.</p>
                        
                        <h2>Media Sosial dan Seni</h2>
                        <p>Platform digital memberikan ruang baru bagi seniman untuk menyebarkan pesan perdamaian dan toleransi kepada audiens yang lebih luas.</p>
                        
                        <p>Melalui seni, masyarakat dapat belajar menghargai perbedaan dan menemukan kesamaan dalam kemanusiaan.</p>
                    `,
                    category_id: 5,
                    created_at: "2025-05-10T11:15:00Z",
                },
                {
                    id: 6,
                    title: "Art Therapy: Menyembuhkan Jiwa Melalui Kreativitas",
                    summary:
                        "Eksplorasi tentang penggunaan seni sebagai terapi untuk kesehatan mental dan pemulihan trauma.",
                    content: `
                        <p>Art therapy atau terapi seni telah diakui secara medis sebagai metode efektif untuk membantu penyembuhan mental dan emosional. Di Indonesia, praktik ini mulai berkembang dan memberikan harapan baru bagi mereka yang membutuhkan dukungan psikologis.</p>
                        
                        <h2>Mekanisme Terapi Seni</h2>
                        <p>Proses berkarya seni melibatkan berbagai bagian otak yang dapat membantu mengekspresikan emosi yang sulit diungkapkan dengan kata-kata. Aktivitas kreatif merangsang produksi endorfin yang meningkatkan mood dan mengurangi stres.</p>
                        
                        <h2>Jenis-jenis Art Therapy</h2>
                        <p>Mulai dari lukis, gambar, patung, kolase, hingga seni digital, setiap medium memiliki manfaat terapeutik yang berbeda. Pilihan medium disesuaikan dengan kebutuhan dan kondisi klien.</p>
                        
                        <h2>Aplikasi Klinis</h2>
                        <p>Art therapy telah terbukti efektif untuk menangani berbagai kondisi seperti depresi, trauma, gangguan kecemasan, dan membantu proses pemulihan dari addiction.</p>
                        
                        <h2>Pelatihan Terapis</h2>
                        <p>Indonesia mulai mengembangkan program pelatihan art therapist yang terstandarisasi untuk memastikan kualitas layanan yang diberikan kepada masyarakat.</p>
                        
                        <h2>Integrasi dengan Sistem Kesehatan</h2>
                        <p>Beberapa rumah sakit dan klinik kesehatan mental di Indonesia telah mulai mengintegrasikan art therapy dalam program rehabilitasi mereka.</p>
                        
                        <p>Ke depannya, art therapy diharapkan dapat menjadi alternatif atau komplemen yang lebih accessible untuk mendukung kesehatan mental masyarakat Indonesia.</p>
                    `,
                    category_id: 6,
                    created_at: "2025-05-08T13:45:00Z",
                },
                {
                    id: 7,
                    title: "Blockchain dan NFT: Revolusi Baru dalam Dunia Seni Digital",
                    summary:
                        "Dampak teknologi blockchain dan NFT terhadap cara seniman menjual dan melindungi karya digital mereka.",
                    content: `
                        <p>Teknologi blockchain dan Non-Fungible Token (NFT) telah membawa revolusi dalam cara seniman digital menjual, melindungi, dan mendistribusikan karya mereka. Indonesia pun tidak ketinggalan dalam tren global ini.</p>
                        
                        <h2>Memahami NFT Art</h2>
                        <p>NFT memungkinkan seniman untuk menciptakan sertifikat digital unik untuk karya seni digital mereka. Ini memberikan provenance dan authenticity yang sebelumnya sulit dicapai dalam dunia digital.</p>
                        
                        <h2>Peluang Ekonomi Baru</h2>
                        <p>Platform NFT memberikan akses global bagi seniman Indonesia untuk menjual karya mereka tanpa perlu melalui galeri tradisional. Beberapa seniman Indonesia telah meraih kesuksesan significant di marketplace internasional.</p>
                        
                        <h2>Tantangan dan Kritik</h2>
                        <p>Isu lingkungan dari energy consumption blockchain, volatilitas harga, dan pertanyaan tentang nilai intrinsik NFT menjadi perdebatan hangat dalam komunitas seni.</p>
                        
                        <h2>Edukasi dan Literasi</h2>
                        <p>Pentingnya edukasi tentang teknologi blockchain bagi seniman Indonesia agar dapat memanfaatkan peluang ini dengan bijak dan menghindari penipuan.</p>
                        
                        <p>Meskipun masih dalam tahap awal, teknologi ini berpotensi mengubah fundamental ekosistem seni digital di Indonesia.</p>
                    `,
                    category_id: 1,
                    created_at: "2025-05-05T08:20:00Z",
                },
                {
                    id: 8,
                    title: "Revitalisasi Seni Tradisional Melalui Media Modern",
                    summary:
                        "Bagaimana seniman muda Indonesia menghidupkan kembali seni tradisional dengan pendekatan kontemporer.",
                    content: `
                        <p>Generasi muda seniman Indonesia menemukan cara inovatif untuk melestarikan dan merevitalisasi seni tradisional melalui medium dan platform modern, menciptakan hybrid yang menarik antara tradisi dan kontemporer.</p>
                        
                        <h2>Digitalisasi Motif Tradisional</h2>
                        <p>Motif batik, ukiran, dan ornamen tradisional lainnya ditransformasi menjadi digital art yang dapat diaplikasikan dalam berbagai medium modern seperti fashion, product design, dan visual communication.</p>
                        
                        <h2>Animasi dan Motion Graphics</h2>
                        <p>Cerita rakyat dan mitologi Indonesia dihidupkan kembali melalui animasi modern, motion graphics, dan interactive media yang menarik bagi generasi digital native.</p>
                        
                        <h2>Fusion Performance</h2>
                        <p>Pertunjukan seni yang menggabungkan tarian tradisional dengan teknologi projection mapping, musik elektronik, dan multimedia installation menciptakan experience yang immersive.</p>
                        
                        <h2>Platform Digital untuk Edukasi</h2>
                        <p>Aplikasi mobile, virtual reality, dan augmented reality digunakan untuk mengajarkan seni tradisional kepada generasi muda dengan cara yang interaktif dan engaging.</p>
                        
                        <h2>Kolaborasi Lintas Generasi</h2>
                        <p>Kerjasama antara maestro seni tradisional dengan seniman muda digital menciptakan transfer knowledge yang berharga dan karya-karya inovatif.</p>
                        
                        <p>Pendekatan ini memastikan bahwa warisan budaya Indonesia tidak hanya dilestarikan tetapi juga tetap relevan dan menarik bagi generasi mendatang.</p>
                    `,
                    category_id: 2,
                    created_at: "2025-05-03T15:10:00Z",
                },
            ];
        }
    }

    // Initialize the application
    new ModernHomePage();
});
