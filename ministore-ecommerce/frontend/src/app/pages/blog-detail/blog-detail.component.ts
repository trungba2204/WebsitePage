import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog.service';
import { NotificationService } from '../../services/notification.service';
import { Blog, BlogComment, CreateBlogCommentRequest } from '../../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit {
  blogService = inject(BlogService);
  notificationService = inject(NotificationService);
  route = inject(ActivatedRoute);
  
  blog: Blog | null = null;
  comments: BlogComment[] = [];
  recentBlogs: Blog[] = [];
  isLoading = true;
  isLiked = false;
  readingProgress = 0;
  
  newComment: CreateBlogCommentRequest = {
    blogId: 0,
    author: '',
    authorEmail: '',
    content: ''
  };
  
  isSubmittingComment = false;

  ngOnInit(): void {
    console.log('🔍 BlogDetailComponent initialized');
    console.log('🔍 NotificationService available:', !!this.notificationService);
    
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadBlog(slug);
        this.loadRecentBlogs();
      }
    });
  }

  loadBlog(slug: string): void {
    this.isLoading = true;
    
    this.blogService.getBlogBySlug(slug).subscribe({
      next: (blog) => {
        this.blog = blog;
        this.newComment.blogId = blog.id;
        this.loadComments(blog.id);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blog:', error);
        this.isLoading = false;
      }
    });
  }

  loadComments(blogId: number): void {
    this.blogService.getBlogComments(blogId).subscribe({
      next: (comments) => {
        this.comments = comments.filter(comment => comment.approved);
      },
      error: (error) => {
        console.error('Error loading comments:', error);
      }
    });
  }

  loadRecentBlogs(): void {
    this.blogService.getRecentBlogs(4).subscribe({
      next: (blogs) => {
        this.recentBlogs = blogs;
      },
      error: (error) => {
        console.error('Error loading recent blogs:', error);
      }
    });
  }

  likeBlog(): void {
    if (!this.blog || this.isLiked) return;
    
    this.blogService.likeBlog(this.blog.id).subscribe({
      next: () => {
        this.isLiked = true;
        if (this.blog) {
          this.blog.likes += 1;
        }
      },
      error: (error) => {
        console.error('Error liking blog:', error);
      }
    });
  }

  onSubmitComment(): void {
    if (!this.validateComment()) {
      return;
    }
    
    this.isSubmittingComment = true;
    
    this.blogService.createComment(this.newComment).subscribe({
      next: (comment) => {
        this.isSubmittingComment = false;
        this.resetCommentForm();
        // Reload comments to show the new one
        if (this.blog) {
          this.loadComments(this.blog.id);
        }
      },
      error: (error) => {
        console.error('Error creating comment:', error);
        this.isSubmittingComment = false;
      }
    });
  }

  private validateComment(): boolean {
    if (!this.newComment.author.trim()) {
      alert('Vui lòng nhập tên của bạn');
      return false;
    }
    
    if (!this.newComment.authorEmail.trim()) {
      alert('Vui lòng nhập email của bạn');
      return false;
    }
    
    if (!this.isValidEmail(this.newComment.authorEmail)) {
      alert('Vui lòng nhập email hợp lệ');
      return false;
    }
    
    if (!this.newComment.content.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return false;
    }
    
    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetCommentForm(): void {
    this.newComment = {
      blogId: this.blog?.id || 0,
      author: '',
      authorEmail: '',
      content: ''
    };
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  copyUrl(): void {
    const url = window.location.href;
    console.log('🔍 Copy URL clicked:', url);
    
    // Check if clipboard API is available
    if (navigator.clipboard && window.isSecureContext) {
      console.log('🔍 Using modern clipboard API');
      navigator.clipboard.writeText(url).then(() => {
        console.log('🔍 Copy successful');
        this.showCopySuccess();
      }).catch((error) => {
        console.error('🔍 Copy failed:', error);
        this.fallbackCopyText(url);
      });
    } else {
      console.log('🔍 Using fallback copy method');
      this.fallbackCopyText(url);
    }
  }

  private showCopySuccess(): void {
    // Show simple alert first to ensure it works
    alert('✅ Đã sao chép link bài viết vào clipboard!');
    
    // Try notification service
    this.notificationService.showSuccess('Thành công!', 'Đã sao chép link bài viết vào clipboard');
    
    // Show custom toast notification
    this.showToast('✅ Đã sao chép link bài viết vào clipboard!', 'success');
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 400px;
      margin: 20px;
      animation: popup 0.3s ease-out;
    `;
    
    modal.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
      <h3 style="color: #28a745; margin-bottom: 10px; font-size: 18px;">Thành công!</h3>
      <p style="color: #666; margin-bottom: 20px; font-size: 14px;">${message}</p>
      <button onclick="this.closest('.modal-overlay').remove()" 
              style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">
        Đóng
      </button>
    `;
    
    overlay.className = 'modal-overlay';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes popup {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Auto close after 3 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
      if (style.parentNode) {
        style.remove();
      }
    }, 3000);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        style.remove();
      }
    });
  }

  private fallbackCopyText(text: string): void {
    // Fallback method for older browsers or non-secure contexts
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('🔍 Fallback copy successful');
        this.showCopySuccess();
      } else {
        throw new Error('execCommand failed');
      }
    } catch (error) {
      console.error('🔍 Fallback copy failed:', error);
      this.notificationService.showError('Lỗi!', 'Không thể sao chép link. Vui lòng copy thủ công: ' + text);
      // Fallback alert for error
      setTimeout(() => {
        alert('❌ Không thể sao chép link. Vui lòng copy thủ công: ' + text);
      }, 100);
    }
  }
}
