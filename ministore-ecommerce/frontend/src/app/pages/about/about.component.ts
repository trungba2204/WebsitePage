import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  image: string;
  bio: string;
  isActive: boolean;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ImageFallbackDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  
  teamMembers: TeamMember[] = [];
  isLoading = false;

  constructor(private http: HttpClient) {}

  // Expose encodeURIComponent to template
  encodeURIComponent = encodeURIComponent;

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.isLoading = true;
    this.http.get<TeamMember[]>(`${environment.apiUrl}/team`).subscribe({
      next: (members) => {
        this.teamMembers = members;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        // Fallback to default team member if API fails
        this.teamMembers = [
          {
            id: 1,
            name: 'Team Đoàn Kết Hai Bà Trưng',
            position: 'Đội ngũ phát triển MiniStore',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
            bio: 'Đội ngũ tài năng và đoàn kết, với tinh thần sáng tạo và cam kết mang đến những sản phẩm tốt nhất cho khách hàng. Chúng tôi cùng nhau xây dựng MiniStore thành nền tảng thương mại điện tử hàng đầu Việt Nam.',
            isActive: true
          }
        ];
        this.isLoading = false;
      }
    });
  }

  milestones = [
    {
      year: '2020',
      title: 'Thành lập công ty',
      description: 'MiniStore được thành lập với tầm nhìn trở thành nền tảng thương mại điện tử hàng đầu Việt Nam.'
    },
    {
      year: '2021',
      title: 'Ra mắt phiên bản đầu tiên',
      description: 'Phát hành phiên bản beta với hơn 1000 sản phẩm và 100 đối tác đầu tiên.'
    },
    {
      year: '2022',
      title: 'Mở rộng thị trường',
      description: 'Mở rộng dịch vụ đến 50 tỉnh thành với hơn 10,000 sản phẩm.'
    },
    {
      year: '2023',
      title: 'Đạt 1 triệu người dùng',
      description: 'Cột mốc quan trọng với 1 triệu người dùng đăng ký và hàng nghìn đơn hàng mỗi ngày.'
    },
    {
      year: '2024',
      title: 'Ra mắt ứng dụng di động',
      description: 'Phát hành ứng dụng di động với tính năng mua sắm tiện lợi và thanh toán nhanh chóng.'
    }
  ];

  values = [
    {
      icon: 'bi-people-fill',
      title: 'Đoàn kết',
      description: 'Tinh thần đoàn kết của Team Đoàn Kết Hai Bà Trưng là nền tảng cho mọi thành công. Chúng tôi cùng nhau vượt qua mọi thử thách.'
    },
    {
      icon: 'bi-lightning-fill',
      title: 'Sáng tạo',
      description: 'Không ngừng đổi mới và cải tiến công nghệ để mang đến những sản phẩm và dịch vụ tốt nhất cho khách hàng.'
    },
    {
      icon: 'bi-trophy-fill',
      title: 'Thành công',
      description: 'Với tinh thần đoàn kết và sáng tạo, Team Đoàn Kết Hai Bà Trưng luôn hướng tới thành công trong mọi dự án.'
    },
    {
      icon: 'bi-heart-fill',
      title: 'Tận tâm phục vụ',
      description: 'Đội ngũ Team Đoàn Kết Hai Bà Trưng tận tâm, chuyên nghiệp luôn sẵn sàng hỗ trợ khách hàng 24/7.'
    }
  ];
}
