import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog.service';
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
}
