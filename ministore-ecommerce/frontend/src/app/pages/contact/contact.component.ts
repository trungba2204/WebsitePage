import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  notificationService = inject(NotificationService);
  
  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
  
  isSubmitting = false;
  
  contactInfo = [
    {
      icon: 'bi-geo-alt-fill',
      title: 'Địa chỉ',
      details: ['123 Đường ABC, Quận 1', 'TP. Hồ Chí Minh, Việt Nam'],
      color: 'text-primary'
    },
    {
      icon: 'bi-telephone-fill',
      title: 'Điện thoại',
      details: ['+84 123 456 789', '+84 987 654 321'],
      color: 'text-success'
    },
    {
      icon: 'bi-envelope-fill',
      title: 'Email',
      details: ['contact@ministore.com', 'support@ministore.com'],
      color: 'text-info'
    },
    {
      icon: 'bi-clock-fill',
      title: 'Giờ làm việc',
      details: ['Thứ 2 - Thứ 6: 8:00 - 18:00', 'Thứ 7 - CN: 9:00 - 17:00'],
      color: 'text-warning'
    }
  ];
  
  faqs = [
    {
      question: 'Làm thế nào để đặt hàng?',
      answer: 'Bạn có thể đặt hàng dễ dàng bằng cách thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán khác nhau.'
    },
    {
      question: 'Thời gian giao hàng là bao lâu?',
      answer: 'Thời gian giao hàng thường từ 1-3 ngày làm việc đối với nội thành và 3-7 ngày đối với các tỉnh thành khác, tùy thuộc vào địa điểm giao hàng.'
    },
    {
      question: 'Có thể đổi trả sản phẩm không?',
      answer: 'Chúng tôi hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng, với điều kiện sản phẩm còn nguyên vẹn và có hóa đơn mua hàng.'
    },
    {
      question: 'Làm thế nào để theo dõi đơn hàng?',
      answer: 'Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản và vào mục "Đơn hàng của tôi". Chúng tôi cũng sẽ gửi thông tin cập nhật qua email.'
    },
    {
      question: 'Có hỗ trợ khách hàng 24/7 không?',
      answer: 'Chúng tôi có đội ngũ hỗ trợ khách hàng từ 8:00 - 18:00 (Thứ 2-6) và 9:00 - 17:00 (Thứ 7-CN). Bạn có thể liên hệ qua hotline hoặc email.'
    }
  ];
  
  expandedFaq: number | null = null;
  
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Simulate form submission
    setTimeout(() => {
      this.isSubmitting = false;
      this.notificationService.showSuccess(
        'Gửi tin nhắn thành công!',
        'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.'
      );
      this.resetForm();
    }, 2000);
  }
  
  private validateForm(): boolean {
    if (!this.contactForm.name.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập họ tên');
      return false;
    }
    
    if (!this.contactForm.email.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập email');
      return false;
    }
    
    if (!this.isValidEmail(this.contactForm.email)) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập email hợp lệ');
      return false;
    }
    
    if (!this.contactForm.subject.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập chủ đề');
      return false;
    }
    
    if (!this.contactForm.message.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập nội dung tin nhắn');
      return false;
    }
    
    return true;
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  private resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  }
  
  toggleFaq(index: number): void {
    this.expandedFaq = this.expandedFaq === index ? null : index;
  }
}
