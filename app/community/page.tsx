import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';

export default function CommunityPage() {
  const stats = [
    { label: 'Thành viên', value: '10,000+' },
    { label: 'Thảo luận', value: '50,000+' },
    { label: 'Câu trả lời', value: '200,000+' },
    { label: 'Chuyên gia', value: '500+' },
  ];

  const successStories = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      role: 'Full-stack Developer',
      company: 'Tech Corp',
      story: 'Sau 3 tháng học tại WePower, tôi đã tìm được công việc mơ ước với mức lương gấp 3 lần.',
      courses: ['Web Development', 'AI & ML'],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Trần Thị B',
      role: 'Digital Marketing Manager',
      company: 'Marketing Agency',
      story: 'WePower đã giúp tôi chuyển đổi sự nghiệp từ sale sang marketing. Kiến thức thực tế, dễ áp dụng.',
      courses: ['Marketing Digital', 'Business Automation'],
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    },
    {
      id: 3,
      name: 'Lê Văn C',
      role: 'AI Engineer',
      company: 'AI Startup',
      story: 'Từ một sinh viên không có kinh nghiệm, giờ tôi đang làm AI Engineer tại một startup lớn.',
      courses: ['AI & ML', 'Design With AI'],
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    },
  ];

  const topics = [
    { id: 1, title: 'Hỏi đáp về khóa học', posts: 1234, icon: '💬' },
    { id: 2, title: 'Chia sẻ dự án', posts: 567, icon: '🚀' },
    { id: 3, title: 'Tìm việc làm', posts: 890, icon: '💼' },
    { id: 4, title: 'Networking', posts: 456, icon: '🤝' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cộng đồng <span className="text-red">WEPOWER</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
            Kết nối, học hỏi và phát triển cùng hàng ngàn học viên khác
          </p>
          <Button variant="primary" size="xl">
            Tham gia ngay
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-black border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red mb-2">{stat.value}</div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Câu chuyện thành công
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {successStories.map((story) => (
              <div key={story.id} className="bg-black border-2 border-white/10 rounded-xl p-6 hover:border-yellow transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-white">{story.name}</h3>
                    <p className="text-sm text-yellow">{story.role}</p>
                    <p className="text-xs text-white/60">{story.company}</p>
                  </div>
                </div>

                <p className="text-white/70 mb-4 italic">"{story.story}"</p>

                <div className="flex flex-wrap gap-2">
                  {story.courses.map((course, i) => (
                    <span key={i} className="px-2 py-1 bg-red/20 text-red text-xs rounded">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forum Topics */}
      <section className="py-20 bg-black border-t border-white/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Diễn đàn thảo luận
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {topics.map((topic) => (
              <a
                key={topic.id}
                href="#"
                className="bg-black border-2 border-white/10 rounded-xl p-6 hover:border-red hover:shadow-glow-red transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{topic.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white group-hover:text-red transition-colors mb-1">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-white/60">{topic.posts.toLocaleString()} bài viết</p>
                  </div>
                  <svg className="w-6 h-6 text-white/40 group-hover:text-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng tham gia cộng đồng?
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Đăng ký ngay để kết nối với hàng ngàn học viên và chuyên gia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="xl">
              Đăng ký miễn phí
            </Button>
            <Button variant="secondary" size="xl">
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
