// Blog Class - รับผิดชอบจัดการข้อมูล
class Blog {
  constructor(id, title, content) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdDate = new Date();
    this.updatedDate = new Date();
  }
  update(title, content) {
    this.title = title;
    this.content = content;
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
  static fromData(data) {
    let blog = new Blog(data.id, data.title, data.content, data.tags);
    blog.createdDate = new Date(data.createdDate);
    blog.updatedDate = new Date(data.updatedDate);
    return blog;
  }
}
// BlogManager Class - รับผิดชอบจัดการ array ของ Blog
class BlogManager {
  constructor() {
    this.blogs = [];
    this.loadFromLocalStorage();
  }
  addBlog(title, content, tags) {
    const blog = new Blog(Date.now(), title, content, tags);
    this.blogs.push(blog);
    this.sortBlogs();
    this.saveToLocalStorage();
    return blog;
  }
  updateBlog(id, title, content, tags) {
    const blog = this.getBlog(id);
    if (blog) {
      blog.update(title, content, tags);
      this.sortBlogs();
      this.saveToLocalStorage();
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
  sortBlogs() {
    this.blogs.sort((a, b) => b.updatedDate - a.updatedDate);
  }
  saveToLocalStorage() {
    localStorage.setItem("blogs", JSON.stringify(this.blogs));
  }
  loadFromLocalStorage() {
    const data = localStorage.getItem("blogs");
    if (data) {
      try {
        const blogsArray = JSON.parse(data);
        this.blogs = blogsArray.map((blogData) => Blog.fromData(blogData));
        this.sortBlogs();
      } catch (e) {
        console.error("Error parsing blogs from LocalStorage", e);
        this.blogs = [];
      }
    }
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
    this.editIdInput = document.getElementById("edit-id");
    this.formTitle = document.getElementById("form-title");
    this.cancelBtn = document.getElementById("cancel-btn");
    this.blogList = document.getElementById("blog-list");
  }
  initEventListeners() {
    // จัดการการ submit form
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    // จัดการปุ่มยกเลิก
    this.cancelBtn.addEventListener("click", () => {
      this.resetForm();
    });
  }
  handleSubmit() {
    const title = this.titleInput.value.trim();
    const content = this.contentInput.value.trim();
    const editId = parseInt(this.editIdInput.value);
    if (title && content) {
      if (editId) {
        this.blogManager.updateBlog(editId, title, content);
      } else {
        this.blogManager.addBlog(title, content);
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
  resetForm() {
    this.form.reset();
    this.editIdInput.value = "";
    this.formTitle.textContent = "เขียนบล็อกใหม่";
    this.cancelBtn.classList.add("hidden");
  }
  render() {
    this.blogList.innerHTML = this.blogManager.blogs
      .map(
        (blog) => `
                    <div class="blog-post">
                        <h2 class="blog-title">${blog.title}</h2>
                        <div class="blog-date">
                            อัพเดทเมื่อ : ${blog.getFormattedDate()}
                        </div>
                        <div class="blog-content">
                            ${blog.content.replace(/\n/g, "<br>")}
                        </div>
                        <div class="blog-actions">
                            <button class="btn-edit" onclick="blogUI.editBlog(${
                              blog.id
                            })">แก้ไข</button>
                            <button class="btn-delete" onclick="blogUI.deleteBlog(${
                              blog.id
                            })">ลบ</button>
                        </div>
                    </div>
`
      )
      .join("");
  }
}
// สร้าง instance และเริ่มต้นใช้งาน
const blogManager = new BlogManager();
const blogUI = new BlogUI(blogManager);
