import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  image: string;
  bio: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTeamMemberRequest {
  name: string;
  position: string;
  image: string;
  bio: string;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-team',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-team.component.html',
  styleUrl: './admin-team.component.scss'
})
export class AdminTeamComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  isLoading = false;
  isDeleting = false;
  deletingMemberId: number | null = null;

  // Form data
  showForm = false;
  editingMember: TeamMember | null = null;
  formData: CreateTeamMemberRequest = {
    name: '',
    position: '',
    image: '',
    bio: '',
    isActive: true
  };

  // Image upload states
  isUploadingImage = false;
  selectedImageFile: File | null = null;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.isLoading = true;
    this.adminService.getTeamMembers().subscribe({
      next: (members) => {
        this.teamMembers = members;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.notificationService.showError('Lỗi!', 'Không thể tải danh sách thành viên');
        this.isLoading = false;
      }
    });
  }

  showAddForm(): void {
    this.editingMember = null;
    this.formData = {
      name: '',
      position: '',
      image: '',
      bio: '',
      isActive: true
    };
    this.selectedImageFile = null;
    this.showForm = true;
  }

  showEditForm(member: TeamMember): void {
    this.editingMember = member;
    this.formData = {
      name: member.name,
      position: member.position,
      image: member.image,
      bio: member.bio,
      isActive: member.isActive
    };
    this.selectedImageFile = null;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingMember = null;
    this.formData = {
      name: '',
      position: '',
      image: '',
      bio: '',
      isActive: true
    };
    this.selectedImageFile = null;
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError('Lỗi!', 'Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      
      // Check for HEIC format (not supported by web browsers)
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
        this.notificationService.showError('Lỗi!', 'Định dạng HEIC không được hỗ trợ trên web. Vui lòng chọn file JPG, PNG, GIF hoặc WEBP.');
        return;
      }
      
      // Check for web-compatible formats
      const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!supportedTypes.includes(file.type)) {
        this.notificationService.showError('Lỗi!', 'Chỉ hỗ trợ định dạng JPG, PNG, GIF và WEBP. Vui lòng chọn file khác.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showError('Lỗi!', 'Kích thước file không được vượt quá 5MB');
        return;
      }
      
      this.selectedImageFile = file;
      this.uploadImage(file);
    }
  }

  private uploadImage(file: File): void {
    this.isUploadingImage = true;
    
    this.adminService.uploadImage(file).subscribe({
      next: (response) => {
        this.formData.image = response.url;
        this.isUploadingImage = false;
        this.notificationService.showSuccess('Thành công!', 'Ảnh đại diện đã được tải lên');
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.isUploadingImage = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải lên ảnh đại diện');
        this.selectedImageFile = null;
      }
    });
  }

  removeImage(): void {
    this.formData.image = '';
    this.selectedImageFile = null;
  }

  saveMember(): void {
    if (!this.validateForm()) {
      return;
    }

    const request = { ...this.formData };

    if (this.editingMember) {
      // Update existing member
      this.adminService.updateTeamMember(this.editingMember.id, request).subscribe({
        next: (updatedMember) => {
          const index = this.teamMembers.findIndex(m => m.id === this.editingMember!.id);
          if (index !== -1) {
            this.teamMembers[index] = updatedMember;
          }
          this.notificationService.showSuccess('Thành công!', 'Cập nhật thành viên thành công');
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error updating team member:', error);
          this.notificationService.showError('Lỗi!', 'Không thể cập nhật thành viên');
        }
      });
    } else {
      // Create new member
      this.adminService.createTeamMember(request).subscribe({
        next: (newMember) => {
          this.teamMembers.push(newMember);
          this.notificationService.showSuccess('Thành công!', 'Thêm thành viên thành công');
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error creating team member:', error);
          this.notificationService.showError('Lỗi!', 'Không thể thêm thành viên');
        }
      });
    }
  }

  deleteMember(member: TeamMember): void {
    if (confirm(`Bạn có chắc chắn muốn xóa thành viên "${member.name}"?`)) {
      this.isDeleting = true;
      this.deletingMemberId = member.id;
      
      this.adminService.deleteTeamMember(member.id).subscribe({
        next: () => {
          this.teamMembers = this.teamMembers.filter(m => m.id !== member.id);
          this.notificationService.showSuccess('Thành công!', 'Xóa thành viên thành công');
          this.isDeleting = false;
          this.deletingMemberId = null;
        },
        error: (error) => {
          console.error('Error deleting team member:', error);
          this.notificationService.showError('Lỗi!', 'Không thể xóa thành viên');
          this.isDeleting = false;
          this.deletingMemberId = null;
        }
      });
    }
  }

  private validateForm(): boolean {
    if (!this.formData.name.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập tên thành viên');
      return false;
    }
    if (!this.formData.position.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập vị trí');
      return false;
    }
    if (!this.formData.image.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng chọn ảnh đại diện');
      return false;
    }
    if (!this.formData.bio.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập mô tả');
      return false;
    }
    return true;
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-secondary';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Hoạt động' : 'Không hoạt động';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
}
