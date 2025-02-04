// Blog Class - รับผิดชอบจัดการข้อมูล
class Blog {
    constructor(id, title, content, tags = "", createdDate = new Date(), updatedDate = new Date()) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.tags = tags.split(",").map(tag => tag.trim()).filter(tag => tag); // แปลงเป็น array
        this.createdDate = new Date(createdDate);
        this.updatedDate = new Date(updatedDate);
    }
    update(title, content, tags) {
        this.title = title;
        this.content = content;
        this.tags = tags.split(",").map(tag => tag.trim()).filter(tag => tag); // อัปเดตแท็ก
        this.updatedDate = new Date();
    }
    getFormattedDate() {
        return this.updatedDate.toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
}

// BlogManager Class - รับผิดชอบจัดการ array ของ Blog
class BlogManager {
    constructor() {
        this.blogs = this.loadFromLocalStorage();
    }
    addBlog(title, content, tags) {
        const blog = new Blog(Date.now(), title, content, tags);
        this.blogs.push(blog);
        this.saveToLocalStorage();
        this.sortBlogs();
        return blog;
    }
    updateBlog(id, title, content, tags) {
        const blog = this.getBlog(id);
        if (blog) {
            blog.update(title, content, tags);
            this.saveToLocalStorage();
            this.sortBlogs();
        }
        return blog;
    }
    deleteBlog(id) {
        this.blogs = this.blogs.filter((blog) => blog.id !== id);
        this.saveToLocalStorage();
    }
    getBlog(id) {
        return this.blogs.find((blog) => blog.id === id);
    }
    searchBlogs(keyword) {
        return this.blogs.filter(
            (blog) =>
                blog.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        );
    }
    filterByTag(tag) {
        return this.blogs.filter(blog => blog.tags.includes(tag));
    }
    sortBlogs() {
        this.blogs.sort((a, b) => b.updatedDate - a.updatedDate);
    }
    saveToLocalStorage() {
        localStorage.setItem("blogs", JSON.stringify(this.blogs));
    }
    loadFromLocalStorage() {
        const data = localStorage.getItem("blogs");
        if (data) {
            return JSON.parse(data).map(
                (blog) => new Blog(
                    blog.id,
                    blog.title,
                    blog.content,
                    Array.isArray(blog.tags) ? blog.tags.join(",") : blog.tags || "",
                    blog.createdDate,
                    blog.updatedDate
                )
            );
        }
        return [];
    }
}

// UI Class - รับผิดชอบจัดการ DOM และ Event
class BlogUI {
    constructor(blogManager) {
        this.blogManager = blogManager;
        this.initElements();
        this.initEventListeners();
        this.render();
    }
    initElements() {
        this.form = document.getElementById("blog-form");
        this.titleInput = document.getElementById("title");
        this.contentInput = document.getElementById("content");
        this.tagsInput = document.getElementById("tags"); // Input ของแท็ก
        this.editIdInput = document.getElementById("edit-id");
        this.formTitle = document.getElementById("form-title");
        this.cancelBtn = document.getElementById("cancel-btn");
        this.blogList = document.getElementById("blog-list");
        this.searchInput = document.getElementById("search");
    }
    initEventListeners() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        this.cancelBtn.addEventListener("click", () => {
            this.resetForm();
        });
        this.searchInput.addEventListener("input", () => {
            this.render(this.searchInput.value.trim());
        });
    }
    handleSubmit() {
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();
        const tags = this.tagsInput.value.trim();
        const editId = parseInt(this.editIdInput.value);
        if (title && content) {
            if (editId) {
                this.blogManager.updateBlog(editId, title, content, tags);
            } else {
                this.blogManager.addBlog(title, content, tags);
            }
            this.resetForm();
            this.render();
        }
    }
    editBlog(id) {
        const blog = this.blogManager.getBlog(id);
        if (blog) {
            this.titleInput.value = blog.title;
            this.contentInput.value = blog.content;
            this.tagsInput.value = blog.tags.join(", ");
            this.editIdInput.value = blog.id;
            this.formTitle.textContent = "แก้ไขบล็อก";
            this.cancelBtn.classList.remove("hidden");
            window.scrollTo(0, 0);
        }
    }
    deleteBlog(id) {
        if (confirm("ต้องการลบบล็อกนี้ใช่หรือไม่")) {
            this.blogManager.deleteBlog(id);
            this.render();
        }
    }
    filterByTag(tag) {
        this.searchInput.value = tag; // ตั้งค่าในช่องค้นหา
        this.render(tag);
    }
    resetForm() {
        this.form.reset();
        this.editIdInput.value = "";
        this.formTitle.textContent = "เขียนบล็อกใหม่";
        this.cancelBtn.classList.add("hidden");
    }
    render(keyword = "") {
        const blogs = keyword ? this.blogManager.searchBlogs(keyword) : this.blogManager.blogs;
        this.blogList.innerHTML = blogs
            .map(
                (blog) => `
                    <div class="blog-post">
                        <h2 class="blog-title">${blog.title}</h2>
                        <div class="blog-date">อัปเดตล่าสุด: ${blog.getFormattedDate()}</div>
                        <div class="blog-content">${blog.content.replace(/\n/g, "<br>")}</div>
                        <div class="blog-tags">
                            แท็ก: ${blog.tags.map(tag => `<span class="tag" onclick="blogUI.filterByTag('${tag}')">${tag}</span>`).join(", ")}
                        </div>
                        <div class="blog-actions">
                            <button class="btn-edit" onclick="blogUI.editBlog(${blog.id})">แก้ไข</button>
                            <button class="btn-delete" onclick="blogUI.deleteBlog(${blog.id})">ลบ</button>
                        </div>
                    </div>`
            )
            .join("");
    }
}

// สร้าง instance และเริ่มต้นใช้งาน
const blogManager = new BlogManager();
const blogUI = new BlogUI(blogManager);